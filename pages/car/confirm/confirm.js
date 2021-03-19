const app = getApp();
Page({
  data: {
    urlHeader: app.globalData.urlHeader,
    picker: ['店家送上门', '客户送上门', '店家上门取', '客户上门取'],
    time: "09:00"
  },
  onLoad: function () {
    wx.showLoading({
      titel: "加载中",
      mask: true
    });
    //加载默认地址
    this.getDefaultAdress();
    //加载订单中的商品信息
    this.setGoods();
    //初始化配送方式选择器
    this.setPicker();
    //初始化日期选择器
    this.setDate();
  },
  //页面每次显示时，更新选中的地址信息
  onShow: async function () {
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    if (this.data.addressId) this.changeAdress(this.data.addressId);
    else this.getDefaultAdress();
  },
  //获取默认地址
  async getDefaultAdress() {
    let that = this;
    let url = this.data.urlHeader + "/address/getDefaultAddress";
    let cookie = await app.getCookie();
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "cookie": cookie
      },
      method: "GET",
      success: (res) => {
        if (res.data.receiverName) {
          that.setData({
            name: res.data.receiverName,
            phoneNum: res.data.mobile,
            area: res.data.area.replace(/,/g, ""),
            streetAddress: res.data.streetAddress,
            addressId: res.data.id
          })
        } else {
          that.setData({
            name: undefined,
            phoneNum: undefined,
            area: undefined,
            streetAddress: undefined,
            addressId: undefined
          })
        }
        wx.hideLoading();
      },
      fail: (err) => {
        wx.hideLoading();
        console.log(err);
      }
    })
  },
  //加载商品信息
  setGoods() {
    let goods = app.globalData.goods;
    let goodsAmount = 0;
    let goodsNum = 0;
    goods.forEach(element => {
      goodsAmount += element.price * element.count;
      goodsNum += element.count;
    });
    this.setData({
      goods: goods,
      goodsAmount: goodsAmount,
      goodsNum: goodsNum
    })
  },
  setPicker() {
    let picker = this.data.picker;
    this.setData({
      diliver: picker[0]
    });
  },
  setDate() {
    let nowDate = new Date().getTime();
    let startDate = `${new Date(nowDate + 24*60*60*1000).getFullYear()}-${new Date(nowDate + 24*60*60*1000).getMonth() + 1}-${new Date(nowDate + 24*60*60*1000).getDate()}`;
    let endDate = `${new Date(nowDate + 7*24*60*60*1000).getFullYear()}-${new Date(nowDate + 7*24*60*60*1000).getMonth() + 1}-${new Date(nowDate + 7*24*60*60*1000).getDate()}`;
    this.setData({
      startDate: startDate,
      endDate: endDate,
      date: startDate,
    })
  },
  PickerChange(e) {
    let picker = this.data.picker;
    this.setData({
      diliver: picker[e.detail.value]
    })
  },
  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  TimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },
  //修改留言
  changeLeaveWord(e) {
    this.setData({
      leaveWord: e.detail.value
    })
  },
  //根据选中的地址id加载地址信息
  async changeAdress(id) {
    let that = this;
    let url = this.data.urlHeader + "/address/get";
    let cookie = await app.getCookie();
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "cookie": cookie
      },
      method: "POST",
      data: {
        addressId: id
      },
      success: (res) => {
        if (res.data.receiverName) {
          that.setData({
            name: res.data.receiverName,
            phoneNum: res.data.mobile,
            area: res.data.area.replace(/,/g, ""),
            streetAddress: res.data.streetAddress,
            addressId: res.data.id
          })
        } else {
          that.setData({
            name: undefined,
            phoneNum: undefined,
            area: undefined,
            streetAddress: undefined,
            addressId: undefined
          })
        }
        wx.hideLoading();
      },
      fail: (err) => {
        wx.hideLoading();
        console.log(err);
      }
    })
  },
  //提交订单的总方法
  async submitOrder() {
    if (this.data.addressId) {
      let form = this.getOrderInfor();
      let orderId = await this.getOrderId(form);
      let payInfor = await this.getPayInfor(orderId);
      this.pay(payInfor);
    } else {
      wx.showToast({
        title: "请选择收货地址！",
        icon: "none"
      })
    }
  },
  //获取提交订单所需要的订单信息
  getOrderInfor() {
    let form = {};
    form.addressId = this.data.addressId;
    form.pattern = this.data.diliver;
    form.paymentMethod = "微信支付";
    if (this.data.leaveWord) form.leaveWord = this.data.leaveWord;
    form.servicingTime = `${this.data.date} ${this.data.time}:00`;
    form.goodsAmount = this.data.goodsAmount;
    form.freightCharge = 0;
    form.actualAmount = this.data.goodsAmount;
    let goods = app.globalData.goods;
    let i = 0;
    goods.forEach(element => {
      let specificationId = "orderItems[" + i + "].specificationId";
      let buynum = "orderItems[" + i + "].buynum";
      let unitPrice = "orderItems[" + i + "].unitPrice";
      form[specificationId] = element.specificationId;
      form[buynum] = element.count;
      form[unitPrice] = element.price;
      i++;
    });
    return form;
  },
  //调用api接口，通过订单信息获取订单号
  getOrderId(form) {
    return new Promise(async (resolve, reject) => {
      let url = this.data.urlHeader + "/order/save";
      let cookie = await app.getCookie();
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "cookie": cookie
        },
        method: "POST",
        data: form,
        success: (res) => {
          resolve(res.data.id);
        },
        fail: (err) => {
          console.log(err);
          reject(err);
        }
      })
    })
  },
  //调用api接口，通过订单id获取调用支付的参数
  getPayInfor(id) {
    return new Promise(async (resolve, reject) => {
      let url = this.data.urlHeader + "/pay/order";
      let cookie = await app.getCookie();
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "cookie": cookie
        },
        method: "POST",
        data: {
          orderId: id
        },
        success: (res) => {
          resolve(res.data);
        },
        fail: (err) => {
          console.log(err);
          reject(err);
        }
      })
    })
  },
  //通过支付参数，调用微信的支付接口
  pay(data) {
    wx.requestPayment({
      timeStamp: data.timeStamp,
      nonceStr: data.nonceStr,
      package: data.package,
      signType: data.signType,
      paySign: data.paySign,
      success: () => {
        wx.showToast({
          title:"支付成功",
          duration:1000
        })
        setTimeout(() => {
          wx.switchTab({
            url: "/pages/my/my"
          })
        }, 1000);
      },
      fail: (err) => {
        console.log("支付失败", err);
      }
    })
  },
  chooseAddress() {
    wx.navigateTo({
      url: "choose-address/choose-address"
    })
  }
})
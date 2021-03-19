const app = getApp();
Page({
  data: {
    tabList: [{
      name: "全部"
    }, {
      name: "待付款"
    }, {
      name: "待发货"
    }, {
      name: "待取件"
    }, {
      name: "派送中"
    }],
    urlHeader: app.globalData.urlHeader,
    TabCur: 0
  },
  onLoad: async function (options) {
    let id = options.id;
    this.setData({
      TabCur: id
    })
    this.changeState(id);
  },
  tabSelect(e) {
    let id = e.currentTarget.dataset.id;
    if (this.data.TabCur != id) {
      this.setData({
        TabCur: e.currentTarget.dataset.id
      });
      this.changeState(id);
    }
  },
  async changeState(id) {
    let that = this;
    let cookie = await app.getCookie();
    let url = this.data.urlHeader + "/order/user/query";
    wx.showLoading({
      title: "加载中",
      mask: true
    });
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "cookie": cookie
      },
      method: "POST",
      success: (res) => {
        that.setOrders(res.data, id);
        wx.hideLoading();
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },
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
          console.log(res);
          resolve(res.data);
        },
        fail: (err) => {
          console.log(err);
          reject(err);
        }
      })
    })
  },
  async pay(e) {
    let orderId = e.currentTarget.dataset.id;
    let data = await this.getPayInfor(orderId);
    wx.requestPayment({
      timeStamp: data.timeStamp,
      nonceStr: data.nonceStr,
      package: data.package,
      signType: data.signType,
      paySign: data.paySign,
      success: () => {
        wx.showToast({
          title: "支付成功",
          duration: 1000
        });
        setTimeout(() => {
          that.reflesh();
        }, 1000);
      },
      fail: (err) => {
        console.log("支付失败", err);
      }
    })
  },
  reflesh() {
    let id = this.data.TabCur;
    this.changeState(id);
  },
  setOrders(data, id) {
    let allOrders = [];
    let orders = [];
    let i = 0;
    //给订单添加总价和描述  
    data.forEach(element => {
      // 计算订单总价铬
      let totalNum = 0;
      element.orderItemVos.forEach(item => {
        totalNum += item.buynum;
      })
      allOrders[i] = element;
      allOrders[i].totalNum = totalNum;
      //添加订单状态描述信息
      if (element.state == 0) allOrders[i].desc = "等待买家付款";
      else if (element.state == 1) allOrders[i].desc = "等待卖家发货";
      else if (element.state == 2) allOrders[i].desc = "卖家已发货";
      else if (element.state == 3) allOrders[i].desc = "派件员正在取件";
      else if (element.state == 4) allOrders[i].desc = "派送员已确认取件";
      else if (element.state == 5) allOrders[i].desc = "用户已确认取件";
      else if (element.state == 6) allOrders[i].desc = "取件成功";
      else if (element.state == 7) allOrders[i].desc = "派件员正在派送";
      else if (element.state == 8) allOrders[i].desc = "派件员已送达";
      else if (element.state == 9) allOrders[i].desc = "用户已确认收货";
      else if (element.state == 10) allOrders[i].desc = "订单完成";
      else if (element.state == -2) allOrders[i].desc = "退款中";
      else allOrders[i].desc = "未知状态";
      i++;
    });
    //筛选出符合id的订单
    allOrders.forEach(element=>{
      if(id == 0) orders.push(element);
      if(id == 1 && element.state == 0) orders.push(element);
      if(id == 2 && (element.state == 1||element.state == 2)) orders.push(element);
      if(id == 3 && (element.state == 3||element.state == 4||element.state == 5||element.state == 6)) orders.push(element);
      if(id == 4 && (element.state == 7||element.state == 8||element.state == 9)) orders.push(element);
    })
    this.setData({
      orders: orders
    });
  },
  async cancelOrder(e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let url = this.data.urlHeader + "/order/cancel";
    let cookie = await app.getCookie();
    wx.showLoading({
      title: "订单取消中",
      mask: true
    })
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
        console.log("取消成功", res);
        wx.hideLoading();
        if(res.statusCode == 200){
          wx.showToast({
            title: "取消成功",
            duration: 1000
          });
          setTimeout(() => {
            that.reflesh();
          }, 1000);
        }else{
          wx.showToast({
            title:res.data,
            icon:"none"
          })
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({title:"操作失败！",icon:"none"});
      }
    })
  },
  async confirmPicked(e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    let url = this.data.urlHeader + "/order/user/confirmPicked";
    let cookie = await app.getCookie();
    wx.showLoading({
      title: "确认取件中",
      mask: true
    })
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
        console.log("确认取件成功", res);
        wx.hideLoading();
        if(res.statusCode == 200){
          wx.showToast({
            title: "确认成功",
            duration: 1000
          });
          setTimeout(() => {
            that.reflesh();
          }, 1000);
        }else{
          wx.showToast({
            title:res.data,
            icon:"none"
          })
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({title:"操作失败！",icon:"none"});
      }
    })
  },
  async confirmReceived (e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    let url = this.data.urlHeader + "/order/user/confirmReceived";
    let cookie = await app.getCookie();
    wx.showLoading({
      title: "确认收货中",
      mask: true
    })
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
        console.log("确认收货成功", res);
        wx.hideLoading();
        if(res.statusCode == 200){
          wx.showToast({
            title: "确认成功",
            duration: 1000
          });
          setTimeout(() => {
            that.reflesh();
          }, 1000);
        }else{
          wx.showToast({
            title:res.data,
            icon:"none"
          })
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({title:"操作失败！",icon:"none"});
      }
    })
  },
  async deleteOrder (e){
    let that = this;
    let id = e.currentTarget.dataset.id;
    let url = this.data.urlHeader + "/order/delete";
    let cookie = await app.getCookie();
    wx.showLoading({
      title: "确认收货中",
      mask: true
    })
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
        console.log("确认收货成功", res);
        wx.hideLoading();
        if(res.statusCode == 200){
          wx.showToast({
            title: "确认成功",
            duration: 1000
          });
          setTimeout(() => {
            that.reflesh();
          }, 1000);
        }else{
          wx.showToast({
            title:res.data,
            icon:"none"
          })
        }
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({title:"操作失败！",icon:"none"});
      }
    })
  },
  call(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.id
    })
  }
})
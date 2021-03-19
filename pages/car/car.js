const app = getApp();
Page({
  data: {
    urlHeader: app.globalData.urlHeader,
    allPrice: 0,
    allChecked: false,
    checkAll: false,
  },
  onShow: async function () {
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      wx.showLoading({
        title: "加载中",
        mask: true
      });
      await this.getCart();
      await this.getDefaultAddress();
      wx.hideLoading();
    } else {
      this.setData({
        cartMap: [],
        location: ""
      })
      wx.showModal({
        title: '提示',
        content: '请先登录！',
        showCancel: false,
        success: () => {
          wx.switchTab({
            url: "/pages/my/my"
          });
        },
        fail: () => {
          wx.switchTab({
            url: "/pages/index/index"
          });
        }
      })
    }
  },
  toAddress() {
    wx.navigateTo({
      url: "/pages/my/address/address"
    })
  },
  getCart() {
    let that = this;
    return new Promise(async (resolve, reject) => {
      let url = this.data.urlHeader + "/cart/get";
      let cookie = await app.getCookie();
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "cookie": cookie
        },
        method: "GET",
        success: (res) => {
          console.log(res);
          if (res.data.cart) {
            let cartMap = res.data.cart.cartMap;
            let i;
            let goodsLength = 0;
            for (i in cartMap) goodsLength++;
            that.setData({
              cartMap: cartMap,
              goodsLength: goodsLength
            });
          } else {
            that.setData({
              cartMap: "",
              goodsLength: 0
            });
          }
          that.renewPrice();
          resolve();
        },
        fail: (err) => {
          console.log(err);
          reject();
        }
      })
    })
  },
  getDefaultAddress() {
    let that = this;
    return new Promise(async (resolve, reject) => {
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
          that.setData({
            location: res.data.streetAddress ? res.data.streetAddress : undefined
          })
          resolve();
        },
        fail: (err) => {
          console.log(err);
          reject();
        }
      })
    })
  },
  add(e) {
    let id = e.currentTarget.dataset.id;
    let num = e.currentTarget.dataset.num;
    this.changeNum(id, ++num);
  },
  reduce(e) {
    let id = e.currentTarget.dataset.id;
    let num = e.currentTarget.dataset.num;
    if (num == 1) {
      wx.showToast({
        icon: "none",
        title: "不能再减少了哟~",
        duration: 1000
      })
    } else {
      this.changeNum(id, --num);
    }
  },
  async changeNum(id, num) {
    let that = this;
    let url = this.data.urlHeader + "/cart/modifyGoodsNum";
    let form = {};
    let key = "cart[" + id + "]";
    form[key] = num;
    let cookie = await app.getCookie();
    wx.showLoading({
      title: "修改中",
      mask: true
    });
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "cookie": cookie
      },
      method: "POST",
      data: form,
      success: () => {
        that.getCart();
        wx.hideLoading();
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },
  chooseItem(e) {
    let choosed = e.detail.value;
    if (choosed.length == this.data.goodsLength) {
      this.setData({
        checkAll: true
      })
    } else {
      this.setData({
        checkAll: false
      })
    }
    let cartMap = this.data.cartMap;
    let goods = [];
    choosed.forEach(id => {
      let temp;
      for (temp in cartMap) {
        if (id == cartMap[temp].specificationId) {
          let item = {};
          item.surfaceImg = cartMap[temp].specificationImg;
          item.name = cartMap[temp].productName;
          item.modelName = cartMap[temp].specificationName;
          item.specificationId = cartMap[temp].specificationId;
          item.price = cartMap[temp].unitPrice;
          item.count = cartMap[temp].num;
          item.typeId = cartMap[temp].typeId;
          goods.push(item);
        }
      }
    })
    app.globalData.goods = goods;
    this.countPrice();
  },
  checkAll() {
    if (this.data.checkAll) {
      this.setData({
        allChecked: false,
        checkAll: false
      })
      app.globalData.goods = [];
      this.setData({
        allPrice: 0
      })
    } else {
      this.setData({
        allChecked: true,
        checkAll: true
      });
      let cartMap = this.data.cartMap;
      let goods = [];
      let temp;
      for (temp in cartMap) {
        let item = {};
        item.surfaceImg = cartMap[temp].specificationImg;
        item.name = cartMap[temp].productName;
        item.modelName = cartMap[temp].specificationName;
        item.specificationId = cartMap[temp].specificationId;
        item.price = cartMap[temp].unitPrice;
        item.count = cartMap[temp].num;
        item.typeId = cartMap[temp].typeId;
        goods.push(item);
      }
      app.globalData.goods = goods;
      this.countPrice();
    }
  },
  countPrice() {
    let goods = app.globalData.goods;
    let allPrice = 0;
    goods.forEach(element => {
      allPrice += element.price * element.count;
    })
    this.setData({
      allPrice: allPrice
    });
  },
  renewPrice() {
    let goods = app.globalData.goods;
    let cartMap = this.data.cartMap;
    if (goods.length != 0) {
      for (let i = 0; i < goods.length; i++) {
        let temp;
        for (temp in cartMap) {
          if (cartMap[temp].specificationId == goods[i].specificationId) goods[i].count = cartMap[temp].num;
        }
      }
      app.globalData.goods = goods;
      this.countPrice();
    }
  },
  submit() {
    let goods = app.globalData.goods;
    let typeError = false;
    let typeId = goods[0].typeId;
    goods.forEach(element => {
      if (typeId != element.typeId) typeError = true;
    })
    if (goods.length == 0) {
      wx.showToast({
        icon: "none",
        title: "请至少选择一件商品！"
      })
    } else if (typeError) {
      wx.showModal({
        title: "提示",
        showCancel:false,
        content:"服务与商品不能同时下单！"
      })
    } else {
      wx.navigateTo({
        url: "confirm/confirm"
      })
    }
  },
  manage() {
    if (this.data.manage) {
      this.setData({
        manage: false
      })
    } else {
      this.setData({
        manage: true
      })
    }
  },
  async delete() {
    let that = this;
    let goods = app.globalData.goods;
    if (goods.length != 0) {
      wx.showLoading({
        title: "删除中",
        mask: true
      });
      let arr = [];
      goods.forEach(element => {
        arr.push(element.specificationId);
      })
      let url = this.data.urlHeader + "/cart/deleteCartItemsBySpecificationId";
      let cookie = await app.getCookie();
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "cookie": cookie
        },
        data: {
          specificationIds: arr
        },
        method: "POST",
        success: () => {
          app.globalData.goods = [];
          that.setData({
            allChecked: false,
            checkAll: false,
            allPrice: 0
          })
          wx.hideLoading();
          wx.showToast({
            title: "删除成功"
          })
          that.getCart();
        },
        fail: (err) => {
          console.log(err);
          wx.hideLoading();
        }
      })
    }
  }
})
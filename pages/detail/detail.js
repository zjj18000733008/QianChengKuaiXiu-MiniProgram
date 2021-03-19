// pages/detile/detile.js
const app = getApp();
Page({
  data: {
    swiperList: [{
        url: "https://data.putiyue.com/cs/detile/lb-1.jpg"
      },
      {
        url: "https://data.putiyue.com/cs/detile/lb-2.jpg"
      },
      {
        url: "https://data.putiyue.com/cs/detile/lb-3.jpg"
      },
      {
        url: "https://data.putiyue.com/cs/detile/lb-4.jpg"
      }
    ],
    urlHeader: app.globalData.urlHeader,
    count: 1,
    choosedImg: ""
  },
  onLoad: function (options) {
    let url = this.data.urlHeader + "/product/getById";
    let id = options.id;
    let that = this;
    wx.showLoading({
      title: "加载中",
      mask: true
    })
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        id: id
      },
      method: "GET",
      success: (res) => {
        console.log(res);
        that.setData({
          swiperList: res.data.product.slideImgs,
          price: res.data.specifications[0].currentPrice,
          title: res.data.product.productName,
          describ: res.data.product.overview,
          specifications: res.data.specifications,
          introImgs: res.data.product.introImgs,
          surfaceImg: res.data.product.surfaceImg
        });
        wx.hideLoading();
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
    })
  },
  showModal() {
    this.setData({
      modalName: "bottomModal"
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  chooseModel(e) {
    this.data.modelId = e.currentTarget.dataset.id;
    let modelName = e.currentTarget.dataset.name;
    this.setData({
      modelName: modelName,
      nowPrice: e.currentTarget.dataset.price,
      choosedImg: e.currentTarget.dataset.img,
      count: 1
    })
  },
  add() {
    let count = this.data.count;
    this.setData({
      count: ++count
    })
  },
  subtract() {
    let count = this.data.count;
    if (count > 1) {
      this.setData({
        count: --count
      })
    }
  },
  async addToCar() {
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      let id = this.data.modelId;
      if (!id) {
        let modelName = this.data.specifications[0].name;
        let modelId = this.data.specifications[0].id;
        let nowPrice = this.data.specifications[0].currentPrice;
        this.setData({
          modalName: "bottomModal",
          modelName: modelName,
          modelId: modelId,
          nowPrice: nowPrice
        })
      } else {
        if (this.data.modalName == null) {
          this.setData({
            modalName: "bottomModal"
          })
        } else {
          let url = this.data.urlHeader + "/cart/addGoods";
          let cookie = await app.getCookie();
          let count = this.data.count;
          wx.showLoading({
            title: "添加中",
            mask: true
          })
          wx.request({
            url: url,
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
              "cookie": cookie
            },
            data: {
              specificationId: id,
              num: count
            },
            method: "POST",
            success: (res) => {
              wx.hideLoading();
              wx.showToast({
                title: "添加成功"
              })
            },
            fail: (err) => {
              wx.hideLoading();
              console.log(err);
            }
          })
        }
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '请先登录！',
        success: (res) => {
          if(res.confirm){
            wx.switchTab({
              url: "/pages/my/my"
            });
          };
        }
      })
    }
  },
  buyNow() {
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      let id = this.data.modelId;
      if (!id) {
        let modelName = this.data.specifications[0].name;
        let modelId = this.data.specifications[0].id;
        let nowPrice = this.data.specifications[0].currentPrice;
        this.setData({
          modalName: "bottomModal",
          modelName: modelName,
          modelId: modelId,
          nowPrice: nowPrice
        })
      } else {
        if (this.data.modalName == null) {
          this.setData({
            modalName: "bottomModal"
          })
        } else {
          let goods = [];
          let item = {};
          item.surfaceImg = this.data.surfaceImg;
          item.name = this.data.title;
          item.modelName = this.data.modelName;
          item.specificationId = this.data.modelId;
          item.price = this.data.nowPrice;
          item.count = this.data.count;
          goods.push(item);
          app.globalData.goods = goods;
          wx.navigateTo({
            url: "/pages/car/confirm/confirm"
          })
        }
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '请先登录！',
        success: (res) => {
          if(res.confirm){
            wx.switchTab({
              url: "/pages/my/my"
            });
          };
        }
      })
    }
  },
  toCar() {
    wx.switchTab({
      url: "/pages/car/car"
    });
  }
})
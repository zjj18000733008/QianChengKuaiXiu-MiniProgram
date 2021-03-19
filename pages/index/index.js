// pages/index/index.js
const app = getApp();
Page({
  data: {
    cardCur: 0,
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'https://data.putiyue.com/cs/home/lb-1.jpg'
    }, {
      id: 1,
      type: 'image',
      url: 'https://data.putiyue.com/cs/home/lb-2.jpg'
    }, {
      id: 2,
      type: 'image',
      url: 'https://data.putiyue.com/cs/home/lb-3.jpg'
    }],
    cardList: [],
    iconList: [{
      icon: 'shopfill',
      color: 'mauve',
      badge: 0,
      name: '商城'
    }, {
      icon: 'mobilefill',
      color: 'orange',
      badge: 0,
      name: '手机维修'
    }, {
      icon: 'creativefill',
      color: 'olive',
      badge: 0,
      name: '附近商家'
    }, {
      icon: 'clothesfill',
      color: 'red',
      badge: 0,
      name: '文章栏目'
    }],
    gridCol: 4,
    smList1: [{
        id: 0,
        url: 'https://data.putiyue.com/cs/home/sm-1.png'
      },
      {
        id: 1,
        url: 'https://data.putiyue.com/cs/home/sm-2.png'
      }, {
        id: 2,
        url: 'https://data.putiyue.com/cs/home/sm-3.png'
      }, {
        id: 3,
        url: 'https://data.putiyue.com/cs/home/sm-4.png'
      }
    ],
    urlHeader: app.globalData.urlHeader
  },
  onLoad: function () {
    wx.showLoading({
      title: "加载中！",
      mask: true
    })
    this.getHomepage();
  },
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  goto(e) {
    console.log(e);
    if (e.currentTarget.id == "list-0") wx.navigateTo({
      url: "/pages/shop/shop"
    });
    else if (e.currentTarget.id == "list-2") wx.navigateTo({
      url: "/pages/map/map"
    });
    else if (e.currentTarget.id == "list-3") wx.navigateTo({
      url: "/pages/article/article"
    });
    else if (e.currentTarget.id == "list-1") {
      let userInfo = wx.getStorageSync("userInfo");
      if (userInfo) {
        wx.navigateTo({
          url: "/pages/phone-fix/phone-fix"
        })
      } else {
        wx.showModal({
          title: '提示',
          content: '请先登录！',
          success: (res) => {
            if (res.confirm) {
              wx.switchTab({
                url: "/pages/my/my"
              });
            };
          }
        })
      }
    };
  },
  toDetail(e) {
    let id = e.currentTarget.dataset.id;
    console.log(id);
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + id
    })
  },
  getHomepage() {
    let url = this.data.urlHeader + "/homepage/picture/queryAll";
    let that = this;
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "GET",
      success: (res) => {
        console.log(res);
        let swiperList = [];
        let cardList = [];
        res.data.forEach(element => {
          if (element.state == 1) {
            if (element.type == 1) {
              let temp = {};
              temp.id = element.productId;
              temp.url = element.url;
              swiperList.push(temp);
            } else if (element.type == 2) {
              let temp = {};
              temp.id = element.productId;
              temp.url = element.url;
              cardList.push(temp);
            }
          }
        });
        that.setData({
          swiperList: swiperList,
          cardList: cardList
        })
        wx.hideLoading();
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
      }
    })
  }
})
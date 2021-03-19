// pages/index/index.js
const app = getApp();
Page({
  data: {
    cardCur: 0,
    swiperList: [{
      id: 0,
      url: 'https://data.putiyue.com/cs/home/lb-2.jpg'
    }],
    gridCol: 4,
    nowPage: 1,
    urlHeader: app.globalData.urlHeader,
    commodityList: []
  },
  onLoad: function () {
    let url = this.data.urlHeader + "/product/queryWithPriceRange";
    let that = this;
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        pageSize: 10,
        typeId: 1,
        state: 1
      },
      method: "GET",
      success: (res) => {
        console.log(res);
        let totalPage = res.data.totalPage;
        this.data.totalPage = totalPage;
        this.dealData(res.data.products);
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  toDetail(e) {
    let id = e.currentTarget.dataset.id;
    console.log(id);
    wx.navigateTo({
      url: "/pages/detail/detail?id=" + id
    })
  },
  dealData(data) {
    let commodityList = this.data.commodityList;
    data.forEach(element => {
      let temp = {};
      temp.id = element.id;
      temp.url = element.surfaceImg;
      temp.desc = element.overview;
      temp.name = element.productName;
      temp.price = element.minPrice;
      commodityList.push(temp);
    });
    this.setData({
      commodityList: commodityList
    })
  },
  onReachBottom: function () {
    if (this.data.nowPage == this.data.totalPage) {
      wx.showToast({
        title: "没有更多啦！",
        icon: "none"
      })
    } else {
      wx.showLoading({
        title: "加载中"
      })
      this.data.nowPage++;
      let url = this.data.urlHeader + "/product/queryWithPriceRange";
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          pageSize: 10,
          typeId: 1,
          state: 1,
          currentPage: this.data.nowPage
        },
        method: "GET",
        success: (res) => {
          console.log(res);
          this.dealData(res.data.products);
          wx.hideLoading();
        },
        fail: (err) => {
          console.log(err);
          wx.hideLoading();
        }
      })
    }
  },
  goto(e){
    let id = e.currentTarget.dataset.id;
    if(id == 0){
      wx.navigateTo({
        url:"phone/phone"
      })
    }else{
      wx.navigateTo({
        url:"goods-classify/goods-classify?id="+id
      })
    }
  }
})
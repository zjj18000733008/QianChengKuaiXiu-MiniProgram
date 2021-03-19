const app = getApp();
Page({
  data: {
    tabList: [{
      name: "手机"
    }, {
      name: "平板"
    }, {
      name: "手机配件"
    }, {
      name: "二手商品"
    }],
    urlHeader: app.globalData.urlHeader,
    TabCur: 0,
    commodityList: [],
    nowPage: 1,
    title: "商品分类"
  },
  onLoad: async function (options) {
    let id = options.id;
    this.changeState(id);
  },
  async changeState(id) {
    this.data.commodityList = [];
    this.data.nowPage = 1;
    let url = this.data.urlHeader + "/product/queryWithPriceRange";
    let data = {
      pageSize: 10,
      state: 1
    }
    if (id == 3) {
      data.typeId = 3;
      this.setData({
        title: "二手商品"
      })
    } else if (id == 1) {
      this.setData({
        title: "平板"
      })
      data.concretTypeId = 2;
    } else if (id == 2) {
      this.setData({
        title: "手机配件"
      })
      data.concretTypeId = 3;
    };
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: data,
      method: "GET",
      success: (res) => {
        let totalPage = res.data.totalPage;
        this.data.totalPage = totalPage;
        this.dealData(res.data.products);
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  toDetail(e) {
    let id = e.currentTarget.dataset.id;
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
    let id = this.data.TabCur;
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
      let data = {
        pageSize: 10,
        state: 1,
        currentPage: this.data.nowPage
      };
      if (id == 3) {
        data.typeId = 3;
      } else {
        data.concretTypeId = ++id;
      };
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: data,
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
  }
})
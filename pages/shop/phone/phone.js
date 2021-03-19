const app = getApp();
Page({
  data: {
    tabList: [{
      name: "全部",
      id: 0
    }],
    urlHeader: app.globalData.urlHeader,
    TabCur: 0,
    commodityList: [],
    nowPage: 1,
    title: "手机"
  },
  onLoad: async function (options) {
    wx.showLoading({
      title: "加载中"
    });
    await this.getClassify();
    await this.getAll();
    wx.hideLoading();
  },
  tabSelect(e) {
    let id = e.currentTarget.dataset.id;
    if (this.data.TabCur != id) {
      this.setData({
        TabCur: e.currentTarget.dataset.id
      });
      this.changeState(id);
    };
    wx.pageScrollTo({
      scrollTop: 0
    });
  },
  async changeState(id) {
    wx.showLoading({
      title:"加载中"
    });
    this.data.commodityList = [];
    this.data.nowPage = 1;
    let url = this.data.urlHeader + "/product/queryWithPriceRange";
    let data = {
      pageSize: 10,
      state: 1
    }
    if (id == 0) {
      data.concretTypeId = 1;
    } else {
      data.secondTypeId = id;
    };
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: data,
      method: "GET",
      success: (res) => {
        console.log(res.data);
        let totalPage = res.data.totalPage;
        this.data.totalPage = totalPage;
        this.dealData(res.data.products);
        wx.hideLoading();
      },
      fail: (err) => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          title:"加载失败！",
          icon:"none"
        })
      }
    })
  },
  getClassify() {
    return new Promise((resolve, reject) => {
      let that = this;
      let url = this.data.urlHeader + "/secondType";
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "GET",
        success: (res) => {
          let tabList = that.data.tabList;
          res.data.forEach(element => {
            tabList.push(element);
          });
          that.setData({
            tabList: tabList
          });
          resolve();
        },
        fail: (err) => {
          console.log(err);
          reject();
        }
      })
    })
  },
  getAll() {
    let that = this;
    return new Promise((resolve, reject) => {
      let url = this.data.urlHeader + "/product/queryWithPriceRange";
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          concretTypeId: 1,
          pageSize: 10,
          state: 1
        },
        method: "GET",
        success: (res) => {
          let totalPage = res.data.totalPage;
          that.data.totalPage = totalPage;
          that.dealData(res.data.products);
          resolve();
        },
        fail: (err) => {
          reject();
        }
      })
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
      if (id == 0) {
        data.concretTypeId = 1;
      } else {
        data.secondTypeId = id;
      };
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: data,
        method: "GET",
        success: (res) => {
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
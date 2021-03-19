const app = getApp();
Page({
  data: {
    TabCur: 0,
    MainCur: 0,
    VerticalNavTop: 0,
    load: true,
    urlHeader: app.globalData.urlHeader
  },
  onLoad() {
    this.init();
  },
  onReady() {
    wx.hideLoading()
  },
  typeSelect(e) {
    console.log(e);
    if (e.currentTarget.dataset.index != this.data.TabCur) {
      this.setData({
        TabCur: e.currentTarget.dataset.index
      });
      this.changeType(e.currentTarget.dataset.id);
    }
  },
  brandSelect(e) {
    console.log(e);
    if (e.currentTarget.dataset.index != this.data.MainCur) {
      this.setData({
        MainCur: e.currentTarget.dataset.index
      });
      this.changeBrand(e.currentTarget.dataset.id);
    }
  },
  init: async function () {
    await this.getTypes();
    let initTypeId = this.data.types[0].id;
    this.changeType(initTypeId);
  },
  getTypes: function () {
    let that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: that.data.urlHeader + "/repair/electricAppliance/query",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        method: "GET",
        success: (res) => {
          that.setData({
            types: res.data
          });
          resolve();
        },
        fail: (err) => {
          console.log(err);
          reject(err);
        }
      })
    })
  },
  changeType: function (id) {
    let that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: that.data.urlHeader + "/repair/brand/query",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          electricApplianceId: id
        },
        method: "POST",
        success: (res) => {
          console.log(res);
          let brands = res.data;
          that.setData({
            brands: brands,
            MainCur:0
          })
          console.log(brands);
          if(brands[0]){
            that.changeBrand(brands[0].id);
          }else{
            that.setData({
              models:null
            })
          }
          
          resolve();
        },
        fail: (err) => {
          console.log(err);
          reject(err);
        }
      })
    })
  },
  changeBrand: function (id) {
    let that = this;
    return new Promise((resolve, reject) => {
      wx.request({
        url: that.data.urlHeader + "/repair/model/query",
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: {
          brandId: id
        },
        method: "POST",
        success: (res) => {
          let models = res.data;
          console.log(models);
          that.setData({
            models: models
          });
          that.testGetId(1);
          resolve(models);
        },
        fail: (err) => {
          console.log(err);
          reject(err);
        }
      })
    })
  },
  testGetId:function(id){
    let that = this;
    wx.request({
      url: that.data.urlHeader + "/repair/malfunction/get",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        id: id
      },
      method: "POST",
      success: (res) => {
        console.log(res);
      },
      fail: (err) => {
        console.log(err);
        reject(err);
      }
    })
  },
  toDetail(e){
    console.log(e.currentTarget.dataset.id,e.currentTarget.dataset.name);
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    wx.navigateTo({
      url:"fix-detail/fix-detail?id="+id+"&name="+name
    })
  }
})
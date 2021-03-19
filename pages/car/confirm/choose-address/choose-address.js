const app = getApp();
Page({
  data: {
    urlHeader: app.globalData.urlHeader
  },
  onShow:async function () {
    let that = this;
    let url = this.data.urlHeader+"/address/query";
    let cookie = await app.getCookie();
    wx.showLoading({
      title:"加载中",
      mask:true
    })
    wx.request({
      url: url,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "cookie":cookie
      },
      method: "GET",
      success: (res) => {
        wx.hideLoading();
        let data = res.data;
        for(let i = 0;i<res.data.length;i++){
          data[i].area = data[i].area.replace(/,/g,"");
        }
        that.setData({
          addresses:data
        })
      },
      fail: (err) => {
        wx.hideLoading();
        console.log(err);
      }
    })
  },
  toEdit(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url:"/pages/my/address/edit/edit?id="+id
    })
  },
  toAdd(){
    wx.navigateTo({
      url:"/pages/my/address/add/add"
    })
  },
  choosed(e){
    let pages = getCurrentPages();   
    let prevPage = pages[pages.length - 2];
    prevPage.setData({
      addressId: e.currentTarget.dataset.id
    })
    wx.navigateBack();
  }
})
const app = getApp();
Page({
  data: {
    urlHeader: app.globalData.urlHeader
  },
  //页面每次打开时更新地址信息
  onShow:async function () {
    let that = this;
    wx.showLoading({
      title:"加载中",
      mask:true
    });
    let url = this.data.urlHeader+"/address/query";
    let cookie = await app.getCookie();
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
        console.log(err);
      }
    })
  },
  //带上地址id转跳到地址修改页面
  toEdit(e){
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url:"edit/edit?id="+id
    })
  },
  toAdd(){
    wx.navigateTo({
      url:"add/add"
    })
  }
})
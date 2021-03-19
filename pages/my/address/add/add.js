// pages/my/adress/add/add.js
const app = getApp();
Page({
  data: {
    region: ['江西省', '赣州市', '章贡区'],
    urlHeader: app.globalData.urlHeader,
    default:false
  },
  onLoad: function (options) {

  },
  RegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },
  async saveAddress(e) {
    let data = e.detail.value;
    data.area = data.area.join(",");
    let url = this.data.urlHeader + "/address/save";
    let cookie = await app.getCookie();
    if (data.receiverName == "") wx.showToast({
      title: "收货人不能为空！",
      icon: "none"
    })
    else if (data.mobile == "" || data.mobile.length!=11) wx.showToast({
      title: "请输入11位手机号！",
      icon: "none"
    })
    else if (data.streetAddress == "") wx.showToast({
      title: "街道地址不能为空！",
      icon: "none"
    })
    else {
      wx.showLoading({
        title:"添加中",
        mask:true
      })
      wx.request({
        url: url,
        data: data,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "cookie":cookie
        },
        method: "POST",
        success: (res) => {
          wx.hideLoading();
          wx.showToast({
            title:"添加成功",
            duration: 1000
          }),
          setTimeout(()=>{wx.navigateBack()},1000);
        },
        fail: (err) => {
          wx.hideLoading();
          console.log(err);
        }
      })
    }
  },
})
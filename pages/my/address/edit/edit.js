// pages/my/adress/add/add.js
const app = getApp();
Page({
  data: {
    region: ['江西省', '赣州市', '章贡区'],
    urlHeader: app.globalData.urlHeader,
    default: false
  },
  onLoad: async function (options) {
    this.data.id = options.id;
    wx.showLoading({
      title:"加载中",
      mask: true
    })
    await this.getAdress(options.id);
    wx.hideLoading();
  },
  RegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },
  // 获取地址详细信息，并修改页面数据
  async getAdress(id) {
    let that = this;
    return new Promise(async (resolve, reject) => {
      let url = this.data.urlHeader + "/address/get";
      let cookie = await app.getCookie();
      wx.request({
        url: url,
        data: {
          addressId: id
        },
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "cookie": cookie
        },
        method: "POST",
        success: (res) => {
          that.setData({
            name: res.data.receiverName,
            phoneNum: res.data.mobile,
            region: res.data.area.split(/,/),
            street: res.data.streetAddress,
            state: res.data.state
          })
          resolve();
        },
        fail: (err) => {
          reject(err);
        }
      })
    })
  },
  //发起地址修改
  async updateAddress(e) {
    let that = this;
    let data = e.detail.value;
    data.area = data.area.join(",");
    data.id = this.data.id;
    let url = this.data.urlHeader + "/address/update";
    let cookie = await app.getCookie();
    if (data.mobile == "" || data.mobile.length != 11) wx.showToast({
      title: "请输入11位手机号！",
      icon: "none"
    })
    else if (data.streetAddress == "") wx.showToast({
      title: "街道地址不能为空！",
      icon: "none"
    })
    else {
      wx.showLoading({
        title:"修改中",
        mask:true
      })
      wx.request({
        url: url,
        data: data,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "cookie": cookie
        },
        method: "POST",
        success: (res) => {
          if (that.data.default && that.data.state != 1) {
            that.setDefault(that.data.id);
          } else {
            wx.hideLoading();
            wx.showToast({
              title: "修改成功",
              duration: 1000
            });
            setTimeout(() => {
              wx.navigateBack()
            }, 1000);
          }
        },
        fail: (err) => {
          console.log(err);
        }
      })
    }
  },
  //删除地址
  async deleteAddress() {
    let url = this.data.urlHeader + "/address/delete";
    let id = this.data.id;
    let cookie = await app.getCookie();
    wx.showLoading({
      mask:true
    });
    wx.request({
      url: url,
      data: {
        addressId: id
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "cookie": cookie
      },
      method: "POST",
      success: () => {
        wx.hideLoading();
        wx.showToast({
          title: "删除成功",
          duration: 1000
        });
        setTimeout(() => {
          wx.navigateBack()
        }, 1000);
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  changeDefault(e) {
    this.data.default = e.detail.value;
  },
  //将地址设为默认地址
  async setDefault(id) {
    let url = this.data.urlHeader + "/address/setToDefault";
    let cookie = await app.getCookie();
    wx.request({
      url: url,
      data: {
        addressId: id
      },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "cookie": cookie
      },
      method: "POST",
      success: (res) => {
        wx.hideLoading();
        wx.showToast({
            title: "修改成功",
            duration: 1000
          }),
          setTimeout(() => {
            wx.navigateBack()
          }, 1000);
      },
      fail: (err) => {
        console.log(err);
      }
    })
  }
})
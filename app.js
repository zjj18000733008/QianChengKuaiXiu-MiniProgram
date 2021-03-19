//app.js
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    // urlHeader: "https://wexin.xiangyata.net.cn/qiancheng",
    urlHeader:"http://localhost/qiancheng",
    goods:[]
  },
  getCookie(){
    let that = this;
    return new Promise((resolve,reject)=>{
      let cookies = wx.getStorageSync("cookies");
      let nowDate = new Date().getTime();
      if(cookies.validUntil>nowDate){
        cookies.validUntil = nowDate + 25 * 60 * 1000;
        wx.setStorageSync("cookies",cookies);
        resolve(cookies.data);
      }else{
        wx.login({
          success: (data) => {
            let wxCode = data.code;
            let url = that.globalData.urlHeader + "/user/login";
            wx.request({
              url: url,
              data: {
                wxCode: wxCode
              },
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              method: "POST",
              success: (res) => {
                let cookie;
                res.cookies.forEach(element => {
                  if (element.indexOf("JSESSIONID") >= 0) {
                    cookie = element.split(/;/)[0];
                  }
                });
                console.log(res);
                cookies.data = cookie;
                cookies.validUntil = nowDate + 25 * 60 * 1000;
                wx.setStorageSync("cookies", cookies);
                resolve(cookies.data);
              },
              fail: (err) => {
                reject();
              }
            })
          }
        })
      }
    })
  },
  resetCookie(){
    let cookies = wx.getStorageSync("cookies");
    cookies.validUntil = 0;
    wx.setStorageSync("cookies",cookies);
  },
  onHide:function(){
    wx.switchTab({
      url: "/pages/index/index"
    });
  },
  onShow:function(){
    wx.switchTab({
      url: "/pages/index/index"
    });
  }
})
// pages/my/my.js
const app = getApp();
Page({
  data: {
    iconList: [{
      icon: 'pay',
      color: 'orange',
      badge: 0,
      name: '待付款'
    }, {
      icon: 'present',
      color: 'orange',
      badge: 0,
      name: '待发货'
    }, {
      icon: 'deliver',
      color: 'orange',
      badge: 0,
      name: '待取件'
    }, {
      icon: 'expressman',
      color: 'orange',
      badge: 0,
      name: '派送中'
    }],
    gridCol: 4,
    urlHeader: app.globalData.urlHeader,
    logined: false
  },
  onLoad: function () {
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({
        logined: true,
        nickname: userInfo.nickname
      })
    }
  },
  onShow:function () {
    this.reNew();
  },
  getInfor(e) {
    wx.login({
      success: (data) => {
        let message = {};
        message.wxCode = data.code;
        message.rawData = e.detail.rawData;
        this.login(message);
      }
    });
  },
  login: function (message) {
    let that = this;
    let url = this.data.urlHeader + "/user/login";
    // let url='http://localhost/qiancheng/user/login';
    // let url='https://wexin.xiangyata.net.cn/qiancheng/user/login';
    console.log('message>>>'+message);
    wx.request({
      url: url,
      data: message,
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      method: "POST",
      success: (res) => {
        let userInfo = res.data.userInfo;
        let cookie;
        res.cookies.forEach(element => {
          if (element.indexOf("JSESSIONID") >= 0) {
            cookie = element.split(/;/)[0];
          }
        });
        let cookies = {};
        cookies.data = cookie;
        cookies.validUntil = new Date().getTime() + 25 * 60 * 1000;
        wx.setStorageSync("userInfo", userInfo);
        wx.setStorageSync("cookies", cookies);
        console.log('cookie>>>'+cookies.data)
        that.setData({
          logined: true,
          nickname: userInfo.nickname
        })
        wx.showToast({
          title: "登录成功"
        })
        that.reNew();
        console.log("登录成功")
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  refleshDot(data) {
    let pay = 0,
      shipments = 0,
      get = 0,
      deliver = 0;
    data.forEach(element => {
      let state = element.state;
      if (state == 0) pay++;
      else if (state == 1) shipments++;
      else if (state == 3) get++;
      else if (state == 5) deliver++
    })
    let iconList = this.data.iconList;
    iconList[0].badge = pay;
    iconList[1].badge = shipments;
    iconList[2].badge = get;
    iconList[3].badge = deliver;
    this.setData({
      iconList: iconList
    })
  },
  toOrder(e) {
    let logined = this.data.logined;
    if(logined){
      wx.navigateTo({
        url: "order/order?id=" + e.currentTarget.dataset.id
      })
    }else{
      wx.showToast({
        title:"请先登录！",
        icon:"none"
      })
    }
    
  },
  loginOut() {
    let that = this;
    wx.showModal({
      title: '提示',
      content: '即将退出登录！',
      success(res) {
        if (res.confirm) {
          wx.clearStorageSync();
          that.setData({
            logined: false
          });
          that.reNew();
        }
      }
    })
  },
  reNew: async function (){
    let that = this;
    let logined = this.data.logined;
    if (logined) {
      let cookie = await app.getCookie();
      let url = this.data.urlHeader + "/order/user/query";
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "cookie": cookie
        },
        method: "GET",
        success: (res) => {
          that.refleshDot(res.data);
        },
        fail: (err) => {
          console.log(err);
        }
      })
    } else {
      let empty = [];
      that.refleshDot(empty);
    }
  },
  toAddress(){
    let logined = this.data.logined;
    if(logined){
      wx.navigateTo({
        url:"address/address"
      })
    }else{
      wx.showToast({
        title:"请先登录！",
        icon:"none"
      })
    }
  }
})
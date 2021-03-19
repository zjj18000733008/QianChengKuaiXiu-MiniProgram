var app = getApp();
Page({
  data: {
    controls: [{
      id: 1,
      iconPath: '/images/fix.png',
      position: {
        left: 0,
        top: 300 - 1,
        width: 50,
        height: 50
      },
      clickable: true
    }],
    markers: [{
        id: 0,
        latitude: 25.853976195432736,
        longitude: 114.92299497127533,
        iconPath: '/images/fix.png',
        width: '80rpx',
        height: '80rpx',
        label: {
          content: "果粉快修一号",
          color: '#FF0202',
          borderRadius: 3,
          borderWidth: 1,
          borderColor: '#FF0202',
          bgColor: '#ffffff',
          padding: 5,
          textAlign: 'center'
        }
      },
      {
        id: 1,
        latitude: 25.86115444713215,
        longitude: 114.91647720336914,
        iconPath: '/images/fix.png',
        width: '80rpx',
        height: '80rpx',
        label: {
          content: "果粉快修二号",
          color: '#FF0202',
          borderRadius: 3,
          borderWidth: 1,
          borderColor: '#FF0202',
          bgColor: '#ffffff',
          padding: 5,
          textAlign: 'center'
        }
      },
      {
        id: 2,
        latitude: 25.835046113386646,
        longitude: 114.91802215576172,
        iconPath: '/images/fix.png',
        width: '80rpx',
        height: '80rpx',
        label: {
          content: "果粉快修三号",
          color: '#FF0202',
          borderRadius: 3,
          borderWidth: 1,
          borderColor: '#FF0202',
          bgColor: '#ffffff',
          padding: 5,
          textAlign: 'center'
        }
      },
      {
        id: 3,
        latitude: 25.77917965945352,
        longitude: 114.88832473754883,
        iconPath: '/images/fix.png',
        width: '80rpx',
        height: '80rpx',
        label: {
          content: "果粉快修四号",
          color: '#FF0202',
          borderRadius: 3,
          borderWidth: 1,
          borderColor: '#FF0202',
          bgColor: '#ffffff',
          padding: 5,
          textAlign: 'center'
        }
      },
    ]
  },
  onLoad: function (options) {
    wx.getLocation({
      altitude: true,
      success: (res) => {
        console.log(res);
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  //显示对话框
  showModal: function (event) {
    console.log(event);
    let markerId = event.markerId;
    let markerLat, markerLng,markerName;
    this.data.markers.forEach(Element => {
      if (Element.id == markerId) {
        markerLat = Element.latitude;
        markerLng = Element.longitude;
        markerName = Element.label.content;
      }
    });
    let distance = this.GetDistance(markerLat, markerLng, this.data.latitude, this.data.longitude);
    let distanceStr;
    if (distance > 1) distanceStr = distance.toFixed(2) + 'km';
    else distanceStr = (distance * 1000).toFixed(0) + 'm';
    this.setData({
      markerLat:markerLat,
      markerLng:markerLng,
      markerName: markerName,
      distanceStr: distanceStr
    })
    // 显示遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
      showModalStatus: true
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export()
      })
    }.bind(this), 200)
  },
  //隐藏对话框
  hideModal: function () {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export(),
    })
    setTimeout(function () {
      animation.translateY(0).step()
      this.setData({
        animationData: animation.export(),
        showModalStatus: false
      })
    }.bind(this), 200)
  },
  opendetail: function (event) {
    var id = event.currentTarget.dataset.id;
    this.setData({
      id: id
    });
    wx.navigateTo({
        url: "/pages/detail/detail?id=" + id
      }),
      console.log(id);
  },
  calling: function (event) {
    var tel = event.currentTarget.dataset.id.tel;
    this.setData({
      tel: tel
    });
    wx.makePhoneCall({
      phoneNumber: tel,
      success: function () {
        console.log("拨打电话成功！")
      },
      fail: function () {
        console.log("拨打电话失败！")
      }
    })
  },
  getLocation(e) {
    console.log(e);
  },
  GetDistance(lat1, lng1, lat2, lng2) {
    let radLat1 = this.Rad(lat1);
    let radLat2 = this.Rad(lat2);
    let a = radLat1 - radLat2;
    let b = this.Rad(lng1) - this.Rad(lng2);
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137; // EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000; //输出为公里
    // s=s.toFixed(2);
    return s;
  },
  Rad(d) {
    return d * Math.PI / 180.0; //经纬度转换成三角函数中度分表形式。
  },
  toMarker: function (e) {
    wx.openLocation({
      latitude: this.data.markerLat,
      longitude: this.data.markerLng,
      scale: 18,
      name: '果粉快修',
      address: this.data.markerName
    })
  }
})
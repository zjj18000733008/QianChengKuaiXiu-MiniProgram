const app = getApp();
Page({
  data: {
    urlHeader: app.globalData.urlHeader,
    nowPrice: 0,
    checked:false
  },
  onLoad: function (options) {
    console.log(options);
    this.setData({
      model:options.name
    });
    this.queryDetail(options.id);
  },
  queryDetail:async function(id){
    let that = this;
    let cookie = await app.getCookie();
    wx.request({
      url: that.data.urlHeader + "/repair/malfunction/queryWithItems",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie":cookie
      },
      data: {
        modelId: id
      },
      method: "POST",
      success: (res) => {
        console.log(res);
        that.setData({
          all:res.data
        })
      },
      fail: (err) => {
        console.log(err);
      }
    })
  },
  choose(e){
    let id = e.detail.value;
    this.data.malfunctionId = id;
    let data = this.data.all;
    let nowPrice;
    data.forEach(element => {
      element.repairMalfunctionItems.forEach(item =>{
        if(item.malfunctionId == id) nowPrice = item.currentPrice;
      })
    });
    this.setData({
      nowPrice:nowPrice,
      checked:true
    });
  },
  back(){
    wx.navigateBack();
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  submit:async function(e){
    let name = e.detail.value.name;
    let phone = e.detail.value.phone;
    let malfunctionId = this.data.malfunctionId;
    if(!name) wx.showToast({title:"请输入姓名！",icon:"none"});
    else if(phone.length!= 11) wx.showToast({title:"请输入11位手机号！",icon:"none"});
    else{
      console.log(name,phone,malfunctionId);
      let cookie = await app.getCookie();
      let url = this.data.urlHeader + "/waitforcall";
      let that = this;
      wx.request({
        url: url,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cookie":cookie
        },
        data: {
          name:name,
          phone:phone,
          malfunctionItemId:malfunctionId
        },
        method: "POST",
        success: () => {
          that.hideModal();
          wx.showModal({
            title:"提交成功",
            content:"工作人员将会通过手机号联系您！",
            showCancel:false
          })
        },
        fail: (err) => {
          console.log(err);
        }
      })
    }
  }
})
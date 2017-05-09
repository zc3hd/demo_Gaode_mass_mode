// 宏观模式
// 围栏的数据分为两个数组
var fence_data = [
  // ----正常数据
  [
  // 正常数据里的每个对象包含三个属性值，
  // all_sum--围栏的上限数，
  // active_sum当前自行车的数量，
  // lnglat--围栏的位置，取真正围栏所有点的纬度最大的那个点（lnglat这个必须为这个字段名，属性值必须是按照这样的结构 [116.648895, 39.922018]）
  {
    all_sum: 56,
    active_sum: 0,
    lnglat: [116.648895, 39.922018]
  }, 
  {
    all_sum: 50,
    active_sum: 23,
    lnglat: [116.657807, 39.921576]
  }, 
  {
    all_sum: 50,
    active_sum: 25,
    lnglat: [116.690577, 39.924453]
    // lnglat: []
  }
  ],
  // ----报警数据--同理
  [{
    all_sum: 56,
    active_sum: 78,
    lnglat: [116.660106, 39.897445]
  }, {
    all_sum: 50,
    active_sum: 56,
    lnglat: [116.675916, 39.896559]
  }, {
    all_sum: 50,
    active_sum: 100,
    lnglat: [116.742894, 39.88593]
  }]
];

// 一条围栏的微观测试数据
// 请求回来的数据是个数组。里面是屏幕选出来的围栏的数据
// 有四个属性值：
// all_sum：上限数
// active_sum：当前自行车数
// lnglat：标识最上面点的坐标
// region：围栏的坐标
var fence_s_data = [{
  all_sum: 56,
  active_sum: 23,
  lnglat: [116.648895, 39.922018],
  region: [
    [116.648895, 39.922018],
    [116.64894, 39.922001],
    [116.648881, 39.921949],
    [116.648801, 39.921983],
  ]
}];


// 自行车的数据
// 按公司分类  company: 'off',
// 然后里面有报警数据分类：
// alram: [{
//     last_time: (new Date().getTime()),
//     lnglat: [116.65831, 39.911947 + Math.random() * 0.01]
//   }, {
//     last_time: (new Date().getTime()),
//     lnglat: [116.657232, 39.908958 + Math.random() * 0.01]
//   }],

// 非本区数据分类：
  // un_area: [

  //   {
  //     last_time: (new Date().getTime()),
  //     lnglat: [116.654644, 39.917536 + Math.random() * 0.01]
  //   }, {
  //     last_time: (new Date().getTime()),
  //     lnglat: [116.663053 + Math.random() * 0.01, 39.907298]
  //   }
  // ]

  // 数组里面是每个自行车得数据。有最后的上传的时间和坐标
  // （lnglat这个必须为这个字段名，属性值必须是按照这样的结构 [116.648895, 39.922018]）
var bike_data = [{
  company: '11011210',
  alram: [{
    last_time: (new Date().getTime()),
    lnglat: [116.65831, 39.911947 + Math.random() * 0.01]
  }, {
    last_time: (new Date().getTime()),
    lnglat: [116.657232, 39.908958 + Math.random() * 0.01]
  }],
  un_area: [

    {
      last_time: (new Date().getTime()),
      lnglat: [116.654644, 39.917536 + Math.random() * 0.01]
    }, {
      last_time: (new Date().getTime()),
      lnglat: [116.663053 + Math.random() * 0.01, 39.907298]
    }
  ]
}, {
  company: '11011211',
  alram: [{
    last_time: (new Date().getTime()),
    lnglat: [116.649327 + Math.random() * 0.01, 39.9006]
  }, {
    last_time: (new Date().getTime()),
    lnglat: [116.653279, 39.901098 + Math.random() * 0.01]
  }],
  un_area: [{
    last_time: (new Date().getTime()),
    lnglat: [116.650908 + Math.random() * 0.01, 39.897666]
  }, {
    last_time: (new Date().getTime()),
    lnglat: [116.657447, 39.899715 + Math.random() * 0.01]
  }]
}, ];

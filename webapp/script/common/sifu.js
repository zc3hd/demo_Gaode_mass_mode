/**
 * Created by wangpeng on 2016/12/2.
 */
(function(win, $) {
  var sifu = win.Sifu = win.Sifu || {
    basePrefixURL: "",
    basePrefixImgUrl: "",
    module: {},
    // --------------------------围栏的数据
    // 围栏正常的图片
    fence_nor:'../../../images/fence_nor.png',
    // 围栏异常的图片
    fence_unnor:'../../../images/fence_unnor.png',
    // 围栏显示的大小-width height-px
    fence_size:[64,50],
    // 宏观围栏的循环时间
    fence_big_time:10000,
    // 围观围栏的循环时间
    fence_small_time:10000,
    // 围栏显示的样式
    fence_styleOptions:{
      strokeColor: "blue", //边线颜色。
      fillColor: "blue", //填充颜色。当参数为空时，圆形将没有填充效果。
      strokeWeight: 1, //边线的宽度，以像素为单位。
      strokeOpacity: 0.5, //边线透明度，取值范围0 - 1。
      fillOpacity: 0.1, //填充的透明度，取值范围0 - 1。
      strokeStyle: 'solid' //边线的样式，solid或dashed。
    },
    // --------------------------自行车的数据
    bike_time:10000,
    // 自行车显示的大小
    bike_size:[55,66],
    // 自行车报警的图片名称
    bike_alarm:'../../../images/alarm_',
    // 自行车非本区的图片名称
    bike_un_area:'../../../images/fb_',
    // 自行车图片的格式
    bike_img_type:'.png'
  }
})(window, jQuery);



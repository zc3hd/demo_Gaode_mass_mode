### 1.运行

```
* $ git clone 地址
* npm install 
* $ gulp;
```

### 2.说明

* 高德地图的海星模式可以自定义图片，加载5-6千个点不卡顿。高德地图加载2000个电子围栏，覆盖物也不是很卡。
* 高德mass模式可以挂载很多事件。
* mass的清除，绑定的事件也会清除。不会重复挂载事件。
* 新思路：显示全部数据，建议使用mass模式，看最大级别（18-20）的数据，把屏幕的四个角点传过去，请求到屏幕四个角点内的数据。

### 3.学习

#### 3.1 滚轮事件

* 地图监听滚轮事件，获取地图的滚动后的地图层级。设置一个异步进行获取，才可以获取缩放完成后的层级。

```
me.map.on('mousewheel',function(){
 setTimeout(function() {
    var key = me.map.getZoom();
    });
});
```

#### 3.2 定时器的清除

* 定时器清除有两个方面：清除上一个记录的定时器，清除没有及时清除掉的定时器：
* 特别注意在什么地方加什么开关进行清除定时器！

```
// 停止围栏宏观的定时器
clearTimeout(me.f_big_timer);
// 没有及时停止定时器的话，也不会继续下次了--效果通已经打点。
me.f_mass_key = true;
```

#### 3.3 清除传入数组

```
// 海星点的清除
_haix_clear: function(arr) {
  var me = this;
  if (arr.length != 0) {
    for (var i = 0; i < arr.length; i++) {
      arr[i].setMap(null);
    }
    //这样设置是不起作用的。
    arr = [];
    //应该这样设置
    arr.length = 0;
  }
},
```

* 这里还是指向的问题，传入一个obj,地址就给了里面的变量，可以通过改变地址上的属性，包括length。但是arr = []直接赋值就相当于改变了里面的变量的地址指向。并没有改变原地址的属性。

#### 3.4 滚动时的样式设置

```
for (var i = 0; i < f_arr.length; i++) {
  f_arr[i].setStyle({
    size: me.f_size,
    anchor: new AMap.Pixel(me.f_size.width * 0.5, me.f_size.height),
  });
}
```

* 根据层级算出需要的大小，定位的大小除了大小设置，还要设置偏移。

#### 3.5 mass模式注入数据

```
    fence_big_ajax: function() {
      var me = this;
      // 模拟数据

      var arr = fence_data;
      // 第一次加载完成
      if (me.f_first_load) {
        me.f_draw(arr);
        me.f_first_load = false;
      }
      // 第二为注入数据
      else {
        me.f_inject(arr);
      }
      // 循环开始
      me.fence_big_ajax_interval();
    },

    // 注入数据
    f_inject: function(arr) {
      var me = this;
      // -------------------------------正常围栏
      // 有数据
      if (arr[0].length != 0) {
        me.f_big_dom_arr[0].setData(arr[0]);
      }
      // 没有数据
      else {
        me.f_big_dom_arr[0].setData([
          { lnglat: [-100, -100] }
        ]);
      }

      // -------------------------------报警围栏
      // 有数据
      if (arr[1].length != 0) {
        me.f_big_dom_arr[1].setData(arr[1]);
      }
      // 没有数据
      else {
        me.f_big_dom_arr[1].setData([
          { lnglat: [-100, -100] }
        ]);
      }
    },
```

* 注入数据的写法是保证地图上的mass不是以一闪一闪的方式进行显示。而且每次以新的数据进行渲染。
* 特别注意：新的返回的若为空数组，注入数据给mass,是不管作用的。mass会以上次的数据形式进行显示。这个特别注意。但是又不能把这个mass清除。清除的话，下次有数据的时候又进行显示。这样又会成为一闪一闪的状态。经过试验，设置mass的里面点坐标为-100，-100,不在地球上的点。那数据进行影藏。

#### 3.6 取屏幕的四个角点的坐标

```
var ps = me.map.getBounds();
var arr = [{
lng: ps.northeast.lng,
lat: ps.northeast.lat
}, {
lng: ps.southwest.lng,
lat: ps.southwest.lat
}, {
lng: ps.southwest.lng,
lat: ps.northeast.lat
}, {
lng: ps.northeast.lng,
lat: ps.southwest.lat
}, ];
```

### 4.小结

* 少说，多做。
* 这个demo一开始有两个递归式定时器进行加载，切到20级别的时候。开启微观模式围栏的定时器。返回3-19级，要停止微观的定时器，开启宏观围栏的定时器。拖动的时候也要停止微观的定时器，放开的时候开启微观定时器。宏观模式的第一次进行加载数据，第二次进行注入数据。综上这个demo，我写了6个地方的定时器开关。定时器的清除，要特注意。
* 所有配置我都设置在一个公共文件中，方便后期进行修改。永远要给自己留新需求的设置的接入口。
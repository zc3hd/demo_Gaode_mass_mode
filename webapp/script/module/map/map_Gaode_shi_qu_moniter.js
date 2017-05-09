/**
 * Item Name  : 
 *Creator         :cc
 *Email            :cc
 *Created Date:2017.4.28
 *@pararm     :
 */
(function($, window) {
  function diyBdMap(opts) {
    this.id = opts.id;
    // --------------------------------宏观模式的围栏
    // 收集围栏的所有的点---为了最优视角
    this.f_big_arr = [];
    // 宏观模式的循环时间
    this.f_big_timer = null;
    // 海星围栏的收集
    this.f_big_dom_arr = [];
    // 围栏最优一次
    this.f_view = true;
    // 宏观围栏mass的大小
    this.f_size = null;
    // mass加载 第一次进行加载，第二次注入数据
    this.f_first_load = true;
    this.f_small_timer = null;

    // ---------------------------------自行车
    // 海星的收集
    this.b_dom_arr = [];
    // 自行车的定时器
    this.b_timer = null;
    // 宏观围栏mass的大小
    this.b_size = null;
    // mass加载 第一次进行加载，第二次注入数据
    this.b_first_load = true;

    // ---------------------------------开关
    // fence 点击开关--没有点击
    this.f_mass_key = false;

    //这个参数证明围栏已经到了3-19级--即使发出请求也不进行打点
    this.f_wheel_key = false;

    // 微观数据启动标记---默认没有启动
    this.f_small_key = false;
  };
  diyBdMap.prototype = {
    //面向对象初始化
    init: function() {
      var me = this;
      me.init_Baner(); //开启控件
      setTimeout(function() {
        me.init_event();
      }, 500);
    },
    //控件默认初始化
    init_Baner: function() {
      var me = this;
      var map = me.map = new AMap.Map(me.id, {
        expandZoomRange: true,
        zoom: 12,
        zooms: [3, 20]
      });
    },
    init_event: function() {
      var me = this;
      me._tz_bind();
      me._tz();
    },
    //通州
    _tz: function() {
      var me = this;
      me._pre_init();
      // 围栏数据加载
      me.fence_big_ajax();
      // 自行车的打点
      me.b_ajax();
    },
    _tz_bind: function() {
      var me = this;
      var fn = {
        // ------------------------------------------------------预先加载
        _pre_init: function() {
          var me = this;
          me.map.on('mousemove', function(e) {
            $("#info").css({ "top": (e.pixel.y + 10) + "px", "left": (e.pixel.x + 10) + "px" });
          });
          me.map.on('mousewheel', function() {
            // 缩放地图的一瞬间，层级取的还是收回前的层级。加个异步，取收回后的层级
            setTimeout(function() {
              var key = me.map.getZoom();
              // ----------------随着滚轮的滚动改变--mass的样式
              me._haix_style(key, 'wheel');
              // 进入或者退出的时候  3-19
              if ((key >= 3) && (key <= 19)) {
                // 清除微观数据
                me.map.clearMap();

                // 清除围栏微观的定时器
                clearTimeout(me.f_small_timer);
                // 这个参数证明围栏已经到了3-19级--即使发出请求也不进行打点
                me.f_wheel_key = true;

                // 微观数据已经结束--拖动是没有反应的。
                me.f_small_key = false;

                // 设置为空--为了进入20级只执行一次。
                me.f_small_timer = null;

                // -------------宏观已经开启，3-19推的时候就不再次开启
                if (me.f_big_timer != null) {
                  // console.log('宏观围栏已开启，推进不启动');
                  return;
                }
                // -------------------------宏观开启
                me.f_big_arr = [];
                // 海星围栏的收集
                me.f_big_dom_arr = [];
                // 围栏最优一次
                me.f_view = true;
                // mass加载 第一次进行加载，第二次注入数据
                me.f_first_load = true;

                // 回到没有点击的效果
                me.f_mass_key = false;
                me.fence_big_ajax();
              }
              // --------------------滚动着进入 20
              else {
                // 清除围栏的宏观数据
                me._haix_clear(me.f_big_dom_arr);
                me.f_big_dom_arr = [];
                // 停止围栏宏观的定时器
                clearTimeout(me.f_big_timer);
                // 没有及时停止定时器的话，也不会继续下次了--效果通已经打点。
                me.f_mass_key = true;
                // 设置为空--为了退出的时候进行19级时可以加载一次。
                me.f_big_timer = null;


                // -------------微观已经开启就不再次开启
                if (me.f_small_timer != null) {
                  // console.log('微观围栏已经开启，不再开启')
                  return;
                }5
                .
                

                // 这个参数证明围栏已经到了20级--恢复了--可以打点的效果
                me.f_wheel_key = false;

                // 微观数据启动
                me.f_small_ajax();
              }
            }, 0)
          });
          me.map.on('dragstart', function() {
            var key = me.map.getZoom();
            // 20级的模式,且已经启动时移动时才会清除定时器
            if (me.f_small_key && (key == 20)) {
              clearTimeout(me.f_small_timer);
              // 这个参数是给没有及时清除的定时器-----进行清除
              me.f_wheel_key = true;
            }
          });
          me.map.on('dragend', function() {
            var key = me.map.getZoom();
            // 20级的模式才生效
            if (key == 20) {
              // 放开移动的时候，开启定时器
              me.f_wheel_key = false;
              // 微观数据启动
              me.f_small_ajax();
            }
          });
        },
        // 海星点的清除
        _haix_clear: function(arr) {
          var me = this;
          if (arr.length != 0) {
            for (var i = 0; i < arr.length; i++) {
              arr[i].setMap(null);
            }
            arr = [];
          }
        },
        // -------------------------------------------滚动时-海星点的样式
        _haix_style: function(key, fn) {
          var me = this;
          // 3-13
          if (key <= 13) {
            me.f_size = new AMap.Size(config.fence_size_s[0], config.fence_size_s[1]);
            me.b_size = new AMap.Size(config.bike_size_s[0], config.bike_size_s[1]);
          }
          // 14 15 16 17 18 
          else if ((13 < key) && (key <= 18)) {
            me.f_size = change_f(key);
            me.b_size = change_b(key);
          }
          // 19
          else if (key == 19) {
            me.f_size = new AMap.Size(config.fence_size_l[0], config.fence_size_l[1]);
            me.b_size = new AMap.Size(config.bike_size_l[0], config.bike_size_l[1]);
          }

          // ---滚动时的改变
          if (fn == 'wheel') {
            var f_arr = me.f_big_dom_arr;
            for (var i = 0; i < f_arr.length; i++) {
              f_arr[i].setStyle({
                size: me.f_size,
                anchor: new AMap.Pixel(me.f_size.width * 0.5, me.f_size.height),
              });
            }
            var b_arr = me.b_dom_arr;
            for (var k = 0; k < b_arr.length; k++) {
              b_arr[k].alarm.setStyle({
                size: me.b_size,
                anchor: new AMap.Pixel(me.b_size.width * 0.5, me.b_size.height),
              });
              b_arr[k].un_area.setStyle({
                size: me.b_size,
                anchor: new AMap.Pixel(me.b_size.width * 0.5, me.b_size.height),
              })
            }

          }

          function change_f(level) {
            var r_key = level - 13;
            var r_w = (config.fence_size_l[0] - config.fence_size_s[0]) / (19 - 13);
            var r_h = (config.fence_size_l[1] - config.fence_size_s[1]) / (19 - 13);
            return new AMap.Size(config.fence_size_s[0] + r_key * r_w, config.fence_size_s[1] + r_key * r_h);
          }

          function change_b(level) {
            var r_key = level - 13;
            var r_w = (config.bike_size_l[0] - config.bike_size_s[0]) / (19 - 13);
            var r_h = (config.bike_size_l[1] - config.bike_size_s[1]) / (19 - 13);
            return new AMap.Size(config.bike_size_s[0] + r_key * r_w, config.bike_size_s[1] + r_key * r_h);
          }
        },
        // ----------------------------------------------宏观
        //请求围栏的宏观数据
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
        // 围栏的数据循环开始
        fence_big_ajax_interval: function() {
          var me = this;
          me.f_big_timer = setTimeout(function() {
            console.log('宏观数据开始');
            me.fence_big_ajax();
          }, config.fence_big_time);
        },
        f_draw: function(arr) {
          var me = this;
          // 正常的海星模式
          me.f_draw_done(arr[0], config.fence_nor);
          // 报警的海星
          me.f_draw_done(arr[1], config.fence_unnor);
          // 只做一次最优视角
          if (me.f_view) {
            me.map.setFitView(me.f_big_arr);
            me.f_view = false;
          }
        },
        //具体打点
        f_draw_done: function(arr, url) {
          var me = this;
          var marker = null;
          var str = '';
          // 最优视角做点的收集
          if (me.f_view) {
            for (var i = 0; i < arr.length; i++) {
              marker = new AMap.Marker({ position: arr[i].lnglat });
              me.f_big_arr.push(marker);
            }
          }
          var key = me.map.getZoom();
          me._haix_style(key, null);

          var mass = new AMap.MassMarks(arr, {
            url: url,
            anchor: new AMap.Pixel(me.f_size.width * 0.5, me.f_size.height),
            size: me.f_size,
            opacity: 1,
            cursor: 'pointer',
            zooms: [3, 20],
            zIndex: 100
          });
          // 这里和百度完全不一样，百度是给海星的模式上，高德这里赞
          mass.on('mouseover', function(e) {
            str = '' +
              '<p>上限数：' + e.data.all_sum + '</p>' +
              '<p>当前数：' + e.data.active_sum + '</p>';

            $("#info").show();
            $("#info").html(str);
          });
          mass.on('mouseout', function(e) {
            $("#info").hide();
            $("#info").html('');
          });
          // 点击事件
          mass.on('click', function(e) {
            // 已经点击fence的mass点
            me.f_mass_key = true;
            // 点击过后回复到没有滚到19-3的级别
            me.f_wheel_key = false;

            // 清除围栏宏观的定时器
            clearTimeout(me.f_big_timer);
            // 设置为空--为了退出的时候进行19级加载一次。
            me.f_big_timer = null;
            // 清除围栏数据
            me._haix_clear(me.f_big_dom_arr);
            // 强制清除mass容器
            me.f_big_dom_arr = [];
            // 定位20级，缩放到相应的点
            me.map.setZoomAndCenter(20, e.data.lnglat);

            // 500后进行启动微观数据
            setTimeout(function() {
              me.f_small_ajax();
            }, 500);
          });
          mass.setMap(me.map);

          // 重新设置大小
          setTimeout(function() {
            var key = me.map.getZoom();
            me._haix_style(key, null);
            mass.setStyle({
              size: me.f_size,
              anchor: new AMap.Pixel(me.f_size.width / 2, me.f_size.height),
            });
          }, 0);

          me.f_big_dom_arr.push(mass);
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
        // -----------------------------------------------微观
        f_small_ajax: function() {
          var me = this;
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
          // 清除数据
          me.map.clearMap();
          var data = fence_s_data;
          // 请求回的数据
          for (var i = 0; i < data.length; i++) {
            me.f_small_draw(data[i]);
          }
          // 循环开始
          me.f_small_ajax_interval();
        },
        // 循环围观开始
        f_small_ajax_interval: function() {
          var me = this;
          var me = this;
          me.f_small_timer = setTimeout(function() {
            if (me.f_wheel_key) {
              return;
            }
            // console.log('wl_small');
            me.f_small_ajax();
          }, config.fence_small_time);
        },
        // 每条项目的打点
        f_small_draw: function(item) {
          var me = this;
          // 打围栏
          me.f_small_draw_region(item);
          // 打点
          me.f_small_draw_maker(item);
        },
        // 围观打marker
        f_small_draw_maker: function(item) {
          var me = this;
          var image = (item.all_sum > item.active_sum ? config.fence_nor : config.fence_unnor);
          var marker = new AMap.Marker({
            position: [item.lnglat[0], item.lnglat[1]],
            map: me.map
          });
          me.f_small_draw_maker_label(marker, image, item);
          marker.setOffset(new AMap.Pixel(-config.fence_true_size[0] / 2, -config.fence_true_size[1] + 2));
        },
        // 打marker--label
        f_small_draw_maker_label: function(marker, image, item) {
          var me = this;
          // -------------------------大标签
          var markerContent = document.createElement("div");
          markerContent.className = "P_div";
          // -------------------------图标
          var markerImg = document.createElement("img");
          markerImg.src = image;
          markerContent.appendChild(markerImg);

          // --------------------------信息框
          var markerDIV = document.createElement("div");
          markerDIV.className = 'markLabel';
          markerDIV.innerHTML = '<span class="labelName" id="devName">上限数：' + item.all_sum +
            '<br />' +
            '<span class="" id="devReceive" >当前数：' + item.active_sum + '</span>' +
            '<br />' +
            '</span>' +
            '<div class="labelArrow"></div>';
          markerContent.appendChild(markerDIV);

          marker.setContent(markerContent); //更新点标记内容
        },
        // 围观打围栏
        f_small_draw_region: function(item) {
          var me = this;
          var path = [];
          var p = null;
          for (var i = 0; i < item.region.length; i++) {
            p = item.region[i];
            path.push(new AMap.LngLat(p[0], p[1]));
          }
          var opts = config.fence_styleOptions;
          var Polygon = new AMap.Polygon(opts);
          Polygon.setPath(path);
          Polygon.setMap(me.map);
        },
        // -----------------------------------------------自行车
        b_ajax: function() {
          var arr = bike_data;
          // 第一次数据
          if (me.b_first_load) {
            for (var i = 0; i < arr.length; i++) {
              // 每一个公司的数据
              me.b_ajax_draw(arr[i])
            }
            me.b_first_load = false;
          }
          // 第二次注入数据
          else {
            me.b_inject(arr);
          }

          me.b_ajax_interval();
        },
        // 围栏的数据循环开始
        b_ajax_interval: function() {
          var me = this;
          me.b_timer = setTimeout(function() {
            console.log('自行车数据开始');
            me.b_ajax();
          }, config.bike_time);
        },
        // 具体打海星
        b_ajax_draw: function(item) {
          var me = this;
          var company = item.company;
          var obj = {};
          me.b_draw_done(config.bike_alarm, company, item.alram, 'alarm', obj);
          me.b_draw_done(config.bike_un_area, company, item.un_area, 'un_area', obj);

          me.b_dom_arr.push(obj);
        },
        // 自行车具体打mass
        b_draw_done: function(type, company, arr, infotype, obj) {
          var me = this;
          var key = me.map.getZoom();
          me._haix_style(key, null);
          var mass = new AMap.MassMarks(arr, {
            url: type + company + config.bike_img_type,
            zooms: [3, 20],
            anchor: new AMap.Pixel(me.b_size.width * 0.5, me.b_size.height),
            size: me.b_size,
            opacity: 1,
            cursor: 'pointer',
            zIndex: 100
          });
          mass.on('mouseover', function(e) {
            str = '' +
              '<p>最后上传时间：' + cLib.base.formatterDateDay(e.data.last_time, false) + '</p>' +
              '';

            $("#info").show();
            $("#info").html(str);
          });
          mass.on('mouseout', function(e) {
            $("#info").hide();
            $("#info").html('');
          });
          // 点击事件
          mass.on('click', function(e) {
            // 定位20级，缩放到相应的点
            me.map.setZoomAndCenter(20, e.data.lnglat);

            // 已经点击fence的mass点
            me.f_mass_key = true;
            // 点击过后恢复到没有滚到19-3的级别---到达20级，可开启打点
            me.f_wheel_key = false;


            // 清除围栏宏观的定时器
            clearTimeout(me.f_big_timer);
            // 设置为空--为了退出的时候进行19级加载一次。
            me.f_big_timer = null;
            // 清除围栏数据
            me._haix_clear(me.f_big_dom_arr);
            // 强制清除mass容器
            me.f_big_dom_arr = [];


            setTimeout(function() {
              me.f_small_ajax();
            }, 1500);
          });
          mass.setMap(me.map);

          obj[infotype] = mass;

          setTimeout(function() {
            var key = me.map.getZoom();
            me._haix_style(key, null);
            mass.setStyle({
              size: me.b_size,
              anchor: new AMap.Pixel(me.b_size.width / 2, me.b_size.height),
            });
          }, 0);
        },
        b_inject: function(arr) {
          var me = this;
          var Arr = me.b_dom_arr;

          for (var i = 0; i < Arr.length; i++) {

            // -----------------------------报警数据
            // 有报警数据
            if (arr[i].alram.length != 0) {
              Arr[i].alarm.setData(arr[i].alram);
            }
            // 没有报警数据
            else {
              Arr[i].alarm.setData([
                { lnglat: [-100, -100] }
              ]);
            }

            // ------------------------------非本区数据
            // 有非本区数据
            if (arr[i].un_area.length != 0) {
              Arr[i].un_area.setData(arr[i].un_area);
            }
            // 没有非本区数据
            else {
              Arr[i].un_area.setData([
                { lnglat: [-100, -100] }
              ]);
            }

          }
        },
      };
      for (k in fn) {
        me[k] = fn[k];
      };
    },
  };
  window["diyBdMap"] = diyBdMap;
})(jQuery, window);

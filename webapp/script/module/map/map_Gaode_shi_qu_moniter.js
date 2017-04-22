/**
 * Item Name  : 
 *Creator         :cc
 *Email            :cc
 *Created Date:2016.10.12
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
    // ---------------------------------微观
    this.f_small_timer = null;

    // ---------------------------------自行车
    // 海星的收集
    this.b_dom_arr = [];
    // 自行车的定时器
    this.b_timer = null;
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
        zoom: 20,
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
      // console.log(Sifu);
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
            var key = me.map.getZoom();
            console.log(key);
            // ----------------正面推进--已到达18级
            if (key == 18) {
              console.log('微观数据启动');
              me.map.setZoom(20);

              // 清除围栏宏观的定时器
              clearTimeout(me.f_big_timer);
              // 清除围栏数据
              me._haix_clear(me.f_big_dom_arr);
              // 微观数据启动
              me.f_small_ajax();
            }
            // 返回退出的时候
            else if (key == 19) {
              // me.map.setZoom(3);
              // 清除数据
              me.map.clearMap();
              // 清除围栏微观的定时器
              clearTimeout(me.f_small_timer);

              // -------------------------宏观开启
              me.f_big_arr = [];
              // 宏观模式的循环时间
              me.f_big_timer = null;
              // 海星围栏的收集
              me.f_big_dom_arr = [];
              // 围栏最优一次
              me.f_view = true;

              me.fence_big_ajax();
            }
          });
          me.map.on('dragstart', function() {
            var key = me.map.getZoom();
            // 20级的模式才生效
            if (key == 20) {
              clearTimeout(me.f_small_timer);
            }
          });
          me.map.on('dragend', function() {
            var key = me.map.getZoom();
            // 20级的模式才生效
            if (key == 20) {
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
        // ----------------------------------------------宏观
        //请求围栏的宏观数据
        fence_big_ajax: function() {
          var me = this;
          var arr = fence_data;
          if (arr.length > 0) {
            me._haix_clear(me.f_big_dom_arr);
            // me.map.clearMap();
            me.f_draw(arr);
            // 循环开始
            me.fence_big_ajax_interval();
          }
        },
        // 围栏的数据循环开始
        fence_big_ajax_interval: function() {
          var me = this;
          me.f_big_timer = setTimeout(function() {
            console.log('宏观数据开始');
            me.fence_big_ajax();
          }, Sifu.fence_big_time);
        },
        f_draw: function(arr) {
          var me = this;
          // 正常的海星模式
          me.f_draw_done(arr[0], Sifu.fence_nor);
          // 报警的海星
          me.f_draw_done(arr[1], Sifu.fence_unnor);
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

          var mass = new AMap.MassMarks(arr, {
            url: url,
            anchor: new AMap.Pixel(0, 0),
            size: new AMap.Size(Sifu.fence_size[0], Sifu.fence_size[1]),
            opacity: 1,
            cursor: 'pointer',
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
            // 清除围栏宏观的定时器
            clearTimeout(me.f_big_timer);
            // 清除围栏数据
            me._haix_clear(me.f_big_dom_arr);
            // 定位20级，缩放到相应的点
            me.map.setZoomAndCenter(20, e.data.lnglat)

            setTimeout(function() {
              me.f_small_ajax();
            }, 1500);
          });
          mass.setMap(me.map);
          me.f_big_dom_arr.push(mass);
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
            console.log('微观数据开始');
            me.f_small_ajax();
          }, Sifu.fence_small_time);
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
          var image = (item.all_sum > item.active_sum ? Sifu.fence_nor : Sifu.fence_unnor);
          var marker = new AMap.Marker({
            position: [item.lnglat[0], item.lnglat[1]],
            map: me.map
          });
          me.f_small_draw_maker_label(marker, image, item);
          marker.setOffset(new AMap.Pixel(-Sifu.fence_size[0] / 2, -Sifu.fence_size[1] + 2));
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
          var opts = Sifu.fence_styleOptions;
          opts.map = me.map;
          opts.path = path;
          // 围栏的数据
          new AMap.Polygon(opts);
        },
        // -----------------------------------------------自行车
        b_ajax: function() {
          var data = bike_data;
          me._haix_clear(me.b_dom_arr);
          for (var i = 0; i < data.length; i++) {
            me.b_ajax_draw(data[i])
          }
          me.b_ajax_interval();
        },
        // 围栏的数据循环开始
        b_ajax_interval: function() {
          var me = this;
          me.b_timer = setTimeout(function() {
            console.log('自行车数据开始');
            me.b_ajax();
          }, Sifu.bike_time);
        },
        // 具体打海星
        b_ajax_draw: function(item) {
          var me = this;
          var company = item.company
          me.b_draw_done(Sifu.bike_alarm,company, item.alram);
          me.b_draw_done(Sifu.bike_un_area,company, item.un_area);
        },
        // 自行车具体打mass
        b_draw_done: function(type,company, arr) {
          var me = this;
          var mass = new AMap.MassMarks(arr, {
            url:  type+ company + Sifu.bike_img_type,
            zooms:[3,20],
            anchor: new AMap.Pixel(0, 0),
            size: new AMap.Size(Sifu.bike_size[0], Sifu.bike_size[1]),
            opacity: 1,
            cursor: 'pointer',
            zIndex: 100
          });
          mass.on('mouseover', function(e) {
            str = '' +
              '<p>最后上传时间：' + cLib.base.formatterDateDay(e.data.last_time,false) + '</p>' +
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
            console.log(e);
            // 清除围栏宏观的定时器
            clearTimeout(me.f_big_timer);
            // 清除围栏数据
            me._haix_clear(me.f_big_dom_arr);
            // 定位20级，缩放到相应的点
            me.map.setZoomAndCenter(20, e.data.lnglat)

            setTimeout(function() {
              me.f_small_ajax();
            }, 1500);
          });
          mass.setMap(me.map);
          me.b_dom_arr.push(mass);
        },






        //具体打点
        _draw_done: function(arr, key) {
          var me = this;
          // 自定义点标记内容
          var markerContent = document.createElement("div");
          markerContent.className = "P_div";
          // 点标记中的图标
          var markerImg = document.createElement("img");
          markerImg.className = "markerlnglat";
          markerImg.src = "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png";
          markerContent.appendChild(markerImg);

          // 标记中的信息框
          var markerDIV = document.createElement("div");
          markerDIV.className = 'markLabel';
          markerDIV.innerHTML = '<span class="labelName" id="devName">景区名称：' + marker.name +
            '<br />' +
            '<span class="" id="devReceive" >自行车：' + marker.bikeQuantity + '</span>' +
            '<br />' +
            '</span>' +
            '<div class="labelArrow"></div>';
          markerContent.appendChild(markerDIV);

          marker.setContent(markerContent); //更新点标记内容
        },
        //区的点击事件
        s_click: function(marker) {

          // 记录下当前点击的景区marker
          me.s_ = marker;
          var data = null;
          if (marker.id == 1) {
            data = me.s1_data;
          } else if (marker.id == 2) {
            data = me.s2_data;
          } else if (marker.id == 3) {
            data = me.s3_data;
          }

          me.map.clearMap();
          // 区下面的监控层数据
          me.s_jk_draw(data.bikes);
          // 初始设置为true ，第一次进行视角最优化，接下来关闭
          me._jk_view = false;
          me._jk_timer = setTimeout(function() {
            me.s_click(marker);
          }, 2000);

          // 数据驱动
          data.bikes.forEach(function(item) {
            item.position.lng = item.position.lng + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
            item.position.lat = item.position.lat + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
          });

        },
        //------------------------------------------------------------------区监控数据
        s_jk_draw: function(data) {
          var me = this;
          data.forEach(function(item) {

            var marker = new AMap.Marker({
              position: [item.position.lng, item.position.lat],
              title: 'ID号:' + item.id,
              icon: new AMap.Icon({
                size: new AMap.Size(54, 46), //图标大小
                // imageSize:new AMap.Size(54, 46),
                image: "./images/car_online.png",
                // imageOffset: new AMap.Pixel(5, 5)
              })
            });

            // me.map.addOverlay(marker);
            marker.setMap(me.map);

            // 绑定marker的id
            marker.id = item.id;
            // 追踪模式
            marker.on('click', function(e) {
              var event = e || window.e;
              if (event && event.stopPropagation) {
                event.stopPropagation();
              } else {
                event.cancelBubble = true;
              }
              clearTimeout(me._jk_timer);
              // 退出到区的监控层
              me._trail_out();
              me.map.clearMap();
              me._trail(marker);
            });
          });
          if (me._jk_view) {
            // me.map.setViewport(geoPoints);
            me.map.setFitView();
          }
        },
        //退出到市监控层
        s_out: function() {

          var me = this;
          $('#p_btn').show();
          $('#p_btn').html('返回区监控');
          $('#p_btn').unbind().on('click', function() {
            clearTimeout(me._jk_timer);
            me.map.clearMap();
            $('#p_btn').hide();
            me._jk_view = true;
            me.s_ajax();
          });
        },
        //-------------------------------------------------------------------追踪
        _trail: function(marker) {
          //var opts = {
          //    bikeId:marker.id
          //};
          //API.baidu.b_trail(opts).done(function (data) {
          //    me.t_draw(data.bike);
          //    me.t_timer = setTimeout(function () {
          //        me.t_pContainer  = [];
          //        me.b_trail(marker);
          //    },2000);
          //});
          var data = {
            bike: {}
          };
          me.s_bikeData.forEach(function(item) {
            item.bikes.forEach(function(b_data) {
              if (b_data.id == marker.id) {
                data.bike = b_data;
                return;
              }
            })
          });
          // 拿到渲染数据
          me._trail_draw(data.bike);

          me._trail_timer = setTimeout(function() {
            me._trail(marker);
          }, 2000);


          data.bike.position.lng = data.bike.position.lng + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
          data.bike.position.lat = data.bike.position.lat + (Math.random() * Math.random() > 0.3 ? Math.random() * Math.random() : Math.random() * Math.random() * (0 - 1)) * 0.0005;
        },
        // 追踪渲染
        _trail_draw: function(item) {
          var me = this;
          if (me._trail_marker == null) {

            var marker = me._trail_marker = new AMap.Marker({
              position: [item.position.lng, item.position.lat],
              title: 'ID号:' + item.id,
              icon: new AMap.Icon({
                size: new AMap.Size(54, 46), //图标大小
                // imageSize:new AMap.Size(54, 46),
                image: "./images/car_online.png",
                // imageOffset: new AMap.Pixel(5, 5)
              })
            });

            // me.map.addOverlay(marker);
            marker.setMap(me.map);
            marker.setOffset(new AMap.Pixel(-15, -48));

          } else {
            var newPoint = [item.position.lng, item.position.lat];
            var oldP = me._trail_marker.getPosition();
            var oldPoint = [oldP.lng, oldP.lat];

            me._trail_line([oldPoint, newPoint], {});
            me._trail_marker.setPosition(newPoint); //移动到新的数据点上
          }
          me.map.setFitView([me._trail_marker]);
        },
        //退出追踪层，进入区下面的监控层
        _trail_out: function() {
          var me = this;
          $('#p_btn').html('退出追踪');
          $('#p_btn').unbind().on('click', function() {
            clearTimeout(me._trail_timer);
            me.map.clearMap();
            $('#p_btn').hide();
            // 区下面的监控层的最优视角开启
            me._jk_view = true;

            me._trail_marker = null;
            me.s_out();
            // 进入当前记录下的区的marker，然后进入区下的监控
            me.s_click(me.s_);
          });
        },
        //追踪的线
        _trail_line: function(points, opts) {
          var me = this;
          var polyLine = new AMap.Polyline({
            path: points,
            strokeColor: (opts.color || "#21536d"),
            strokeWeight: (opts.weight || 4),
            strokeOpacity: (opts.opacity || 0.8)
          });
          polyLine.setMap(me.map);
        },
      };
      for (k in fn) {
        me[k] = fn[k];
      };
    },




    //景区的数据，渲染数据
    hall_ajaxBackData: function() {
      var me = this;
      me.clearPointer();

      API.baidu.scenic().done(function(data) {
        console.log(data)
      });
      //me.hall_makePointer(me.hallData);


    },
    //地图清除点
    clearPointer: function() {
      var me = this;
      var allOverlay = me.map.getOverlays();
      for (var i = 0; i < allOverlay.length; i++) {
        me.map.removeOverlay(allOverlay[i]);
      };
    },
    //景区生成地图点
    hall_makePointer: function(data) {

      var me = this;

      var geoPoints = [];

      var convertData = me.convertCoord({ 'lng': data.lng, 'lat': data.lat });
      var pt = new BMap.Point(convertData.lng, convertData.lat);
      geoPoints.push(pt);

      var iconPath = "../images/icon/car_online";
      var myIcon = new BMap.Icon(iconPath, new BMap.Size(15, 15));
      var marker = new BMap.Marker(pt, { icon: myIcon });

      me.map.addOverlay(marker);
      me.map.setViewport(geoPoints);

      me.map.enableScrollWheelZoom(); //缩放功能开启
    },
    //楼------预案信息弹出
    hall_planShow: function(data) {
      var me = this;
      layer.open({
        type: 2,
        title: '预案文档',
        offset: 'rb',
        area: 'auto',
        maxmin: true,
        closeBtn: 0,
        shade: 0,
        zIndex: 500,
        shadeClose: false, //点击遮罩关闭
        content: data,
      });
    },

    //两大按钮的事件函数
    event: function() {
      var me = this;
      me.manage_carsEvent();
      me.device_event();
    },

    //人车管理得点击事件
    manage_carsEvent: function() {
      var me = this;
      me.cars = $('#dom_rcc');
      me.cars.click(function() {
        //鼠标没有点----出现点及围栏
        if (me.cars.attr('click_key') == undefined) {
          $(this).animate({ 'width': '90px', 'fontSize': '18px' })
            .css({ 'backgroundColor': '#21536d', color: 'white' }, 50);

          me.cars.attr('click_key', true);
          me.manage_ajaxCarsData();
        } else {
          $(this).animate({ 'width': '72px', 'fontSize': '14px' })
            .css({ 'backgroundColor': 'white', color: '#21536d' }, 50);

          me.cars.attr('click_key', null);
          clearTimeout(me.carsTimer);
          me.manage_clearCarsData();
        };
      });

      if (me.closeBtnKey) {
        me.cars.click();
      }
    },
    //请求回人车的数据
    manage_ajaxCarsData: function() {
      var me = this;

      //var asd = [{
      //    position:{lng:4545,lat:45454},
      //    carNum:000,
      //    phone:000,
      //    name:4545,
      //}];
      getDevice.hall_carsMansData().done(function(data) {
        me.manage_clearCarsData();
        var carsData = data.manCars;
        me.manage_darwCarsData(carsData);
        me.carsViews = false;
        me.carsTimer = setTimeout(function() {
          me.manage_ajaxCarsData();
        }, 2000);
      });

    },
    //所有的数据进行打点--最佳视角
    manage_darwCarsData: function(data) {
      var me = this;
      for (var i = 0; i < data.length; i++) {
        var iconPath = '';
        if (data[i].type == 1) {
          iconPath = "../images/car_online.png";
        } else {
          iconPath = "../images/view_man.png";
        }

        var convertData = me.convertCoord({ 'lng': data[i].position.lng, 'lat': data[i].position.lat });
        var pt = new BMap.Point(convertData.lng, convertData.lat);

        if (me.carsViews) {
          me.carsPointers.push(pt);
        }
        var myIcon = new BMap.Icon(iconPath, new BMap.Size(54, 46));
        var marker = new BMap.Marker(pt, { icon: myIcon });

        marker.id = data[i].id;
        me.manage_clickCarsEvent(marker);


        if (data[i].type == 1) {
          marker.setTitle('车牌号：' + data[i].carNum + '; 电话：' + data[i].phone);
        } else {
          marker.setTitle('联系人：' + data[i].name + '; 电话：' + data[i].phone);
        }
        me.map.addOverlay(marker);
        me.carsMarkers.push(marker);
      };

      if (me.carsViews) {
        me.map.setViewport(me.carsPointers);
      }

    },
    //清除所有人车的的数据
    manage_clearCarsData: function() {
      var me = this;
      var allOverlay = me.carsMarkers;
      for (var i = 0; i < allOverlay.length; i++) {
        me.map.removeOverlay(allOverlay[i]);
      };
      me.carsMarkers = [];
    },
    //每个人车的点击事件
    manage_clickCarsEvent: function(dom) {
      var me = this;
      dom.onclick = function() {
        if (me.carsClickKey) {
          me.carsClickKey = false;

          //清除人车的定时器和点
          clearTimeout(me.carsTimer);
          me.manage_clearCarsData();

          //清除两大功能按钮
          me.map.removeControl(me.newBtns_two);

          //添加退出追踪按钮
          me.newBtns_closeMonitor = new fc.module.diyBdMapTools({
            bdMap: me.map,
            mode: true,
            btns: ['退出追踪tcz'],
            anchor: BMAP_ANCHOR_TOP_LEFT,
            offset: new BMap.Size(10, 10),
          });
          me.map.addControl(me.newBtns_closeMonitor);
          me.manage_closeMonitor();

          var opts = { manCarId: dom.id };

          me.manage_ajaxOneCarData(opts);
        }
      };

    },
    //请求回单个设备的人车的数据
    manage_ajaxOneCarData: function(opts) {
      var me = this;
      getDevice.hall_oneCarsMansData(opts).done(function(data) {
        var carsData = data.manCar;
        me.oneCarsPointers = [];
        me.manage_darwOneCarsData([carsData]);
        me.onecarsTimer = setTimeout(function() {
          me.manage_ajaxOneCarData(opts);
        }, 2000);
      });

    },
    //单个设备的打点和移动
    manage_darwOneCarsData: function(data) {
      var me = this;
      if (me.oneCar == null) {
        //打点打label
        for (var i = 0; i < data.length; i++) {
          var iconPath = '';
          if (data[i].type == 1) {
            iconPath = "../images/car_online.png";
          } else {
            iconPath = "../images/view_man.png";
          }

          var convertData = me.convertCoord({ 'lng': data[i].position.lng, 'lat': data[i].position.lat });
          var pt = new BMap.Point(convertData.lng, convertData.lat);

          me.oneCarsPointers.push(pt);

          var myIcon = new BMap.Icon(iconPath, new BMap.Size(54, 46));
          var marker = me.oneCar = new BMap.Marker(pt, { icon: myIcon });
          marker.setOffset(new BMap.Size(6, -22)); //设置marker偏移以和点对上

          //label信息--设置
          var labelInfo = '<div class="markLabel">' +
            '<span class="labelName" id="devName">车牌号：' + data[i].carNum +
            '<br />' +
            '<span class="" id="devReceive" >速度：' + data[i].position.speed + "km/h</span>" +
            '<br />' +
            '</span>' +
            '<div class="labelArrow"></div>' +
            '</div>';
          var label = new BMap.Label(labelInfo, { offset: new BMap.Size(-35, -48) });
          label.setStyle({
            'backgroundColor': 'transparent',
            'border': 'none'
          });
          marker.setLabel(label);

          marker.lableInstance = label;

          if (data[i].type == 1) {
            marker.setTitle('车牌号：' + data[i].carNum + '; 电话：' + data[i].phone);
          } else {
            marker.setTitle('联系人：' + data[i].name + '; 电话：' + data[i].phone);
          }
          me.map.addOverlay(marker);
        };
      } else {
        for (var j = 0; j < data.length; j++) {
          var convertData = me.convertCoord({ 'lng': data[j].position.lng, 'lat': data[j].position.lat });
          var newPoint = new BMap.Point(convertData.lng, convertData.lat);

          me.oneCarsPointers.push(newPoint);

          var oldPoint = me.oneCar.getPosition();
          me.addPolyLine([oldPoint, newPoint], {});
          me.oneCar.setPosition(newPoint); //移动到新的数据点上

          $('#devReceive').html('速度：' + data[j].position.speed + 'km/h');
        }
      }
      me.map.setViewport(me.oneCarsPointers);
    },
    //退出追踪的事件
    manage_closeMonitor: function() {
      var me = this;
      me.btn_closeMonitor = $('#dom_tcz');
      me.btn_closeMonitor.click(function() {
        me.closeBtnKey = true;
        me.map.removeControl(me.newBtns_closeMonitor);
        clearTimeout(me.onecarsTimer); //清除单个设备的定时器
        me.map.clearOverlays();
        me.carsViews = true; //开启最佳视角
        me.carsClickKey = true; //回归没有点击DOME，没有信息框，有点击事件可以点击
        me.oneCar = null; //回归单个设备容器还没有收集marker
        me.init(me.row); //全部设备渲染

      });
    },

    //周边力量
    device_event: function() {
      var me = this;
      me.zll = $('#dom_zll')
      me.zll.click(function() {
        if (me.zll.attr('click_key') == undefined) {
          $(this).animate({ 'width': '90px', 'fontSize': '18px' })
            .css({ 'backgroundColor': '#21536d', color: 'white' }, 50);

          me.zll.attr('click_key', true);
          me.device_range();
        } else {
          $(this).animate({ 'width': '72px', 'fontSize': '14px' })
            .css({ 'backgroundColor': 'white', color: '#21536d' }, 50);
          me.zll.attr('click_key', null);

          layer.close(me.layerIndex);
          me.device_rangeClear();
          me.device_devsClear();

        };
      });
    },
    //所有消防栓的范围
    device_range: function() {
      var me = this;
      var r = me.circle ? me.circle.getRadius() : 100;
      var convertData = me.convertCoord({ 'lng': me.hallData.lng, 'lat': me.hallData.lat });
      me.circle = circle = new BMap.Circle(new BMap.Point(convertData.lng, convertData.lat), r, { strokeColor: "red", strokeWeight: 1, fillOpacity: 0.1, fillColor: 'red' });
      me.map.addOverlay(circle);
      me.rangeMarkers.push(circle);

      //弹窗信息
      me.layerIndex = layer.open({
        type: 1,
        title: '消防栓信息',
        offset: ['55px', '10px'],
        area: 'auto',
        shade: 0,
        zIndex: 400,
        closeBtn: 0,
        shadeClose: false, //点击遮罩关闭
        content: '<div id = "manForFire">' +
          '<div class="Fire_info">楼宇联系人：' + me.manForFire + '</div>' +
          '<div class="Fire_info">联系人电话：' + me.phoneForFire + '</div>' +
          '</div>' +
          '<ul id = "devUl" style="width: auto"></ul>',
      });

      //初始化的时候就进行一次请求
      var opts = {
        center: [me.hallData.lng, me.hallData.lat],
        radius: me.circle.getRadius(),
      };
      me.device_mouseout(opts);

      circle.addEventListener('mouseover', function() {
        me.circle.enableEditing();
      });
      circle.addEventListener('mouseout', function() {
        me.circle.disableEditing();
        if (me.rangeMarkers.length) {
          me.device_mouseout(opts);
        }
      });



    },
    //清除圆圈的时候就把装圆的容器清空
    device_rangeClear: function() {
      var me = this;
      var allOverlay = me.rangeMarkers;
      for (var i = 0; i < allOverlay.length; i++) {
        me.map.removeOverlay(allOverlay[i]);
      };
      me.rangeMarkers = [];
    },
    device_mouseout: function(opts) {
      var me = this;
      //信息框--信息为空

      getDevice.hall_fireplugData(opts).done(function(data) {
        $('#devUl').html('');
        me.device_devsClear();
        me.device_drawDevsData(data.device);
      });

    },
    //消防栓打点
    device_drawDevsData: function(data) {
      var me = this;
      for (var i = 0; i < data.length; i++) {
        var iconPath = '../images/dev.png';
        var convertData = me.convertCoord({ 'lng': data[i].lng, 'lat': data[i].lat });
        var pt = new BMap.Point(convertData.lng, convertData.lat);
        var myIcon = new BMap.Icon(iconPath, new BMap.Size(30, 30));
        var marker = new BMap.Marker(pt, { icon: myIcon });
        marker.setTitle('名称：' + data[i].name);
        me.map.addOverlay(marker);
        me.devsMarkers.push(marker);

        $('#devUl').append(
          '<li class="dev_info">' +
          '<span>名称：' + data[i].name + '</span>' +
          '<span class="info_wp">水压：' + data[i].waterPress + '</span>' +
          '<span class="info_t">最后通信时间：' + formatterDateDay(data[i].lastTime) + '</span>' +
          '</li>'
        );
      };
    },
    //清除所有消防栓
    device_devsClear: function() {
      var me = this;
      var allOverlay = me.devsMarkers;
      for (var i = 0; i < allOverlay.length; i++) {
        me.map.removeOverlay(allOverlay[i]);
      };
      me.devsMarkers = [];
    },

    //添加折线
    addPolyLine: function(points, opts) {
      var me = this;
      var polyLine = new BMap.Polyline(points, {
        strokeColor: (opts.color || "#21536d"),
        strokeWeight: (opts.weight || 4),
        strokeOpacity: (opts.opacity || 0.8)
      });
      me.map.addOverlay(polyLine);
    },
    convertCoord: function(oLnglat) {
      var me = this;
      var lnglat = {};
      var corG = convertWgsToGcj02(oLnglat.lng, oLnglat.lat);
      if (corG != false) {
        var corP = convertGcj02ToBd09(corG.longitude, corG.latitude);
        lnglat = { lng: corP.longitude, lat: corP.latitude };
      } else {
        lnglat = oLnglat;
      }
      return lnglat;
    },

  };
  window["diyBdMap"] = diyBdMap;
})(jQuery, window);

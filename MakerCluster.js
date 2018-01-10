/**
 * Created by PhpStorm.
 * User: jim
 * Date: 2017/11/07
 * Update: 2017/11/28
 * Time: 18:31
 * version: 0.6
 * desc:
 * v0.6 use new markers cluster algorithm
 * v0.5 optimize second cluster markers distance and center point algorithm
 * v0.4 optimize cluster markers
 * v0.3 enlarge cluster area, optimize user move map experience
 * v0.2 recluster clustered markers
 * v0.1 Complete basic functions
 */
var MyMakerCluster = {
    createNew: function(){

        var myMakerCluster = {};
        //每条边生成的网格数(纵横一致)
        var girdlngNum = 4;
        var girdlatNum = 8;
        //扩大聚合倍数
        var zoomLevel = 1;
        var zoomgirdlngNum = girdlngNum*(zoomLevel*2+1);
        var zoomgirdlatNum = girdlatNum*(zoomLevel*2+1);
        var tmaxX = 0;
        var tminX = 0;
        var tmaxY = 0;
        var tminY = 0;
        var lnggap = 0;
        var latgap = 0;
        var temp = [];
        var clusteredMarkers = new Array();

        /**
        * @desc 初始化算法v0.5
        * @param float maxX 最高经度
        * @param float minX 最低经度
        * @param float maxY 最高维度
        * @param float minY 最低维度
        * */
        myMakerCluster.init = function(maxX,minX,maxY,minY,PointList,isMapZoom){
            var girdlist = myMakerCluster.createGird(maxX,minX,maxY,minY,isMapZoom);
            myMakerCluster.makerCluster(PointList,girdlist);
            myMakerCluster.calcCenter();
            myMakerCluster.optimizeClusterPoint();
            return clusteredMarkers;
        }
        /**
         * @desc 初始化算法v0.6
         * @param float maxX 最高经度
         * @param float minX 最低经度
         * @param float maxY 最高维度
         * @param float minY 最低维度
         * */
        myMakerCluster.initv2 = function(maxX,minX,maxY,minY,PointList){
            myMakerCluster.markerClusterV2(maxY,maxX,minY,minX,PointList);
            return clusteredMarkers;
        }
        /**
        * @desc 根据需要聚合的范围生成网格
        * @param float maxX 最高经度
        * @param float minX 最低经度
        * @param float maxY 最高维度
        * @param float minY 最低维度
        * */
        myMakerCluster.createGird = function(maxX,minX,maxY,minY,isMapZoom){
            myMakerCluster.ZoomArea(maxX,minX,maxY,minY,isMapZoom);
            var clng = tminX;
            var girdlist = new Array();
            var lngtemp = 0;
            var lattemp = 0;
            var m = 0;
            for (var i=1;i <= zoomgirdlngNum;i++){
                lngtemp = clng + lnggap;
                if (i == zoomgirdlngNum){
                    lngtemp = tmaxX;
                }
                var lattemp = 0;
                var clat = tminY;
                for (var j=1;j <= zoomgirdlatNum;j++){
                    lattemp = clat + latgap;
                    if (j == zoomgirdlatNum){
                        lattemp = tmaxY;
                    }
                    girdlist[m] = [clng,lngtemp,clat,lattemp];
                    clusteredMarkers[m] = {center: {lng:0,lat:0}, markers: [], isClustered: -1};
                    m++;
                    clat += latgap;
                }
                clng += lnggap;
            }
            console.log(girdlist)
            return girdlist;
        };

        /**
        * @desc 设置网格生成纵横的数量
        * @param float newlngNum 经度切分个数
        * @param float newlatNum 纬度切分个数
        * @param int newzoomLevel 聚合范围单方向缩放倍数
        * */
        myMakerCluster.setGirdNum = function(newlngNum,newlatNum,newzoomLevel){
            girdlngNum = newlngNum;
            girdlatNum = newlatNum;
            zoomLevel = newzoomLevel;
        };

        /**
        * @desc 判断标记点是否在范围内
        * @param array markerlist 要聚合的点数组
        * @param array girdlist 网格数组
        * */
        myMakerCluster.makerCluster = function(markerlist,girdlist){
            var lng;
            var lat;
            for(var i=0;i<markerlist['data'].length;i++){
                lng = parseFloat(markerlist['data'][i]['longitude']);
                lat = parseFloat(markerlist['data'][i]['latitude']);
                if (lng>tmaxX||lng<tminX||lat>tmaxY||lat<tminY){
                    // markerlist[i].isClustered = false;
                    continue;
                } else {
                    for (var j=0;j<girdlist.length;j++){
                        if (j>=girdlist.length){
                            continue;
                        }
                        if (lng<girdlist[j][0] || lng>girdlist[j][1]){
                            j = j + zoomgirdlatNum;
                            continue;
                        }
                        if (lng>girdlist[j][0] && lng<girdlist[j][1] && lat>girdlist[j][2] && lat<girdlist[j][3]){
                            // markerlist[i].isClustered = true;
                            if (clusteredMarkers[j].markers.length >= 1){
                                clusteredMarkers[j]['markers'].push(markerlist['data'][i]);
                                clusteredMarkers[j]['isClustered'] = 1;
                            } else {
                                clusteredMarkers[j]['isClustered'] = 0;
                                clusteredMarkers[j]['markers'].push(markerlist['data'][i]);
                            }
                            break;
                        }
                    }
                }
            }
        };
        /**
        * @desc 计算聚合点中心位置
        * */
        myMakerCluster.calcCenter = function(){
            for(var i = 0;i<clusteredMarkers.length;i++){
                if (clusteredMarkers[i].isClustered == -1){
                    continue;
                }
                try{
                    // var m = clusteredMarkers[i].markers;
                    if (clusteredMarkers[i].markers.length > 1 ){
                        var lng = 0;
                        var lat = 0;
                        var num = clusteredMarkers[i].markers.length;
                        for(var j = 0;j < clusteredMarkers[i].markers.length;j++){
                            lng += parseFloat(clusteredMarkers[i].markers[j].longitude);
                            lat += parseFloat(clusteredMarkers[i].markers[j].latitude);
                        }
                        clusteredMarkers[i].center.lat = lat / num;
                        clusteredMarkers[i].center.lng = lng / num;
                    } else {
                        clusteredMarkers[i].center.lat = clusteredMarkers[i].markers[0].latitude;
                        clusteredMarkers[i].center.lng = clusteredMarkers[i].markers[0].longitude;
                    }
                } catch (e) {
                    clusteredMarkers[i] = {center: {lng:0,lat:0}, markers: [], isClustered: -1};
                }
            }
        }

        /**
        * @desc 优化聚合点（尝试将靠近的聚合点再次聚合）
        * */
        myMakerCluster.optimizeClusterPoint = function(){
            for(var i = 0;i<clusteredMarkers.length;i++){
                if (clusteredMarkers[i].isClustered == -1){
                    continue;
                }
                var a = i + 1;
                var b = i + zoomgirdlngNum;
                var c = b - 1;
                var d = b + 1;
                temp = [clusteredMarkers[i]];
                //聚合点再次聚合的距离设定为屏幕对角线的1/12
                var clusDis = myMakerCluster.getDistance(tmaxY,tmaxX,tminY,tminX)/(12*(zoomLevel*2+1));

                var SelfLat = clusteredMarkers[i].center.lat;
                var selfLng = clusteredMarkers[i].center.lng;

                if (i==0||i%zoomgirdlngNum==0){
                    myMakerCluster.compareClusterPoint(i,a,SelfLat,selfLng,clusDis);
                    myMakerCluster.compareClusterPoint(i,d,SelfLat,selfLng,clusDis);
                } else if ((i+1)%zoomgirdlngNum==0){
                    myMakerCluster.compareClusterPoint(i,c,SelfLat,selfLng,clusDis);
                } else{
                    myMakerCluster.compareClusterPoint(i,a,SelfLat,selfLng,clusDis);
                    myMakerCluster.compareClusterPoint(i,d,SelfLat,selfLng,clusDis);
                    myMakerCluster.compareClusterPoint(i,c,SelfLat,selfLng,clusDis);
                }
                myMakerCluster.compareClusterPoint(i,b,SelfLat,selfLng,clusDis);
                if (temp.length>1){
                    myMakerCluster.calcClusterPointCenter(temp,i);
                }
            }
        }

        /**
        * @desc 根据两个坐标计算距离
        * @param array lat1 纬度1
        * @param array lng1 经度2
        * @param array lat2 纬度2
        * @param array lng2 经度2
        * */
        myMakerCluster.getDistance = function (lat1, lng1, lat2, lng2) {
            var earthRadius = 6367000;
            lat1 = (lat1 * Math.PI) / 180;
            lng1 = (lng1 * Math.PI) / 180;
            lat2 = (lat2 * Math.PI) / 180;
            lng2 = (lng2 * Math.PI) / 180;
            var calcLongitude = lng2 - lng1;
            var calcLatitude = lat2 - lat1;
            var stepOne = Math.pow(Math.sin(calcLatitude / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(calcLongitude / 2), 2);
            var stepTwo = 2 * Math.asin(Math.min(1, Math.sqrt(stepOne)));
            var calculatedDistance = earthRadius * stepTwo ;
            return parseFloat(calculatedDistance);
        }

        /**
        * @desc 根据处理两个聚合点的重复比对
        * @param int i 本聚合点的索引值
        * @param int j 本次要比对的聚合点的索引值
        * @param long SelfLat 本次计算的聚合点的纬度
        * @param long selfLng 本次计算的聚合点的经度
        * @param long clusDis 聚合的距离
        * @return array clusteredMarkers 聚合后的数据
        * */
        myMakerCluster.compareClusterPoint = function (i,j,SelfLat,selfLng,clusDis) {
            if (j>=clusteredMarkers.length){
                return clusteredMarkers;
            } else if (clusteredMarkers[j].isClustered != -1){
                var Lat = clusteredMarkers[j].center.lat;
                var Lng = clusteredMarkers[j].center.lng;
                if (myMakerCluster.getDistance(SelfLat,selfLng,Lat,Lng)<clusDis){
                    temp.push(clusteredMarkers[j]);
                    clusteredMarkers[i].markers = clusteredMarkers[i].markers.concat(clusteredMarkers[j].markers);
                    clusteredMarkers[j] = {center: {lng:0,lat:0}, markers: [], isClustered: -1};
                }
            }
        }

        /**
        * @desc 根据处理两个聚合点的重复比对
        * @param int j 当前处理索引
        * */
        myMakerCluster.calcClusterPointCenter = function(temp,j){
            // var num = temp.length;
            // var lng = 0;
            // var lat = 0;
            // for(var i = 0;i<num;i++){
            //     lng += temp[i].center.lng;
            //     lat += temp[i].center.lat;
            // }
            // clusteredMarkers[j].center.lat = lat / num;
            // clusteredMarkers[j].center.lng = lng / num;
            // if (j>=clusteredMarkers.length){
            //     return clusteredMarkers;
            // }
            try{
                // var m = clusteredMarkers[i].markers;
                if (clusteredMarkers[j].markers.length > 1 ){
                    var lng = 0;
                    var lat = 0;
                    var num = clusteredMarkers[j].markers.length;
                    for(var i = 0;i < clusteredMarkers[j].markers.length;j++){
                        lng += parseFloat(clusteredMarkers[j].markers[i].longitude);
                        lat += parseFloat(clusteredMarkers[j].markers[i].latitude);
                    }
                    clusteredMarkers[j].center.lat = lat / num;
                    clusteredMarkers[j].center.lng = lng / num;
                } else {
                    clusteredMarkers[j].center.lat = clusteredMarkers[j].markers[0].latitude;
                    clusteredMarkers[j].center.lng = clusteredMarkers[j].markers[0].longitude;
                }
            } catch (e) {
                clusteredMarkers[j] = {center: {lng:0,lat:0}, markers: [], isClustered: -1};
            }
        }

        /**
        * @desc 缩放聚合的地图范围
        * @param float maxX 最大经度
        * @param float minX 最小经度
        * @param float maxY 最大纬度
        * @param float minY 最小纬度
         * @param bool isMapZoom 地图是否缩放
        * * */
        myMakerCluster.ZoomArea = function(maxX,minX,maxY,minY,isMapZoom){
            console.log(isMapZoom)
            if (isMapZoom){
                myMakerCluster.OptZoomVariable(maxX,minX,maxY,minY);
            } else {
                tmaxX = store.get('maxX');
                tminX = store.get('minX');
                tmaxY = store.get('maxY');
                tminY = store.get('minY');
                lnggap = (maxX - minX) / girdlngNum;
                latgap = (maxY - minY) / girdlatNum;
                console.log(lnggap);
                console.log(latgap);
                if (tmaxX==null||tminX==null||tmaxY==null||tminY==null){
                    myMakerCluster.OptZoomVariable(maxX,minX,maxY,minY);
                } else {
                    if (maxX>tmaxY||minX<tminY||maxY>tmaxX||minY<tminX){
                        myMakerCluster.OptZoomVariable(maxX,minX,maxY,minY);
                    }
                }
            }
        }

        /**
         * @desc 缩放聚合的地图范围
         * @param float maxX 最大经度
         * @param float minX 最小经度
         * @param float maxY 最大纬度
         * @param float minY 最小纬度
         * * */
        myMakerCluster.OptZoomVariable = function(maxX,minX,maxY,minY){
            lnggap = (maxX - minX) / girdlngNum;
            latgap = (maxY - minY) / girdlatNum;
            console.log(lnggap);
            console.log(latgap);
            tmaxX = maxX+(lnggap*zoomLevel*girdlngNum);
            tminX = minX-(lnggap*zoomLevel*girdlngNum);
            tmaxY = maxY+(latgap*zoomLevel*girdlatNum);
            tminY = minY-(latgap*zoomLevel*girdlatNum);
            store.set('maxX',tmaxX);
            store.set('minX',tminX);
            store.set('maxY',tmaxY);
            store.set('minY',tminY);
        }


        /**
         * @desc 根据点的圆半径计算是否聚合
         * @param array PointList 最大经度
         * @param float maxX 最大经度
         * @param float minX 最小经度
         * @param float maxY 最大纬度
         * @param float minY 最小纬度
         * * */
        myMakerCluster.markerClusterV2 = function (maxY,maxX,minY,minX,PointList) {
            var lng;
            var lat;
            var temp;
            var skip;
            var clusDis = myMakerCluster.getDistance(maxY,maxX,minY,minX)/(12*(zoomLevel*2+1));
            for (var i = 0;i < PointList['data'].length;i++){
                if (lng>maxX||lng<minX||lat>maxY||lat<minY){
                    continue;
                }
                skip = false;
                lng = parseFloat(PointList['data'][i]['longitude']);
                lat = parseFloat(PointList['data'][i]['latitude']);
                if (clusteredMarkers.length==0){
                    temp = {center: {lng:lng,lat:lat}, markers: [PointList['data'][i]], isClustered: 0};
                    clusteredMarkers.push(temp);
                    continue;
                }
                for (var j = 0;j < clusteredMarkers.length;j++){

                    var distance = myMakerCluster.getDistance(lat, lng, clusteredMarkers[j].center.lat, clusteredMarkers[j].center.lng);
                    if (distance<clusDis){
                        clusteredMarkers[j].markers.push(PointList['data'][i]);
                        clusteredMarkers[j].isClustered = 1;
                        var num = clusteredMarkers[j].markers.length;
                        var newlng = 0;
                        var newlat = 0;
                        for(var m = 0;m < clusteredMarkers[j].markers.length;m++){
                            // console.log(clusteredMarkers[j].markers[m])
                            newlng += parseFloat(clusteredMarkers[j].markers[m].longitude);
                            newlat += parseFloat(clusteredMarkers[j].markers[m].latitude);
                        }
                        clusteredMarkers[j].center.lat = newlat / num;
                        clusteredMarkers[j].center.lng = newlng / num;
                        skip = true;
                        continue;
                    }
                }
                if (skip){
                    continue;
                }
                temp = {center: {lng:lng,lat:lat}, markers: [PointList['data'][i]], isClustered: 0};
                clusteredMarkers.push(temp);
            }
        }


        return myMakerCluster;
    }
};
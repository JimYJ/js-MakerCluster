[![License](http://img.shields.io/badge/license-mit-blue.svg?style=flat-square)](https://raw.githubusercontent.com/ugorji/go/master/LICENSE)

#update
 * version: 0.6
 * desc:
 * v0.6 use new markers cluster algorithm
 * v0.5 optimize second cluster markers distance and center point algorithm
 * v0.4 optimize cluster markers
 * v0.3 enlarge cluster area, optimize user move map experience
 * v0.2 recluster clustered markers
 * v0.1 Complete basic functions
 

#How to use
```javascript
//grid algorithm
var rs = mc.init(lngmaxX,lngminX,latmaxY,latminY,PointList);
//distance algorithm
var rs = mc.initv2(lngmaxX,lngminX,latmaxY,latminY,PointList);
```
PointList json format:
```json
{
	"data": [{
		"longitude": "120.18803",
		"latitude": "30.35983"
	}, {
		"longitude": "120.20222",
		"latitude": "30.35844"
	}]
}
```
 
#example for tencent map:
```javascript
//grid algorithm
var rs = mc.init(map.getBounds().lng.maxX,map.getBounds().lng.minX,map.getBounds().lat.maxY,map.getBounds().lat.minY,PointList);
//distance algorithm
var rs = mc.initv2(map.getBounds().lng.maxX,map.getBounds().lng.minX,map.getBounds().lat.maxY,map.getBounds().lat.minY,PointList);
```

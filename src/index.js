import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import createSupplementaryPoints from '@mapbox/mapbox-gl-draw/src/lib/create_supplementary_points';
import * as CommonSelectors from '@mapbox/mapbox-gl-draw/src/lib/common_selectors';
import moveFeatures from '@mapbox/mapbox-gl-draw/src/lib/move_features';

import { lineString, point } from '@turf/helpers';
import bearing from '@turf/bearing';
import center from '@turf/center';
import midpoint from '@turf/midpoint';
import distance from '@turf/distance';
import destination from '@turf/destination';
import transformRotate from '@turf/transform-rotate';
import transformScale from '@turf/transform-scale';
import bbox from '@turf/bbox';
import transformTranslate from '@turf/transform-translate';
import rhumbBearing from '@turf/rhumb-bearing';

var rotate = require('./img/rotate.png');
var scale = require('./img/scale.png');

export const SRMode = {}; //scale rotate mode

export const SRCenter = {
  Center: 0, // rotate or scale around center of polygon
  Opposite: 1, // rotate or scale around opposite side of polygon
};
const themeColor = '#3FFFFD';
const fillOpacity = 0.1;
export const SRStyle = [
  {
    id: 'gl-draw-polygon-fill-inactive',
    type: 'fill',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    paint: {
      'fill-color': themeColor,
      'fill-outline-color': themeColor,
      'fill-opacity': fillOpacity
    }
  },
  {
    id: 'gl-draw-polygon-fill-active',
    type: 'fill',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': themeColor,
      'fill-outline-color': themeColor,
      'fill-opacity': fillOpacity
    }
  },
  {
    id: 'gl-draw-polygon-midpoint',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 3,
      'circle-color': themeColor
    }
  },
  {
    id: 'gl-draw-polygon-stroke-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': themeColor,
      'line-width': 2
    }
  },
  {
    id: 'gl-draw-polygon-stroke-active',
    type: 'line',
    filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': themeColor,
      'line-dasharray': [0.2, 2],
      'line-width': 2
    }
  },
  {
    id: 'gl-draw-line-inactive',
    type: 'line',
    filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': themeColor,
      'line-width': 2
    }
  },
  {
    id: 'gl-draw-line-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': themeColor,
      'line-dasharray': [0.2, 2],
      'line-width': 2
    }
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#fff'
    }
  },
  {
    id: 'gl-draw-polygon-and-line-vertex-inactive',
    type: 'circle',
    filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
    paint: {
      'circle-radius': 3,
      'circle-color': themeColor
    }
  },
  {
    id: 'gl-draw-point-point-stroke-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static']
    ],
    paint: {
      'circle-radius': 5,
      'circle-opacity': 1,
      'circle-color': '#fff'
    }
  },
  {
    id: 'gl-draw-point-inactive',
    type: 'circle',
    filter: [
      'all',
      ['==', 'active', 'false'],
      ['==', '$type', 'Point'],
      ['==', 'meta', 'feature'],
      ['!=', 'mode', 'static']
    ],
    paint: {
      'circle-radius': 3,
      'circle-color': themeColor
    }
  },
  {
    id: 'gl-draw-point-stroke-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'active', 'true'], ['!=', 'meta', 'midpoint']],
    paint: {
      'circle-radius': 7,
      'circle-color': '#fff'
    }
  },
  {
    id: 'gl-draw-point-active',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['!=', 'meta', 'midpoint'], ['==', 'active', 'true']],
    paint: {
      'circle-radius': 5,
      'circle-color': themeColor
    }
  },
  {
    id: 'gl-draw-polygon-fill-static',
    type: 'fill',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': '#404040',
      'fill-outline-color': '#404040',
      'fill-opacity': fillOpacity
    }
  },
  {
    id: 'gl-draw-polygon-stroke-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2
    }
  },
  {
    id: 'gl-draw-line-static',
    type: 'line',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': '#404040',
      'line-width': 2
    }
  },
  {
    id: 'gl-draw-point-static',
    type: 'circle',
    filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Point']],
    paint: {
      'circle-radius': 5,
      'circle-color': '#404040'
    }
  },
  {
    id: 'gl-draw-point-scale-rotate-mode-rotate-icon',
    type: 'symbol',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['==', 'icon', 'rotate'],
      ['==', '$type', 'Point'],
      ['==', 'mode', 'rotate']
    ],
    layout: {
      'icon-image': 'rotate',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-rotation-alignment': 'map',
      'icon-rotate': ['get', 'heading']
    },
    paint: {
      'icon-opacity': 1.0,
      'icon-opacity-transition': {
        delay: 0,
        duration: 0
      }
    }
  },
  {
    id: 'gl-draw-point-scale-rotate-mode-scale-icon',
    type: 'symbol',
    filter: [
      'all',
      ['==', 'meta', 'vertex'],
      ['==', '$type', 'Point'],
      ['==', 'mode', 'scale'],
      ['==', 'icon', 'scale']
    ],
    layout: {
      'icon-image': 'scale',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-rotation-alignment': 'map',
      "icon-size": 0.5,
    },
    paint: {
      'icon-opacity': 1.0,
      'icon-opacity-transition': {
        delay: 0,
        duration: 0
      }
    }
  },
  {
    id: 'gl-draw-line-scale-rotate-mode-scale-line',
    type: 'line',
    filter: ['all',['==', 'meta', 'feature'], ['==', 'mode', 'scale'], ['==', '$type', 'LineString']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': themeColor,
      'line-dasharray': [0.2, 2],
      'line-width': 2
    }
  },
  {
    id: 'gl-draw-point-scale-rotate-mode-active',
    type: 'circle',
    filter: ['all', ['==', 'active', 'true'], ['==', 'mode', 'scaleRotateMode']],
    paint: {
      'circle-radius': 4,
      'circle-color': '#fff',
      'circle-stroke-color':themeColor,
      'circle-stroke-width':1,
    }
  },
  {
    id: 'gl-draw-line-scale-rotate-mode-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true'], ['==', 'mode', 'scaleRotateMode']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': themeColor,
      'line-width': 2
    }
  },
  {
    id: 'gl-draw-polygon-scale-rotate-mode-active',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true'], ['==', 'mode', 'scaleRotateMode']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round'
    },
    paint: {
      'line-color': themeColor,
      'line-width': 2
    }
  }
];

function parseSRCenter(value, defaultSRCenter = SRCenter.Center) {
  if (value == undefined || value == null) return defaultSRCenter;

  if (value === SRCenter.Center || value === SRCenter.Opposite) return value;

  if (value == 'center') return SRCenter.Center;

  if (value == 'opposite') return SRCenter.Opposite;
  
  return SRCenter.Center;
  // throw Error('Invalid SRCenter: ' + value);
}

/*
    opts = {
        featureId: ...,

        canScale: default true,
        canRotate: default true,

        rotatePivot: default 'center' or 'opposite',
        scaleCenter: default 'center' or 'opposite',

        canSelectFeatures: default true,    // can exit to simple_select mode
    }
 */
SRMode.onSetup = function (opts) {
  const featureId = this.getSelected()[0].id;

  const feature = this.getFeature(featureId);

  if (!feature) {
      this.changeMode(Constants.modes.SIMPLE_SELECT);
    // throw new Error('You must provide a valid featureId to enter SRMode');
    return;
  }

  if (
    feature.type === Constants.geojsonTypes.POINT ||
    feature.type === Constants.geojsonTypes.MULTI_POINT
  ) {
      this.changeMode(Constants.modes.SIMPLE_SELECT);
    // throw new TypeError('SRMode can not handle points');
    return;
  }
    if (
      feature.coordinates === undefined ||
      feature.coordinates.length != 1 ||
      feature.coordinates[0].length <= 2
    ) {
      this.changeMode(Constants.modes.SIMPLE_SELECT);
     // throw new TypeError('SRMode can only handle polygons');
       return;
    }

  const state = {
    featureId,
    feature,

    canTrash: opts.canTrash != undefined ? opts.canTrash : true,

    canScale: opts.canScale != undefined ? opts.canScale : true,
    canRotate: opts.canRotate != undefined ? opts.canRotate : true,

    singleRotationPoint:
      opts.singleRotationPoint != undefined ? opts.singleRotationPoint : false,
    rotationPointRadius:
      opts.rotationPointRadius != undefined ? opts.rotationPointRadius : 1.0,

    rotatePivot: parseSRCenter(opts.rotatePivot, SRCenter.Center),
    scaleCenter: parseSRCenter(opts.scaleCenter, SRCenter.Center),

    canSelectFeatures:
      opts.canSelectFeatures != undefined ? opts.canSelectFeatures : true,

    dragMoveLocation: opts.startPos || null,
    dragMoving: false,
    canDragMove: false,
    selectedCoordPaths: opts.coordPath ? [opts.coordPath] : [],
    rectangleWidgetsPreRoated: [], // 用于记录旋转之前要素坐标状态
    rectWidgets: []
  };

  if (!(state.canRotate || state.canScale)) {
    console.warn('Non of canScale or canRotate is true');
  }

  this.setSelectedCoordinates(
    this.pathsToCoordinates(featureId, state.selectedCoordPaths)
  );
  this.setSelected(featureId);
  doubleClickZoom.disable(this);

  this.setActionableState({
    combineFeatures: false,
    uncombineFeatures: false,
    trash: state.canTrash,
  });

  var _this = this;
  this.map.loadImage(rotate.default, function (error, image) {
    if (error) throw error;
    if (!_this.map.hasImage('rotate')) {
      _this.map.addImage('rotate', image);
    }
  });
  this.map.loadImage(scale.default, function (error, image) {
    if (error) throw error;
    if (!_this.map.hasImage('scale')) {
      _this.map.addImage('scale', image);
    }
  });

  return state;
};

SRMode._getRectWidgets = function (state, geojson) {
  if(state.rectWidgets.length){
    return state.rectWidgets;
  }
  return SRMode.createRectWidgets(state, geojson)
};
// render
SRMode.toDisplayFeatures = function (state, geojson, push) {
  if (state.featureId === geojson.properties.id) {
    geojson.properties.active = Constants.activeStates.ACTIVE;
    push(geojson);

    // 获取矩形工具
    const rectWidgets = SRMode._getRectWidgets(state, geojson)

    if (state.canScale) {
      if (!state.rectWidgets.length) {
        state.rectWidgets = rectWidgets
      }

      // 矩形框的线
      const rectLineGeojson = SRMode.rectWidgetsToLineGeojson(rectWidgets, state.featureId, "fv-scale-line");
      push(rectLineGeojson);
      // 矩形框的顶点
      rectWidgets.forEach(push);
    }

    if (state.canRotate) {
      const featureGeojson = SRMode.rectWidgetsToGeojson(rectWidgets);
      const featureId = geojson.properties && geojson.properties.id;
      var rotPoints = this.createRotationPoints(state, featureGeojson, rectWidgets, featureId);
      rotPoints.forEach(push);
    }
  } else {
    geojson.properties.active = Constants.activeStates.INACTIVE;
    push(geojson);
  }

  // this.fireActionable(state);
  this.setActionableState({
    combineFeatures: false,
    uncombineFeatures: false,
    trash: state.canTrash,
  });

  // this.fireUpdate();
};
SRMode.rectWidgetsToGeojson = function (rectWidgets) {
  const rectFeatures = JSON.parse(JSON.stringify(rectWidgets))
  const PointCoordinatesArr = rectFeatures.map(gs => gs.geometry.coordinates)
  const featureGeojson = {
    type: Constants.geojsonTypes.FEATURE,
    id: 'rectWL',
    properties: {},
    geometry: {
      type: Constants.geojsonTypes.LINE_STRING,
      coordinates: PointCoordinatesArr
    }
  }
  return featureGeojson
}
SRMode.rectWidgetsToLineGeojson = function (rectWidgets, parentId) {
  const rectFeatures = JSON.parse(JSON.stringify(rectWidgets))
  const PointCoordinatesArr = rectFeatures.map(gs => gs.geometry.coordinates)
  PointCoordinatesArr.push(PointCoordinatesArr[0])
  const featureGeojson = {
    type: Constants.geojsonTypes.FEATURE,
    id: 'fv-scale-line',
    properties: {
      meta: Constants.meta.FEATURE,
      parent: parentId,
      mode:'scale'
    },
    geometry: {
      type: Constants.geojsonTypes.LINE_STRING,
      coordinates: PointCoordinatesArr
    }
  }
  return featureGeojson
}

SRMode.onStop = function () {
  doubleClickZoom.enable(this);
  this.clearSelectedCoordinates();
};

// TODO why I need this?
SRMode.pathsToCoordinates = function (featureId, paths) {
  return paths.map((coord_path) => {
    return { feature_id: featureId, coord_path };
  });
};


SRMode.computeDistance = function (cR0, rotCenter, radiusScale) {
  var heading = bearing(rotCenter, cR0);
  var distance0 = distance(rotCenter, cR0);
  var distance1 = radiusScale * distance0; // TODO depends on map scale
  var cR1 = destination(rotCenter, distance1, heading, {}).geometry.coordinates;
  return cR1;
}
SRMode._createRotationPoint = function (
  rotationWidgets,
  featureId,
  v1,
  v2,
  rotCenter,
  radiusScale
) {
  var cR0 = midpoint(v1, v2).geometry.coordinates;// TODO修改中心点为矩形上边中心点
  var heading = bearing(rotCenter, cR0);
  var distance0 = distance(rotCenter, cR0);
  var distance1 = radiusScale * distance0; // TODO depends on map scale
  var cR1 = destination(rotCenter, distance1, heading, {}).geometry.coordinates;

  rotationWidgets.push({
    type: Constants.geojsonTypes.FEATURE,
    properties: {
      meta: Constants.meta.MIDPOINT,
      icon: 'rotate',
      parent: featureId,
      lng: cR1[0],
      lat: cR1[1],
      coord_path: v1.properties ? v1.properties.coord_path : '0.0',
      heading: heading,
      mode:'rotate'
    },
    geometry: {
      type: Constants.geojsonTypes.POINT,
      coordinates: cR1,
    },
  });
};

// 创建旋转工具按钮
SRMode.createRotationPoints = function (state, geojson, suppPoints,featureId) {
  const { type } = geojson.geometry;

  let rotationWidgets = [];
  if (
    type === Constants.geojsonTypes.POINT ||
    type === Constants.geojsonTypes.MULTI_POINT
  ) {
    return;
  }

  var corners = suppPoints.slice(0);
  corners[corners.length] = corners[0];

  var v1 = null;

  var rotCenter = this.computeRotationCenter(geojson);
  if (state.singleRotationPoint) {
    this._createRotationPoint(
      rotationWidgets,
      featureId,
      corners[1],
      corners[2],
      rotCenter,
      state.rotationPointRadius
    );
  } else {
    corners.forEach((v2) => {
      if (v1 != null) {
        this._createRotationPoint(
          rotationWidgets,
          featureId,
          v1,
          v2,
          rotCenter,
          state.rotationPointRadius
        );
      }

      v1 = v2;
    });
  }
  return rotationWidgets;
};

// 旋转矩形框
SRMode.getRoatedRect = function (state, center, rotateAngle) {
    const rectFeatures = JSON.parse(JSON.stringify(state.rectangleWidgetsPreRoated))
  const rotatedFeatures = rectFeatures.map(f => {
    var rotatedFeature = transformRotate(f, rotateAngle, {
      pivot: center,
      mutate: false,
    });
    f.geometry.coordinates = rotatedFeature.geometry.coordinates
    return f
  });
  return rotatedFeatures;
};

// 缩放矩形框
SRMode.getScaledRect = function (state, scale, cCenter) {
  const featureGeojson = SRMode.rectWidgetsToGeojson(state.rectangleWidgetsPreRoated);
  var scaledFeature = transformScale(featureGeojson, scale, {
    origin: cCenter,
    mutate: false,
  });
  const scaledFeatureCoor = scaledFeature.geometry.coordinates;
  const scaledFeatures = JSON.parse(JSON.stringify(state.rectWidgets)).map((f, i) => {
    f.geometry.coordinates = scaledFeatureCoor[i];
    return f;
  });
  return scaledFeatures;
};

// 移动矩形框
SRMode.getMovedRect = function (state, e) {
  if (!state.dragMoveLocation) return;
  const dragMoveLocation = { type: 'Point', coordinates: [state.dragMoveLocation.lng, state.dragMoveLocation.lat] }
  const ePoint = { type: 'Point', coordinates: [e.lngLat.lng, e.lngLat.lat] };
  const d = distance(dragMoveLocation, ePoint);
  const rotateAngle = (rhumbBearing(point(dragMoveLocation.coordinates), point(ePoint.coordinates)));

  const geometrys = state.rectWidgets.map(f => f.geometry);
  const newGeom = geometrys.map(g => {
    return transformTranslate(g, d, rotateAngle);
  })
  return state.rectWidgets.map((f, i) => {
    f.geometry = newGeom[i];
    return f;
  });
};

// 创建矩形框
SRMode.createRectWidgets = function (state, geojson) {
  var suppPoints = createSupplementaryPoints(geojson, {
    map: this.map,
    midpoints: false,
    selectedPaths: state.selectedCoordPaths,
  });

  const { type } = geojson.geometry;
  const featureId = geojson.properties && geojson.properties.id;

  if (type === Constants.geojsonTypes.POINT || type === Constants.geojsonTypes.MULTI_POINT) {
    return;
  }
  return this._createRectWidgets(featureId, suppPoints);
};

// 检查feature的类型是否为点要素
// SRMode.isPoint = function (type) {
//   if (type === Constants.geojsonTypes.POINT || type === Constants.geojsonTypes.MULTI_POINT) {
//     return true;
//   }
//   return false;
// }

SRMode._createRectWidgets = function ( featureId, suppPoints) {
  const featuresCollection = {
    type: 'FeatureCollection',
    features: suppPoints
  };
  const rectFeatures = bbox(featuresCollection);
  const coor = [
    [rectFeatures[0], rectFeatures[1]],
    [rectFeatures[0], rectFeatures[3]],
    [rectFeatures[2], rectFeatures[3]],
    [rectFeatures[2], rectFeatures[1]]
  ];
  return coor.map((f, i) => {
    return {
      type: Constants.geojsonTypes.FEATURE,
      properties: {
        meta: Constants.meta.VERTEX,
        parent: featureId,
        coord_path: `0.${i}`,
        icon: 'scale',
        mode: 'scale',
        heading: ''
      },
      geometry: {
        type: Constants.geojsonTypes.POINT,
        coordinates: f
      }
    }
  })
  
};

SRMode.startDragging = function (state, e) {
    this.map.dragPan.disable();
    state.canDragMove = true;
    state.dragMoveLocation = e.lngLat;
};

SRMode.stopDragging = function (state) {
    this.map.dragPan.enable();
    state.dragMoving = false;
    state.canDragMove = false;
    state.dragMoveLocation = null;
    state.rectangleWidgetsPreRoated = []; // 每次旋转结束后，将其设置为空
};

const isRotatePoint = CommonSelectors.isOfMetaType(Constants.meta.MIDPOINT);
const isVertex = CommonSelectors.isOfMetaType(Constants.meta.VERTEX);

SRMode.onTouchStart = SRMode.onMouseDown = function (state, e) {
  if (isVertex(e)) return this.onVertex(state, e);
  if (isRotatePoint(e)) return this.onRotatePoint(state, e);
  if (CommonSelectors.isActiveFeature(e)) return this.onFeature(state, e);
  // if (isMidpoint(e)) return this.onMidpoint(state, e);
};

const TxMode = {
  Scale: 1,
  Rotate: 2,
  Move:3
};

// 缩放矩形时触发
SRMode.onVertex = function (state, e) {
	// 开始拖动缩放点时，保存值
    if (!state.rectangleWidgetsPreRoated.length) {
        state.rectangleWidgetsPreRoated = JSON.parse(JSON.stringify(state.rectWidgets));
    }
  // convert internal MapboxDraw feature to valid GeoJSON:
  this.computeAxes(state, state.feature.toGeoJSON());
  this.startDragging(state, e);
  const about = e.featureTarget.properties;
  state.selectedCoordPaths = [about.coord_path];
  state.txMode = TxMode.Scale;
};

// 旋转矩形时触发
SRMode.onRotatePoint = function (state, e) {
	// 开始拖动旋转点时，保存值
    if (!state.rectangleWidgetsPreRoated.length) {
        state.rectangleWidgetsPreRoated = JSON.parse(JSON.stringify(state.rectWidgets));
    }
    // convert internal MapboxDraw feature to valid GeoJSON:
    this.computeAxes(state, state.feature.toGeoJSON());

    this.startDragging(state, e);
    const about = e.featureTarget.properties;
    state.selectedCoordPaths = [about.coord_path];
    state.txMode = TxMode.Rotate;
};

// 平移矩形时触发
SRMode.onFeature = function (state, e) {
  state.selectedCoordPaths = [];
  this.startDragging(state, e);  
  state.txMode = TxMode.Move;
};

SRMode.coordinateIndex = function (coordPaths) {
  if (coordPaths.length >= 1) {
    var parts = coordPaths[0].split('.');
    return parseInt(parts[parts.length - 1]);
  } else {
    return 0;
  }
};

SRMode.computeRotationCenter = function (polygon) {
  var center0 = center(polygon);
  return center0;
};
SRMode.computeCorners = function(polygon){
  let corners;
  if (polygon.geometry.type === Constants.geojsonTypes.POLYGON)
    corners = polygon.geometry.coordinates[0].slice(0);
  else if (polygon.geometry.type === Constants.geojsonTypes.MULTI_POLYGON) {
    let temp = [];
    polygon.geometry.coordinates.forEach((c) => {
      c.forEach((c2) => {
        c2.forEach((c3) => {
          temp.push(c3);
        });
      });
    });
    corners = temp;
  } else if (polygon.geometry.type === Constants.geojsonTypes.LINE_STRING)
    corners = polygon.geometry.coordinates;
  else if (polygon.geometry.type === Constants.geojsonTypes.MULTI_LINE_STRING) {
    let temp = [];
    polygon.geometry.coordinates.forEach((c) => {
      c.forEach((c2) => {
        temp.push(c2);
      });
    });
    corners = temp;
  }
  return corners
}
SRMode.computeHeadings = function (corners, center0, rotatePivot) {
  var headings = [];

  const n = corners.length - 1;
  const iHalf = Math.floor(n / 2);
  for (var i1 = 0; i1 < n; i1++) {
    var i0 = i1 - 1;
    if (i0 < 0) i0 += n;

    const c0 = corners[i0];
    const c1 = corners[i1];
    const rotPoint = midpoint(point(c0), point(c1));

    var rotCenter = center0;
    if (SRCenter.Opposite === rotatePivot) {
      var i3 = (i1 + iHalf) % n; // opposite corner
      var i2 = i3 - 1;
      if (i2 < 0) i2 += n;

      const c2 = corners[i2];
      const c3 = corners[i3];
      rotCenter = midpoint(point(c2), point(c3));
    }
    headings[i1] = bearing(rotCenter, rotPoint);
  }
  return headings
}

SRMode.computeScaleParam = function (corners, scaleCenter, center0) {
  var scaleCenters = [];
  var distances = [];
  const n = corners.length;
  const iHalf = Math.floor(n / 2);
  for (var i = 0; i < n; i++) {
    var c1 = corners[i];
    var c0 = center0.geometry.coordinates;
    if (SRCenter.Opposite === scaleCenter) {
      var i2 = (i + iHalf) % n; // opposite corner
      c0 = corners[i2];
    }
    scaleCenters[i] = c0;
    distances[i] = distance(point(c0), point(c1), { units: 'meters' });
  }
  return { scaleCenters, distances }
}

// compute current distances from centers for scaling
SRMode.computeScalingAxes = function (geojson, center0, scaleCenter, coords) {
  const param = this.computeScaleParam(coords, scaleCenter, center0)
  return {
    feature0: geojson, // initial feature state
    centers: param.scaleCenters,
    distances: param.distances,
  };
}
SRMode.computeRotationAxes = function (geojson, corners, center0, rotatePivot) {
  var rotateCenters = this.computeRotateCenters(corners, center0);
  var headings = this.computeHeadings(corners, center0, rotatePivot);

  return {
    feature0: geojson, // initial feature state
    centers: rotateCenters,
    headings: headings, // rotation start heading for each point
  };
}
SRMode.computeRotateCenters = function (corners, center0) {
  var rotateCenters = [];
  const n = corners.length - 1;
  for (var i1 = 0; i1 < n; i1++) {
    var rotCenter = center0;
    rotateCenters[i1] = rotCenter.geometry.coordinates;
  }
  return rotateCenters
}
// 计算目标要素
SRMode.computeAxes = function (state, geojson) {
  // TODO check min 3 points
  const center0 = this.computeRotationCenter(geojson);

  const coords = JSON.parse(JSON.stringify(state.rectWidgets)).map(f=>f.geometry.coordinates)
  state.rotation = this.computeRotationAxes(geojson, coords, center0, state.rotatePivot);
  // compute current distances from centers for scaling
  state.scaling = this.computeScalingAxes(geojson, center0, state.scaleCenter, coords);
};



SRMode.onDrag = function (state, e) {
  if (state.canDragMove !== true) return;
  state.dragMoving = true;
  e.originalEvent.stopPropagation();

  const delta = {
    lng: e.lngLat.lng - state.dragMoveLocation.lng,
    lat: e.lngLat.lat - state.dragMoveLocation.lat,
  };
  if (state.txMode) {
    switch (state.txMode) {
      case TxMode.Rotate:
        this.dragRotatePoint(state, e, delta);
        break;
      case TxMode.Scale:
        this.dragScalePoint(state, e, delta);
        break;
        case TxMode.Move:
          this.dragFeature(state, e, delta);
          break;
    }
  }

  state.dragMoveLocation = e.lngLat;
};

SRMode.dragRotatePoint = function (state, e) {
  if (state.rotation === undefined || state.rotation == null) {
    // throw new Error('state.rotation required');
    return;
  }

  var m1 = point([e.lngLat.lng, e.lngLat.lat]);

  const n = state.rotation.centers.length;
  var cIdx = (this.coordinateIndex(state.selectedCoordPaths) + 1) % n;
  // TODO validate cIdx
  var cCenter = state.rotation.centers[cIdx];
  var center = point(cCenter);

  var heading1 = bearing(center, m1);

  var heading0 = state.rotation.headings[cIdx];
  var rotateAngle = heading1 - heading0; // in degrees
  if (CommonSelectors.isShiftDown(e)) {
    rotateAngle = 5.0 * Math.round(rotateAngle / 5.0);
  }
  var rotatedFeature = transformRotate(state.rotation.feature0, rotateAngle, {
    pivot: center,
    mutate: false,
  });

  state.rectWidgets = this.getRoatedRect(state, center, rotateAngle)
  state.feature.incomingCoords(rotatedFeature.geometry.coordinates);
  // TODO add option for this:
  this.fireUpdate();
};

SRMode.computeScale=function(state, e){

  var cIdx = this.coordinateIndex(state.selectedCoordPaths);
  // TODO validate cIdx

  var cCenter = state.scaling.centers[cIdx];
  var center = point(cCenter);
  var m1 = point([e.lngLat.lng, e.lngLat.lat]);

  var dist = distance(center, m1, { units: 'meters' });
  var scale = dist / state.scaling.distances[cIdx];

  if (CommonSelectors.isShiftDown(e)) {
    // TODO discrete scaling
    scale = 0.05 * Math.round(scale / 0.05);
  }
  return scale
}

SRMode.dragScalePoint = function (state, e, delta) {
  if (state.scaling === undefined || state.scaling == null) {
    // throw new Error('state.scaling required');
    return;
  }

  var cIdx = this.coordinateIndex(state.selectedCoordPaths);
  // TODO validate cIdx

  var cCenter = state.scaling.centers[cIdx];

  var scale = SRMode.computeScale(state, e)

  var scaledFeature = transformScale(state.scaling.feature0, scale, {
    origin: cCenter,
    mutate: false,
  });

  state.rectWidgets = this.getScaledRect(state, scale, cCenter)
  state.feature.incomingCoords(scaledFeature.geometry.coordinates);
  // TODO add option for this:
  this.fireUpdate();
};

SRMode.dragFeature = function (state, e, delta) {
  moveFeatures(this.getSelected(), delta);  
  state.rectWidgets = this.getMovedRect(state, e);
  state.dragMoveLocation = e.lngLat;
  // TODO add option for this:
  this.fireUpdate();
};

SRMode.fireUpdate = function () {
  this.map.fire(Constants.events.UPDATE, {
    action: Constants.updateActions.CHANGE_COORDINATES,
    features: this.getSelected().map((f) => f.toGeoJSON()),
  });
};

SRMode.onMouseOut = function (state) {
  // As soon as you mouse leaves the canvas, update the feature
  if (state.dragMoving) {
    this.fireUpdate();
  }
};

SRMode.onTouchEnd = SRMode.onMouseUp = function (state) {
  if (state.dragMoving) {
    this.fireUpdate();
  }
  this.stopDragging(state);
};

SRMode.clickActiveFeature = function (state) {
  state.selectedCoordPaths = [];
  this.clearSelectedCoordinates();
  state.feature.changed();
};

SRMode.onClick = function (state, e) {
  if (CommonSelectors.noTarget(e)) return this.clickNoTarget(state, e);
  if (CommonSelectors.isActiveFeature(e))
    return this.clickActiveFeature(state, e);
  if (CommonSelectors.isInactiveFeature(e)) return this.clickInactive(state, e);
  this.stopDragging(state);
};

SRMode.clickNoTarget = function (state, e) {
  if (state.canSelectFeatures) this.changeMode(Constants.modes.SIMPLE_SELECT);
};

SRMode.clickInactive = function (state, e) {
  if (state.canSelectFeatures)
    this.changeMode(Constants.modes.SIMPLE_SELECT, {
      featureIds: [e.featureTarget.properties.id],
    });
};

SRMode.onTrash = function () {
  this.deleteFeature(this.getSelectedIds());
};

# mapbox-gl-draw-scale-rotate-mode

A custom mode for [MapboxGL-Draw](https://github.com/mapbox/mapbox-gl-draw) to cut polygons

## [DEMO](https://github.com/SuperMap/mapbox-gl-draw-scale-rotate-mode/)

![A Gif showing demo usage](demo/public/demo.gif)

## Install

```bash
npm install @ispeco/mapbox-gl-draw-scale-rotate-mode
```


## Usage

```js
import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { SRMode, SRCenter, SRStyle } from '@ispeco/mapbox-gl-draw-scale-rotate-mode';

const map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-91.874, 42.76], // starting position
  zoom: 12, // starting zoom
});

const draw = new MapboxDraw({
  userProperties: true,
  displayControlsDefault: false,
  styles: SRStyle,
  modes: Object.assign(MapboxDraw.modes, {
    scaleRotateMode: SRMode,
  }),
});
map.addControl(draw);

// when mode drawing should be activated
draw.changeMode('scaleRotateMode', {
  canScale: true,
  canRotate: true, // only rotation enabled
  canTrash: false, // disable feature delete

  rotatePivot: SRCenter.Center, // rotate around center
  scaleCenter: SRCenter.Opposite, // scale around opposite vertex

  singleRotationPoint: true, // only one rotation point
  rotationPointRadius: 1.2, // offset rotation point

  canSelectFeatures: true,
});
```

## [Example](https://github.com/SuperMap/mapbox-gl-draw-scale-rotate-mode/blob/main/demo/src/App.js)

## Acknowledgement

This project is heavily inspired from [mapbox-gl-draw custom mode](https://github.com/SuperMap/mapbox-gl-draw-rotate-scale-rect-mode).

## License

MIT © [ReyhaneMasumi](LICENSE)

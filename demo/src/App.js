import React, { useRef, useEffect } from 'react';
import mapboxGl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { SRMode, SRCenter,SRStyle} from '@ispeco/mapbox-gl-draw-scale-rotate-mode';
import './App.css';

let map;
let draw;
let drawBar;

class extendDrawBar {
  constructor(opt) {
    let ctrl = this;
    ctrl.draw = opt.draw;
    ctrl.buttons = opt.buttons || [];
    ctrl.onAddOrig = opt.draw.onAdd;
    ctrl.onRemoveOrig = opt.draw.onRemove;
  }
  onAdd(map) {
    let ctrl = this;
    ctrl.map = map;
    ctrl.elContainer = ctrl.onAddOrig(map);
    ctrl.buttons.forEach((b) => {
      ctrl.addButton(b);
    });
    return ctrl.elContainer;
  }
  onRemove(map) {
    let ctrl = this;
    ctrl.buttons.forEach((b) => {
      ctrl.removeButton(b);
    });
    ctrl.onRemoveOrig(map);
  }
  addButton(opt) {
    let ctrl = this;
    var elButton = document.createElement('button');
    elButton.className = 'mapbox-gl-draw_ctrl-draw-btn';
    if (opt.classes instanceof Array) {
      opt.classes.forEach((c) => {
        elButton.classList.add(c);
      });
    }
    elButton.addEventListener(opt.on, opt.action);
    ctrl.elContainer.appendChild(elButton);
    opt.elButton = elButton;
  }
  removeButton(opt) {
    opt.elButton.removeEventListener(opt.on, opt.action);
    opt.elButton.remove();
  }
}

function App() {
  if (mapboxGl.getRTLTextPluginStatus() === 'unavailable')
    mapboxGl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
      (err) => {
        err && console.error(err);
      },
      true
    );
  let mapRef = useRef(null);

  useEffect(() => {
    map = new mapboxGl.Map({
      container: mapRef.current || '',
      style: {
        "version": 8,
        "name": "Map.ir Vector XYZ Light",
        "metadata": {},
        "center": [
          51.393,
          35.6879
        ],
        "zoom": 10,
        "bearing": 0,
        "pitch": 0,
        "sources": {},
        "layers": [
          {
            "id": "background",
            "type": "background",
            "paint": {
              "background-color":"#000000"
            }
          }],
        "created": "2018-11-24T10:00:57.017Z",
        "id": "cjovab1r7apq22sl8xzlw5du3",
        "modified": "2020-07-06",
        "owner": "Map.ir",
        "visibility": "private",
        "draft": false
      },
      center: [51.3857, 35.6102],
      zoom: 10,
      pitch: 0,
      interactive: true,
      hash: true,
      attributionControl: true,
      customAttribution: '© Map © Openstreetmap',
      transformRequest: (url) => {
        return {
          url: url,
          headers: {
            'x-api-key':
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImRiZWU0YWU4OTk4OTA3MmQ3OTFmMjQ4ZDE5N2VhZTgwZWU2NTUyYjhlYjczOWI2NDdlY2YyYzIzNWRiYThiMzIzOTM5MDkzZDM0NTY2MmU3In0.eyJhdWQiOiI5NDMyIiwianRpIjoiZGJlZTRhZTg5OTg5MDcyZDc5MWYyNDhkMTk3ZWFlODBlZTY1NTJiOGViNzM5YjY0N2VjZjJjMjM1ZGJhOGIzMjM5MzkwOTNkMzQ1NjYyZTciLCJpYXQiOjE1OTA4MjU0NzIsIm5iZiI6MTU5MDgyNTQ3MiwiZXhwIjoxNTkzNDE3NDcyLCJzdWIiOiIiLCJzY29wZXMiOlsiYmFzaWMiXX0.M_z4xJlJRuYrh8RFe9UrW89Y_XBzpPth4yk3hlT-goBm8o3x8DGCrSqgskFfmJTUD2wC2qSoVZzQKB67sm-swtD5fkxZO7C0lBCMAU92IYZwCdYehIOtZbP5L1Lfg3C6pxd0r7gQOdzcAZj9TStnKBQPK3jSvzkiHIQhb6I0sViOS_8JceSNs9ZlVelQ3gs77xM2ksWDM6vmqIndzsS-5hUd-9qdRDTLHnhdbS4_UBwNDza47Iqd5vZkBgmQ_oDZ7dVyBuMHiQFg28V6zhtsf3fijP0UhePCj4GM89g3tzYBOmuapVBobbX395FWpnNC3bYg7zDaVHcllSUYDjGc1A', //dev api key
            'Mapir-SDK': 'reactjs',
          },
        };
      },
    });
    draw = new MapboxDraw({
      modes: {
        ...MapboxDraw.modes,
        scaleRotateMode: SRMode,
      },
      styles: SRStyle,
      userProperties: true,
    });
    drawBar = new extendDrawBar({
      draw: draw,
      buttons: [
        {
          on: 'click',
          action: scaleRotate,
          classes: ['rotate-icon'],
        },
      ],
    });
    window.map = map;
    window.mapdraw = draw;
    map.once('load', () => {
      map.resize();
      map.addControl(drawBar, 'top-right');
      draw.set({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            id: 'example-id',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                    [51.47578902735333, 35.67273449809075],
                    [51.37155900202171, 35.64531282239446],
                    [51.437362361636815, 35.60810175681972],
                    [51.50845024357227, 35.62030436349916],
                    [51.52456053558251, 35.650759195263504],
                    [51.47578902735333, 35.67273449809075]
                ],
              ],
            },
          },
          {
            id: 'example2_id',
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                  [51.369667053222855, 35.7342289330811],
                  [51.31954193115254, 35.75317301194684],
                  [51.27456665039082, 35.72113259519222],
                  [51.222381591797074, 35.73534341553382],
                  [51.19594573974629, 35.69549097436918],
                  [51.27285003662129, 35.651713933600526],
                  [51.226844787597855, 35.61516820950474],
              ],
            },
          },
          {
            id: 'example3_id',
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [51.5, 35.752642192392955],
            },
          },
        ],
      });
    });


    map.on('draw.update', (e) => {
      console.log("draw.update：", e)
    });
    map.on('draw.modechange', (e) => {
      console.log("draw.modechange", e)
    });
    map.on('draw.create', (e) => {
      console.log("draw.create：", e)
    });
    map.on('click', (e) => {
      console.log("click map：", e)
    });

  }, []);

  const scaleRotate = () => {
    try {
      draw.changeMode('scaleRotateMode', {
        // required
        canScale: true,
        canRotate: true, // only rotation enabled
        canTrash: false, // disable feature delete

        rotatePivot: SRCenter.Center, // rotate around center
        scaleCenter: SRCenter.Opposite, // scale around opposite vertex

        singleRotationPoint: true, // only one rotation point
        rotationPointRadius: 1.2, // offset rotation point

        canSelectFeatures: true,
      });
    } catch (err) {
      alert(err.message);
      console.error(err);
    }
  };

  return (
    <div className="map-wrapper">
      <div id="map" ref={mapRef} />
    </div>
  );
}

export default App;

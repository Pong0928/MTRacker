import { useEffect, useState } from 'react';
import Select from 'react-select';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { LatLngExpression, LatLngTuple } from 'leaflet';
import mtrLoction from '../src/json/mtr_location.json'; 
import NextStation from './component/NearestStation';
import StatinoInformation from './component/StationInformation';

export interface StationData {
  line: string
  line_name: string
  sta: string
  sta_name: string
  latitude: number
  longitude: number
}

export interface ArrivalData {
  sta: string
  up_dest: string | null
  up_estimate_time: number
  down_dest: string | null
  down_estimate_time: number
}

export interface MTRApiUpNDownData {
  dest: string
  plat: string
  seq: string
  source: string
  time: string
  ttnt: string
  valid: string
}

export interface MTRApiData {
  DOWN: MTRApiUpNDownData[]
  UP: MTRApiUpNDownData[]
  curr_time: string
  sys_time: string
}

function App() {
  const [coords, setCoords] = useState<LatLngTuple | null>(null)


  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function(position) {
      const { latitude, longitude } = position.coords 
      setCoords([latitude, longitude])
    });
  }, [])



  function getDistance(la1:number, lo1:number, la2:number, lo2:number) {
    let La1 = la1 * Math.PI / 180.0;
    let La2 = la2 * Math.PI / 180.0;
    let La3 = La1 - La2;
    let Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math
      .sin(Lb3 / 2), 2)));
      s = s * 6378.137;
      s = Math.round(s * 10000) / 10000;
    return s;
  }

  function getNearestStation() {
    if(coords === null)
      return ""
    
    let min:number = Number.POSITIVE_INFINITY;
    let nearestStation:string = "";
    mtrLoction.forEach(({sta, latitude, longitude}) => {
      const current = getDistance(coords[0], coords[1], latitude, longitude)
      if(current < min) {
        min = current;
        nearestStation = sta;
      }
    })

    return nearestStation
  }

  return (
    <div className='h-screen relative overflow-hidden'>
      {coords && (
        <>
        <MapContainer center={coords} zoom={13} scrollWheelZoom={true} className='w-screen h-screen z-0'>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={coords}/>
          {
            mtrLoction.map(({ latitude, longitude, line, sta, sta_name}) => (
              <Marker position={[latitude, longitude]}>
                <Popup className='w-96'>
                  <StatinoInformation sta={sta}/>
                </Popup>
              </Marker>
            ))
          }
        </MapContainer>
        <NextStation sta={getNearestStation()} />
        </>
      )}
    </div>
  );
}

export default App;

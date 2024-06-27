import { useEffect, useState } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { LatLngTuple } from 'leaflet';
import mtrLoction from '../src/json/mtr_location.json'; 
import NearestStation from './component/NearestStation';
import StationInformation from './component/StationInformation';
import SetViewOnClick from './component/SetViewOnClick';

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
  const [userCoords, setuserCoords] = useState<LatLngTuple | null>(null)
  const stationsByLine: { [key: string]: StationData[] } = {}

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function(position) {
      const { latitude, longitude } = position.coords 
      setCoords([latitude, longitude])
      setuserCoords([latitude, longitude])
    });
  }, [])

  mtrLoction.forEach((station) => {
    const { line_name } = station;
    if (!stationsByLine[line_name]) {
        stationsByLine[line_name] = [];
    }
    stationsByLine[line_name].push(station);
  });

  function changeCenter(laNlo: string) {
    const newCoords = laNlo.split(",");
    const lat = parseFloat(newCoords[0]);
    const lon = parseFloat(newCoords[1]);
    setCoords([lat, lon]);

    console.log(coords);
  }

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
    if(userCoords === null)
      return ""
    
    let min:number = Number.POSITIVE_INFINITY;
    let nearestStation:string = "";
    mtrLoction.forEach(({sta, latitude, longitude}) => {
      const current = getDistance(userCoords[0], userCoords[1], latitude, longitude)
      if(current < min) {
        min = current;
        nearestStation = sta;
      }
    })

    return nearestStation
  }

  function getNearestStationCoord() {
    if(userCoords === null)
      return ""

    return userCoords[0] + "," + userCoords[1];
  }

  return (
    <div className='h-screen relative overflow-hidden'>
      {coords && userCoords && (
        <>
        <MapContainer center={coords} zoom={13} scrollWheelZoom={true} className='w-screen h-screen z-0'>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Marker for User */}
          <Marker position={userCoords}/>
          {
            mtrLoction.map(({ latitude, longitude, line, sta, sta_name}) => (
              <Marker position={[latitude, longitude]}>
                <Popup className='w-96'>
                  <StationInformation sta={sta}/>
                </Popup>
              </Marker>
            ))
          }
          {/* redirect function */}
          <SetViewOnClick coords={coords} />
        </MapContainer>
        <div className="absolute top-28 left-2 ml-5">
            <div className='rounded-lg w-96 text-center'>
                <p className='text-2xl'>Find Station</p> 
                <select className='border border-gray-300 text-sm rounded-lg w-full p-2.5 focus:ring-blue-500 focus:border-blue-500' onChange={(e) => changeCenter(e.target.value)}>
                {
                    Object.entries(stationsByLine).map(([lineName, stations]) => (
                        <optgroup key={lineName} label={lineName}>
                            {stations.map((station) => (
                            <option key={station.sta} value={station.latitude+","+station.longitude}>
                                {station.sta_name}
                            </option>
                            ))}
                        </optgroup>
                    ))
                }
                </select>
            </div>
        </div>
        <NearestStation sta={getNearestStation()} onShow={() => changeCenter(getNearestStationCoord())}/>
        </>
      )}
    </div>
  );
}

export default App;

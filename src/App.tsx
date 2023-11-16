import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { LatLngExpression } from 'leaflet';
import mtrLoction from '../src/json/mtr_location.json'; 
import NextStation from './component/NextStation';

export interface StationData {
  line: string
  sta: string
  latitude: number
  longitude: number
}

function App() {
  const [coords, setCoords] = useState<LatLngExpression | null>(null)
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    
    navigator.geolocation.getCurrentPosition(function(position) {
      const { latitude, longitude } = position.coords 
      setCoords([latitude, longitude])
    });
  }, [])

  return (
    <>
      {coords && (
        <MapContainer center={coords} zoom={13} scrollWheelZoom={true} className='w-screen h-screen z-0'>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={coords}/>
          {
            mtrLoction.map(({ latitude, longitude, line, sta}) => (
              <Marker position={[latitude, longitude]} eventHandlers={{
                click: () => {
                  setCounter(counter + 1)
                }
              }}>
                <Popup>
                  { `${line} ${sta}` }
                </Popup>
              </Marker>
            ))
          }
        </MapContainer>
      )}
      <NextStation upArrivalTime={'1'} downArrivalTime={'2'} />
    </>
  );
}

export default App;

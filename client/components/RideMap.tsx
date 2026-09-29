"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import { useEffect } from "react";


type Coordinate = [
  number,
  number
];


type Props = {
  pickup: Coordinate | null;
  destination: Coordinate | null;
};



const markerIcon = L.divIcon({
  className: "",

  html: `
    <div
      style="
        width:20px;
        height:20px;
        background:#C6FF2E;
        border:4px solid #000;
        border-radius:50%;
        box-shadow:0 0 20px rgba(198,255,46,.7);
      "
    ></div>
  `,
});



function MapUpdater({
  pickup,
  destination,
}: Props) {

  const map = useMap();


  useEffect(() => {

    const points =
      [
        pickup,
        destination,
      ].filter(Boolean) as Coordinate[];


    if(points.length === 2){

      map.fitBounds(
        points,
        {
          padding:[
            70,
            70,
          ],
        },
      );

    }


  },[
    pickup,
    destination,
    map,
  ]);


  return null;
}





export default function RideMap({
  pickup,
  destination,
}: Props){


  return (

    <div
      className="
        h-full
        w-full
      "
    >

      <MapContainer

        center={[
          23.8103,
          90.4125,
        ]}

        zoom={13}

        className="
          h-full
          w-full
        "

      >

        <TileLayer
          url="
          https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
          "
        />


        <MapUpdater
          pickup={pickup}
          destination={destination}
        />



        {pickup && (

          <Marker
            position={pickup}
            icon={markerIcon}
          />

        )}



        {destination && (

          <Marker
            position={destination}
            icon={markerIcon}
          />

        )}



        {pickup && destination && (

          <Polyline

            positions={[
              pickup,
              destination,
            ]}

            color="#C6FF2E"

            weight={6}

          />

        )}


      </MapContainer>


    </div>

  );

}
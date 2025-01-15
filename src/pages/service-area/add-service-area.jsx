import React, {useState, useEffect} from "react";
import Card from "@/components/ui/Card";
import Textinput from "@/components/ui/Textinput";
import Button from "@/components/ui/Button";
import {
    MapContainer,
    TileLayer,
    Marker,
    Circle,
    Polygon,
  } from "react-leaflet";
import axios from "axios";  

const AddServiceArea = () => {
    const [position, setPosition] = useState([47.31322, -1.319482]);
    const [circleRadius] = useState(4500);
  
  const [polygonCoords, setPolygonCoords] = useState([])
   
  useEffect(() => {
    axios
      .get("https://maps.googleapis.com/$rpc/google.internal.maps.mapsjs.v1.MapsJsInternalService/GetViewportInfo")
      .then((response) => {
        const mapData = response.data;
        const trafficData = mapData.filter(item => item[0] === "traffic");
        const polygonCoords = trafficData.map(item => item[1]);
        setPolygonCoords(polygonCoords);
      })
      .catch((error) => {
        console.error("Error fetching data from API", error);
      });
  }, []);

    return (
        <Card title="Add Service Area">
            <h6>Service Area info</h6>
            <div className="space-y-4 mt-4">
                <Textinput
                    label="Service Area"
                    id="service_area"
                    type="text"
                />
                <Textinput
                    label="Radius"
                    id="radius"
                    type="number"
                />
                <div className="w-full h-[300px]">
                    <MapContainer
                        center={position}
                        zoom={10}
                        maxZoom={18}
                        minZoom={3}
                        scrollWheelZoom={false}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={position} />
                        <Circle center={position} radius={circleRadius} />
                        <Polygon positions={polygonCoords} />
                    </MapContainer>
                </div>
                <div className="space-y-4 text-end">            
                    <Button text="Submit" className="btn-dark" />
                </div>
            </div>
      </Card>
    )
}

export default AddServiceArea;
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";


interface SensorData {
  id: number;
  lat: number;
  lon: number;
  timestamp: string;
  NO2: number;
  Ozone: number;
  PM25: number;
  uniqueId: string;
}

type GasType = 'NO2' | 'Ozone' | 'PM25';

// Mock data generator
const generateMockData = (): SensorData[] => {
  const sensors = [
    { id: 1, lat: 40.7128, lon: -74.0060 },
    { id: 2, lat: 34.0522, lon: -118.2437 },
    { id: 3, lat: 41.8781, lon: -87.6298 },
    { id: 4, lat: 29.7604, lon: -95.3698 },
    { id: 5, lat: 33.7490, lon: -84.3880 }
  ];

  return sensors.map(sensor => ({
    ...sensor,
    timestamp: new Date().toISOString(),
    NO2: Math.random() * 100,
    Ozone: Math.random() * 50,
    PM25: Math.random() * 150,
    uniqueId: Math.random().toString(36).substring(7)
  }));
};

const IoTSensorVisualization: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [selectedGas, setSelectedGas] = useState<GasType>('NO2');
  const [customExpression, setCustomExpression] = useState<string>('');
  const [xAxis, setXAxis] = useState<keyof SensorData>('timestamp');
  const [yAxis, setYAxis] = useState<keyof SensorData>('NO2');

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      setSensorData(generateMockData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const evaluateExpression = (data: SensorData, expression: string): number => {
    try {
      const variables = { NO2: data.NO2, Ozone: data.Ozone, PM25: data.PM25 };
      // eslint-disable-next-line no-new-func
      const result = new Function(...Object.keys(variables), `return ${expression}`)(...Object.values(variables));
      return isNaN(result) ? 0 : result;
    } catch (error) {
      console.error('Invalid expression:', error);
      return 0;
    }
  };

  const getCircleColor = (value: number): [string, string] => {
    const normalizedValue = value / 100; // Adjust based on your data range
    const hue = ((1 - normalizedValue) * 120).toString(10);
    return [`hsl(${hue},100%,50%)`, `hsl(${hue},100%,30%)`];
  };

  const renderMap = () => (
    <MapContainer center={[39.8283, -98.5795]} zoom={4} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {sensorData.map((sensor) => {
        const value = customExpression
          ? evaluateExpression(sensor, customExpression)
          : sensor[selectedGas];
        const [fillColor, color] = getCircleColor(value);
        return (
          <Circle
            key={sensor.id}
            center={[sensor.lat, sensor.lon]}
            radius={20000}
            pathOptions={{ fillColor, color, fillOpacity: 0.7 }}
          >
            <Popup>
              Sensor ID: {sensor.id}<br />
              {selectedGas}: {value.toFixed(2)}
            </Popup>
          </Circle>
        );
      })}
    </MapContainer>
  );

  const renderLineGraph = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={sensorData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xAxis} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={yAxis} stroke="#8884d8" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">IoT Sensor Network Visualization</h1>
      <Tabs defaultValue="map">
        <TabsList>
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="graph">Graph View</TabsTrigger>
        </TabsList>
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Select onValueChange={(value: GasType) => setSelectedGas(value)} defaultValue={selectedGas}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO2">NO2</SelectItem>
                    <SelectItem value="Ozone">Ozone</SelectItem>
                    <SelectItem value="PM25">PM2.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="mb-4">
                <Input
                  placeholder="Custom expression (e.g., NO2 + Ozone)"
                  value={customExpression}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomExpression(e.target.value)}
                />
              </div>
              {renderMap()}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="graph">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Data Graph</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Select onValueChange={(value: keyof SensorData) => setXAxis(value)} defaultValue={xAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select X-axis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timestamp">Timestamp</SelectItem>
                    <SelectItem value="NO2">NO2</SelectItem>
                    <SelectItem value="Ozone">Ozone</SelectItem>
                    <SelectItem value="PM25">PM2.5</SelectItem>
                  </SelectContent>
                </Select>
                <Select onValueChange={(value: keyof SensorData) => setYAxis(value)} defaultValue={yAxis}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Y-axis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NO2">NO2</SelectItem>
                    <SelectItem value="Ozone">Ozone</SelectItem>
                    <SelectItem value="PM25">PM2.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {renderLineGraph()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IoTSensorVisualization;
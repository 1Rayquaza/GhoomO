import { useRef, useEffect, useState } from 'react'
import * as tt from '@tomtom-international/web-sdk-maps'
import './App.css'
import '@tomtom-international/web-sdk-maps/dist/maps.css'

function App() {
  const mapElement = useRef()
  const [map, setMap] = useState({})

  useEffect(() => {
    const origin = {
      lng: 77.2090, // New Delhi's longitude
      lat: 28.6139, // New Delhi's latitude
    }
    const destinations = []

    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_API_KEY,
      container: mapElement.current,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true,
      },
      center: [origin.lng, origin.lat],
      zoom: 14,
    })
    setMap(map)
  }, []) // The empty dependency array means this effect will run once, similar to componentDidMount.

  return (
    <>
      {map && (
        <div className="app">
          <div ref={mapElement} className="map" />
          <div className="search-bar">
            <h1>Where to?</h1>
            <input
              type="text"
              id="longitude"
              className="longitude"
              placeholder="Longitude"
            />
            <input
              type="text"
              id="latitude"
              className="latitude"
              placeholder="Latitude"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default App;

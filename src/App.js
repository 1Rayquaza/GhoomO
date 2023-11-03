import { useRef, useEffect, useState } from 'react'
import * as tt from '@tomtom-international/web-sdk-maps'
import * as ttapi from '@tomtom-international/web-sdk-services'
import './App.css'
import '@tomtom-international/web-sdk-maps/dist/maps.css'

const App = () => { 
  const mapElement = useRef()
  const [map, setMap] = useState({})
  const [longitude, setLongitude] = useState(81.76763134699489)//25.430746806545788, 81.76763134699489
  const [latitude, setLatitude] = useState(25.430746806545788)

  const convertToPoints = (lngLat) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng
      }
    }
  }

  useEffect(() => {
    const origin = {
      lng: longitude,
      lat: latitude,
    }
    const destinations = []

    const addCircuit = () => {
      // destinations.push({ lat: 25.473034, lng: 81.878357 });
      // addDeliveryMarker({ lat: 25.473034, lng: 81.878357 }, map);
      destinations.push({ lat: 25.427828490262055, lng: 81.77325935100428 });//25.427828490262055, 81.77325935100428
      destinations.push({ lat: 25.44492439818056, lng: 81.82023375153176});//25.44492439818056, 81.82023375153176
      destinations.push({ lat: 25.446146398427192, lng: 81.81649870989105 });//25.446146398427192, 81.81649870989105
      destinations.push({ lat: 25.452380520210294, lng: 81.8221143278102 });//25.452380520210294, 81.8221143278102
      recalculateRoutes();
    }
    
    let map = tt.map({
      key: process.env.TOM_TOM_API_KEY,
      container: mapElement.current,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true,
      },
      center:[longitude, latitude],
      zoom: 14,
    })
    setMap(map)

    const drawRoute = (geoJson, map) => {
      if (map.getLayer('route')) {
        map.removeLayer('route')
        map.removeSource('route')
      }
      map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: geoJson
        },
        paint: {
          'line-color': '#000000',
          'line-width': 6
    
        }
      })
    }


    const sortDestinations = (locations) => {
      const pointsForDestinations = locations.map((destination) => {
        return convertToPoints(destination);
      });
      const callParameters = {
        key: process.env.TOM_TOM_API_KEY,
        destinations: pointsForDestinations,
        origins: [convertToPoints(origin)],
      };
    
      return new Promise((resolve, reject) => {
        ttapi.services
          .matrixRouting(callParameters)
          .then((matrixAPIResults) => {
            const results = matrixAPIResults.matrix[0];
            const sortedLocations = locations.map((location, index) => {
              return {
                ...location,
                drivingTime: results[index].response.routeSummary.travelTimeInSeconds,
              };
            });
            sortedLocations.sort((a, b) => {
              return a.drivingTime - b.drivingTime;
            });
            resolve(sortedLocations);
          });
      });
    };
    
    
    const recalculateRoutes = () => {
      sortDestinations(destinations).then((sorted) => {
        sorted.unshift(origin);
      });
    };
    

    addCircuit();
   
    map.on('click', (e) => {
      
      destinations.push(e.lngLat)
      recalculateRoutes()
    })

    return () => map.remove()
  }, [longitude, latitude])

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
              placeholder="destination longitude"
              onChange={(e) => {
                setLongitude(e.target.value)
              }}
              placeholder="Longitude"
            />
            <input
              type="text"
              id="latitude"
              className="latitude"
              placeholder="destination latitude"
              onChange={(e) => {
                setLongitude(e.target.value)
              }}
            />
            <input
              type="text"
              id="time"
              className="time"
              placeholder="Samay kitna hai"
              onChange={(e) => {
                setLatitude(e.target.value)
              }}

              placeholder="Latitude"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default App
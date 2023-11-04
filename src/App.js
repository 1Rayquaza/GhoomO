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
  const [maximumTravelTime, setMaximumTravelTime] = useState(10000)

  const convertToPoints = (lngLat) => {
    return {
      point: {
        latitude: lngLat.lat,
        longitude: lngLat.lng
      }
    }
  }

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

  const addDeliveryMarker = (lngLat, map) => {
    const element = document.createElement('div')
    element.className = 'marker-delivery'
    new tt.Marker({
      element: element
    })
    .setLngLat(lngLat)
    .addTo(map)
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
      addDeliveryMarker({ lat: 25.427828490262055, lng: 81.77325935100428 }, map);
      destinations.push({ lat: 25.44492439818056, lng: 81.82023375153176});//25.44492439818056, 81.82023375153176
      addDeliveryMarker({ lat: 25.44492439818056, lng: 81.82023375153176}, map);
      destinations.push({ lat: 25.446146398427192, lng: 81.81649870989105 });//25.446146398427192, 81.81649870989105
      addDeliveryMarker({ lat: 25.446146398427192, lng: 81.81649870989105 }, map);
      destinations.push({ lat: 25.452380520210294, lng: 81.8221143278102 });//25.452380520210294, 81.8221143278102
      addDeliveryMarker({ lat:  25.452380520210294, lng: 81.8221143278102 }, map);
      recalculateRoutes();
    }
    
  

    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_API_KEY,
      container: mapElement.current,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true,
      },
      center:[longitude, latitude],
      zoom: 14,
    })
    setMap(map)

    const addMarker = () => {
      const popupOffset = {
        bottom: [0, -25]
      }
      const popup = new tt.Popup({ offset: popupOffset }).setHTML('This is you!')
      const element = document.createElement('div')
      element.className = 'marker'

      const marker = new tt.Marker({
        draggable: true,
        element: element,
      })
        .setLngLat([longitude, latitude])
        .addTo(map)


      
      marker.on('dragend', () => {
        const lngLat = marker.getLngLat()
        setLongitude(lngLat.lng)
        setLatitude(lngLat.lat)
      })

      marker.setPopup(popup).togglePopup()
      
    }
    addMarker()
    
    const sortDestinations = (locations) => {
      const pointsForDestinations = locations.map((destination) => {
        return convertToPoints(destination);
      });
      const callParameters = {
        key: process.env.REACT_APP_TOM_TOM_API_KEY,
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
    
        // const maxTravelTime = 20 * 60 * 60; // 2 hours in seconds
        // const maxTravelTime = 1966; 
        const maxTravelTime = maximumTravelTime; 
        const validDestinations = [];
        let totalTravelTime = 0;
        console.log('sorted = ',sorted);
        for (let i = 1; i < sorted.length; i++) {
          const destination = sorted[i];
          console.log('destination s driving time = ',destination.drivingTime);
          console.log('total travelling time = ',totalTravelTime);
          console.log('maxTravelTime = ',maxTravelTime);
          // Assuming `destination.travelTime` is the travel time in seconds
          if (totalTravelTime + destination.drivingTime <= maxTravelTime) {
            validDestinations.push(destination);
            totalTravelTime += destination.drivingTime;
          } else {
            // If adding this destination exceeds the time limit, break the loop
            break;
          }
        }

         console.log('Valid destinations array:', validDestinations);
         if (validDestinations.length === 0) {
          // Display a popup or show an alert for an empty validDestinations array
          // For example, using an alert:
          alert('No valid destinations within the specified maximum travel time.');
        } else {
          ttapi.services
            .calculateRoute({
              key: process.env.REACT_APP_TOM_TOM_API_KEY,
              locations: [origin, ...validDestinations],
            })
            .then((routeData) => {
              const geoJson = routeData.toGeoJson();
              drawRoute(geoJson, map);
            });
        }
        
      });
    };
    

    addCircuit();
   
    map.on('click', (e) => {
      
      destinations.push(e.lngLat)
      addDeliveryMarker(e.lngLat, map)
      recalculateRoutes()
    })

    return () => map.remove()
  }, [longitude, latitude, maximumTravelTime])

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
                setMaximumTravelTime(e.target.value)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default App
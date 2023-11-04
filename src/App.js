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
  const [excludePlaces, setExcludePlaces] = useState([]);
  const [globalDestinations, setGlobalDestinations] = useState([]);

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

  // Function to handle the selection from the dropdown
  const handleExcludePlacesChange = (e) => {
    const selectedPlace = e.target.value;
    if (selectedPlace) {
      if (!excludePlaces.includes(selectedPlace)) {
        setExcludePlaces((prevExcludePlaces) => [...prevExcludePlaces, selectedPlace]);
      }
    }
  };


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
      destinations.push({ lat: 25.44492439818056, lng: 81.82023375153176 });//25.44492439818056, 81.82023375153176
      addDeliveryMarker({ lat: 25.44492439818056, lng: 81.82023375153176 }, map);
      destinations.push({ lat: 25.446146398427192, lng: 81.81649870989105 });//25.446146398427192, 81.81649870989105
      addDeliveryMarker({ lat: 25.446146398427192, lng: 81.81649870989105 }, map);
      destinations.push({ lat: 25.452380520210294, lng: 81.8221143278102 });//25.452380520210294, 81.8221143278102
      addDeliveryMarker({ lat: 25.452380520210294, lng: 81.8221143278102 }, map);
      recalculateRoutesNew();
    }
    setGlobalDestinations(destinations);

    let map = tt.map({
      key: process.env.REACT_APP_TOM_TOM_API_KEY,
      container: mapElement.current,
      stylesVisibility: {
        trafficIncidents: true,
        trafficFlow: true,
      },
      center: [longitude, latitude],
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

    const findShortestRoute = (matrix, maxTravelTime) => {
      const n = matrix.length;
      const visited = new Array(n).fill(false);
      const route = [0]; // Start from the 0th index (origin)
      let totalTravelTime = 0;

      while (route.length < n) {
        let minTime = Infinity;
        let nextDestination = -1;

        for (let i = 1; i < n; i++) {
          if (!visited[i] && !excludePlaces.includes(i) && matrix[route[route.length - 1]][i] < minTime) {
            minTime = matrix[route[route.length - 1]][i];
            nextDestination = i;
          }
        }
        if (nextDestination === -1 || totalTravelTime + minTime > maxTravelTime) {
          route.push(0);
          if (route.length > 0) {
            totalTravelTime += matrix[route[route.length - 1]][0];
          }
          break; // No valid destination found or exceeds maxTravelTime
        }
        if (totalTravelTime + matrix[nextDestination][0] <= maxTravelTime) {
          route.push(nextDestination);
          totalTravelTime += minTime;
        }
        visited[nextDestination] = true;
      }
      return route;
    };

    const getLocationTimes = async (currentOrigin, locations) => {
      const pointsForDestinations = locations.map((destination) => {
        return convertToPoints(destination);
      });
      const callParameters = {
        key: process.env.REACT_APP_TOM_TOM_API_KEY,
        destinations: pointsForDestinations,
        origins: [convertToPoints(currentOrigin)],
      };

      try {
        const matrixAPIResults = await ttapi.services.matrixRouting(callParameters);
        const results = matrixAPIResults.matrix[0];
        const locationTimes = results.map((result) => result.response.routeSummary.travelTimeInSeconds);
        return locationTimes;
      } catch (error) {
        throw new Error('Failed to fetch location times: ' + error.message);
      }
    };

    const recalculateRoutesNew = async () => {
      const newDestination = destinations.slice(); // Copy the destinations array
      newDestination.unshift(origin);

      const matrix = [];

      for (let i = 0; i < newDestination.length; i++) {
        matrix[i] = []; // Initialize the row for the current destination
        // Calculate the travel time between the i-th and j-th destinations
        const locationTimes = await getLocationTimes(newDestination[i], newDestination);
        matrix[i] = locationTimes;
        console.log(matrix[i]);
      }
      console.log(matrix);

      const maxTravelTime = maximumTravelTime;

      const validDestinations = findShortestRoute(matrix, maxTravelTime);
      console.log("valid destinations = ", validDestinations);

      if (validDestinations.length === 0) {
        // Display a popup or show an alert for an empty validDestinations array
        // For example, using an alert:
        alert('No valid destinations within the specified maximum travel time.');
      } else {
        // Convert coordinates to objects with latitude and longitude properties
        const newValidDestinations = validDestinations.map((index) => {
          return {
            latitude: newDestination[index].lat,
            longitude: newDestination[index].lng,
          };
        });

        // Add the origin to the beginning
        newValidDestinations.unshift({
          latitude: origin.lat,
          longitude: origin.lng,
        });

        // Add the origin to the end
        newValidDestinations.push({
          latitude: origin.lat,
          longitude: origin.lng,
        });

        console.log("old destinations = ", newDestination);
        console.log("new Valid Destinations = ", newValidDestinations);

        ttapi.services
          .calculateRoute({
            key: process.env.REACT_APP_TOM_TOM_API_KEY,
            locations: newValidDestinations, // Pass the converted destinations
          })
          .then((routeData) => {
            const geoJson = routeData.toGeoJson();
            drawRoute(geoJson, map);
          });
      }
    };

    addCircuit();

    map.on('click', (e) => {
      destinations.push(e.lngLat)
      addDeliveryMarker(e.lngLat, map)
      recalculateRoutesNew()
    })

    return () => map.remove()
  }, [longitude, latitude, maximumTravelTime])

  return (
    <>
      {map && (
        <div className="app">
          <div ref={mapElement} className="map" />
          <div className="search-bar">
            <input
              type="text"
              id="time"
              className="time"
              placeholder="Available Time"
              onChange={(e) => {
                setMaximumTravelTime(e.target.value)
              }}
            />

            <select id="excludePlaces" onChange={handleExcludePlacesChange}>
              <option value="">Select a place to exclude</option>
              {globalDestinations.map((place, index) => (
                <option key={index} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
            {/* Display the excluded places */}
            <div className="excluded-places">
              <p>Excluded Places:</p>
              <ul>
                {excludePlaces.map((place, index) => (
                  <li key={index}>{place}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default App
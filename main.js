/* Front-End Assignment 2
** Real-time bus data using Leaflet.js mapping library.
** Created by Christiane Harada */

(function () 
{
    //NSCC coordinates
    const map = L.map('theMap').setView([44.650627, -63.597140], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    // Bus icons
    const pinkBusIcon = L.icon({ iconUrl: 'busIcons/pinkBus.png' });     // 1
    const yellowBusIcon = L.icon({ iconUrl: 'busIcons/yellowBus.png' }); // 2
    const greenBusIcon = L.icon({ iconUrl: 'busIcons/greenBus.png' });   // 3
    const blueBusIcon = L.icon({ iconUrl: 'busIcons/blueBus.png' });     // 4
    const redBusIcon = L.icon({ iconUrl: 'busIcons/redBus.png' });       // 5
    const orangeBusIcon = L.icon({ iconUrl: 'busIcons/orangeBus.png' }); // 6
    const aquaBusIcon = L.icon({ iconUrl: 'busIcons/aquaBus.png' });     // 7
    const limeBusIcon = L.icon({ iconUrl: 'busIcons/limeBus.png' });     // 8
    const purpleBusIcon = L.icon({ iconUrl: 'busIcons/purpleBus.png' }); // 9
    const lightBlueBusIcon = L.icon({ iconUrl: 'busIcons/lightBlueBus.png' }); // 10

    // Get real-time data for all buses currently in service throughout HRM.
    // Convert data to geoJSON, filter buses 1-10
    function getBusInfoRealtime() 
    {    
        fetch('https://hrmbusapi.onrender.com/')
            .then(res => res.json())
            .then(json => {
                console.log('Raw Transit Data:', json);
                const arrayBusInfo = convertToGeoJSON(json);
                console.log('GeoJSON Data:', arrayBusInfo);
                updateMap(arrayBusInfo);
            })
    }

    function updateMap(arrayBusInfo) 
    {
        layerGroup.clearLayers(); // clear map before updating markers

        L.geoJSON(arrayBusInfo, {
            pointToLayer: function (feature, latlng) 
            {
                let busColor;
                let busNumber = feature.properties.routeId.charAt(0);
                let busNumber10 = feature.properties.routeId.slice(0, 2);
               
                switch (busNumber) 
                {
                    case '1':
                        busColor = pinkBusIcon;
                        break;
                    case '2':
                        busColor = yellowBusIcon;
                        break;
                    case '3':
                        busColor = greenBusIcon;
                        break;
                    case '4':
                        busColor = blueBusIcon;
                        break;
                    case '5':
                        busColor = redBusIcon;
                        break;
                    case '6':
                        busColor = orangeBusIcon;
                        break;
                    case '7':
                        busColor = aquaBusIcon;
                        break;
                    case '8':
                        busColor = limeBusIcon;
                        break;
                    case '9':
                        busColor = purpleBusIcon;
                        break;
                    default:
                        busColor = orangeBusIcon;
                        break;
                }

                if (busNumber10 == '10') 
                {
                    busColor = lightBlueBusIcon;
                }

                return L.marker(latlng, { icon: busColor, rotationAngle: feature.properties.bearing }).addTo(layerGroup);
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`<h1> Bus: ${feature.properties.routeId} </h1> <h2>${feature.properties.id}</h2>`);
            }
        });
    }

    // Refresh page/bus markers every 15 secs
    setInterval(getBusInfoRealtime, 15000);

    // Get route information for buses (1-10)
    function getRoutes(x) 
    {
        const routeNumber = (x.vehicle.trip.routeId).slice(0, 2);
        const number = routeNumber.charAt(0, 1);
        const letter = routeNumber.charAt(1, 2);

        if (routeNumber == '10' || (routeNumber.length == 1 && number >= 1 && number <= 9) || ((number >= 1 && number <= 9) && (letter == 'A' || letter == 'B'))) 
        {
            console.log('Route Id: ', x.vehicle.trip.routeId);
            return x;
        }
    }

    function convertToGeoJSON(json) 
    {
        const arrayData = json.entity;
        let busInfo = arrayData.filter(x => getRoutes(x));

        const geoJSONData = busInfo.map(x => {
            return {
                'type': 'Feature',
                'properties': {
                    'id': x.id,
                    'routeId': x.vehicle.trip.routeId,
                    'latitude': x.vehicle.position.latitude,
                    'longitude': x.vehicle.position.longitude,
                    'bearing': x.vehicle.position.bearing
                },
                'geometry': {
                    'type': "Point",
                    'coordinates': [x.vehicle.position.longitude, x.vehicle.position.latitude]
                }
            }
        });

        return geoJSONData;
    }

})()


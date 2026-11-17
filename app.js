const STOP_ID = "8231";

const stopCoords = [-122.276947, 47.549225];

const map = new maplibregl.Map({
    container: "map",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    center: stopCoords,
    zoom: 13
});

map.addControl(
    new maplibregl.NavigationControl()
);

map.on("load", async () => {
    const routeData = await fetch(
        "./data/routes/route_7/route7.geojson"
    ).then(r => r.json());

    map.addSource("route7", {
        type: "geojson",
        data: routeData
    });
    
    map.addLayer({
        id: "route7-line",
        type: "line",
        source: "route7",
        paint: {
            "line-color": "#FDB71A",
            "line-width": 5
        }
    });

    const stopElement = document.createElement("div");
    stopElement.className = "stop-marker";

    new maplibregl.Marker(stopElement)
        .setLngLat(stopCoords)
        .setPopup(
            new maplibregl.Popup().setHTML(
                "<b>Stop 8231</b><br>Rainier Ave S & S Kenny St"
            )
        )
        .addTo(map);

    loadLiveData();
    setInterval(loadLiveData, 15000);
});

let busMarkers = [];

async function loadLiveData() {

    if (API_KEY === "PUT_YOUR_ONEBUSAWAY_KEY_HERE") {
        document.getElementById("nextBus")
            .innerText = "Next Bus: Add API Key";

        document.getElementById("secondBus")
            .innerText = "Following Bus: Add API Key";

        return;
    }

    try {
        // clear old markers
        busMarkers.forEach(marker => marker.remove());
        busMarkers = []; 

        // Get bus data for stop.
        const arrivalsUrl =
            `https://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/1_${STOP_ID}.json?key=${API_KEY}`;

        const response = await fetch(arrivalsUrl);

        const data = await response.json();

        const allArrivals =
        data?.data?.entry?.arrivalsAndDepartures || [];

        const arrivals = allArrivals
        .filter(a => a.routeShortName === "7")
        .slice(0, 2);

        // Update arrival times.
        if (arrivals.length > 0) {

            const nextMinutes = minutesAway(arrivals[0]);

            document.getElementById("nextBus").innerText =
                `${nextMinutes} MIN • ${arrivals[0].tripHeadsign}`;

            if (arrivals[1]) {
                const nextSecondBusMinutes = minutesAway(arrivals[1]);
                document.getElementById("secondBus").innerText =
                `${nextSecondBusMinutes} MIN • ${arrivals[1].tripHeadsign}`;
            }
        }
        
        const routeBuses =
        data.data.entry.arrivalsAndDepartures
            .filter(a => a.routeShortName === "7");

        // Display buses on map
        routeBuses.forEach(bus => {
            const pos = bus.tripStatus?.position;
        
            if (!pos) return;
        
            const busEl = document.createElement("div");
        
            busEl.innerHTML = "7";
        
            busEl.style.width = "24px";
            busEl.style.height = "24px";
            busEl.style.borderRadius = "50%";
        
            busEl.style.background = "#FDB71A";
            busEl.style.color = "black";
        
            busEl.style.fontWeight = "bold";
            busEl.style.display = "flex";
            busEl.style.alignItems = "center";
            busEl.style.justifyContent = "center";
        
            busEl.style.border = "2px solid black";
            let marker = new maplibregl.Marker({element: busEl})
                .setLngLat([pos.lon, pos.lat])
                .addTo(map);
            busMarkers.push(marker);
        });
    } catch (e) {

        console.error(e);

        document.getElementById("nextBus")
            .innerText = "Unable to load arrivals";

        document.getElementById("secondBus")
            .innerText = "";
    }
}

function minutesAway(arrival) {

    const now = Date.now();

    const predicted =
        arrival.predictedArrivalTime ||
        arrival.scheduledArrivalTime;

    return Math.round(
        (predicted - now) / 60000
    );
}
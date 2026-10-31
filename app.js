const STOP_ID = "8231";

const stopCoords = [-122.2818, 47.5490];

const map = new maplibregl.Map({
    container: "map",
    style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    center: stopCoords,
    zoom: 14
});

map.addControl(
    new maplibregl.NavigationControl()
);

map.on("load", () => {

    const routeLine = {
        type: "Feature",
        geometry: {
            type: "LineString",
            coordinates: [
                [-122.334, 47.607],
                [-122.326, 47.595],
                [-122.317, 47.582],
                [-122.307, 47.570],
                [-122.296, 47.560],
                [-122.282, 47.549]
            ]
        }
    };

    map.addSource("route7", {
        type: "geojson",
        data: routeLine
    });

    map.addLayer({
        id: "route7-line",
        type: "line",
        source: "route7",
        paint: {
            "line-color": "#FFD100",
            "line-width": 8
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

    if (
        API_KEY === "PUT_YOUR_ONEBUSAWAY_KEY_HERE"
    ) {
        document.getElementById("nextBus")
            .innerText = "Next Bus: Add API Key";

        document.getElementById("secondBus")
            .innerText = "Following Bus: Add API Key";

        return;
    }

    try {

        const arrivalsUrl =
            `https://api.pugetsound.onebusaway.org/api/where/arrivals-and-departures-for-stop/${STOP_ID}.json?key=${API_KEY}`;

        const response = await fetch(arrivalsUrl);

        const data = await response.json();

        const arrivals =
            data.data.arrivalsAndDepartures
            .filter(a => a.routeShortName === "7")
            .slice(0, 2);

        if (arrivals.length > 0) {

            document.getElementById("nextBus")
                .innerText =
                `Next Bus: ${minutesAway(arrivals[0])} min`;

            if (arrivals[1]) {
                document.getElementById("secondBus")
                    .innerText =
                    `Following Bus: ${minutesAway(arrivals[1])} min`;
            }
        }

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
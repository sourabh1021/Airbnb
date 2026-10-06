console.log("MAP.JS LOADED");

const coordinates = window.listingCoordinates;

console.log("Coordinates:", coordinates);

const map = new maplibregl.Map({
    container: "map",
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: coordinates,
    zoom: 14
});


// Create popup
const popup = new maplibregl.Popup({
    offset: 25
}).setHTML(`
    <div style="min-width: 200px;">
        <h5>${window.listingTitle}</h5>

        <p>
            📍 ${window.listingLocation}
        </p>

        <a href="/listings/${window.listingId}">
            View Listing
        </a>
    </div>
`);


// Create marker
new maplibregl.Marker()
    .setLngLat(coordinates)
    .setPopup(popup)
    .addTo(map);
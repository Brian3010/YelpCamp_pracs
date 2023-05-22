mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: "map", // container ID
    style: "mapbox://styles/mapbox/streets-v12", // style URL
    center: campLocation.geometry.coordinates, // starting position [lng, lat]
    zoom: 8, // starting zoom
});
console.log(campLocation.geometry.coordinates);
// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());
const marker = new mapboxgl.Marker()
    .setLngLat(campLocation.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h6>${campLocation.title}</h6><p>${campLocation.location}</p>`
        )
    )
    .addTo(map);

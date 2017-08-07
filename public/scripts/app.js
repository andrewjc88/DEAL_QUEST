// 'use strict';

$(document).foundation();

function ViewModel(){

  this.tacoShops = ko.observableArray([]);
  this.tacoShops = ko.observable('94706');
  this.zipSearchButton = ko.observable();

  var self = this;
  var markers = [];
  var polygon = null;
  var map;

  document.getElementById('beginQuest').addEventListener('click', function() {
    questArea();
  });

  function questArea() {
    // Initialize geocoder
    var geocoder = new google.maps.Geocoder();
    // Get the address of place that the user entered.
    var address = document.getElementById('questArea').value;
    // Make sure input isn't blank.
    if (address == '') {
      window.alert('You must enter an zip code to start your Taco Quest!');
    } else {
      // Geocode the address/ area entered to get the center. Then, center the map
      // on it and zoom in.
      geocoder.geocode(
        { address: address },
        function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            map.setCenter(results[0].geometry.location);
            map.setZoom(14);
          } else {
            window.alert('We could not find that location - try entering a more specifif place.');
          }
        }
      );
    }
  }

  function yelpApi() {

  }

  function initMap() {

    // map styles
    var styles = [
        {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
        {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{color: '#263c3f'}]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{color: '#6b9a76'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{color: '#38414e'}]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{color: '#212a37'}]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{color: '#9ca5b3'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{color: '#746855'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{color: '#1f2835'}]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{color: '#f3d19c'}]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{color: '#2f3948'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{color: '#d59563'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{color: '#17263c'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#515c6d'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{color: '#17263c'}]
        }
      ];


    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 37.7749, lng: -122.4194},
      zoom: 15,
      styles: styles,
      mapTypeControl: false,
        
    });
  }

  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|40|_|%E2%80%A2',
      new google.maps.Size(21, 34),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(21,34));
    return markerImage;
  }

  // var defaultIcon = makeMarkerIcon('0091ff');
  // var highlightedIcon = makeMarkerIcon('ffff24');

  // for (var i = 0; i < locations.length; i++) {
  //     // Get position from current array.
  //     var position = locations[i].location;
  //     var title = location[i].title;
  //
  //     var marker = new google.maps.Marker({
  //         position: position,
  //         title: title,
  //         animation: google.maps.Animation.DROP,
  //         icon: defaultIcon,
  //         id: i
  //     });
  // };
  //
  // function showListings() {
  //     var bounds = new google.maps.LatLngBounds();
  //     for (var i = 0; i < markers.length; i++) {
  //         markers[i].setMap(map);
  //         bounds.extend(markers[i].position);
  //     }
  //     map.fitBounds(bounds);
  // };
  //
  // function hideListings() {
  //     for (var i = 0; i < markers.length; i++) {
  //         markers[i].setMap(null);
  //     }
  // };

  // Test locations to get started
  // var locations = [
  //     {title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
  //     {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
  //     {title: 'Union Square Open Floor Plan', location: {lat: 40.7347062, lng: -73.9895759}},
  //     {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
  //     {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
  //     {title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}}
  // ];



  var drawingManager = new google.maps.drawing.DrawingManager();
  drawingManager.setMap(map);

  //This shows and hides (respectively) the drawing options.
  function toggleDrawing(drawingManager) {
      if (drawingManager.map) {
          drawingManager.setMap(null);
          // In case the user drew anything, get rid of the polygon
          if (polygon !== null) {
              polygon.setMap(null);
          }
      } else {
          drawingManager.setMap(map);
      }
  }

  
  initMap();


}

ko.applyBindings(new ViewModel());
// 'use strict';

$(document).foundation();

var self = this;
var markers = [];
var polygon = null;
var map;
var initLoc = {lat: 37.7749, lng: -122.4194}; // SF Baby!

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
    center: initLoc,
    zoom: 10,
    styles: styles,
    mapTypeControl: false
  });

  var vm = new ViewModel();
  
  vm.query.subscribe(vm.liveSearch);

  ko.applyBindings(vm);

}

var ViewModel = function() {
  var self = this;
  var largeInfowindow = new google.maps.InfoWindow();    
  this.zipInput = ko.observable(''); // Zipcode input field 
  this.gDeals = ko.observableArray([]); // inital deals array
  this.query = ko.observable('');
  this.filteredDeals = ko.observableArray([]);
  
  self.newLoc = function() {
    // console.log("newLoc Ran");
    var currentLoc = this.zipInput();

    // Initialize geocoder
    var geocoder = new google.maps.Geocoder();
    
    // Get the address of place that the user entered.
    var address = currentLoc;

      // Make sure input isn't blank.
      if (address === '') {
        window.alert('You must enter an zip code to start your Deal Quest!');
      } else {

      // Geocode the address/ area entered to get the center. Then, center the map
      // on it and zoom in.
      geocoder.geocode(
        { address: address },
        function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {       

            // Lets make an object to pass into groupon request
            var lat = results[0].geometry.location.lat();
            var lng = results[0].geometry.location.lng();
            var latLng = {lat: lat, lng: lng};

            // Set map to new location
            map.setCenter(results[0].geometry.location);
            map.setZoom(10);

            // // clear previous 
            // gDeals.deals = null;

            // Send ajax request latlngs
            self.getGDeals(latLng);

          } else {
            window.alert('We could not find that location - try entering a more specifif place.');
          }
        }
      );
    }
  };

  self.getGDeals = function(location) {

    // console.log("getDeals Ran");
    var gUrl = "https://partner-api.groupon.com/deals.json?tsToken=IE_AFF_0_200012_212556_0&filters=category:food-and-drink&limit=30&offset=0&";
    var loc = location;
    
    // clear previous deals from array
    self.gDeals.removeAll();

    $.ajax({
      url: gUrl + 'lat=' + loc.lat + '&lng=' + loc.lng,
      dataType: 'jsonp',
      success: function(data) {
        var len = data.deals.length;
        for (var i = 0; i < len; i++) {

          var dealLoc = data.deals[i].options[0].redemptionLocations[0];

          // Filter out deals without address
          if (data.deals[i].options[0].redemptionLocations[0] === undefined) continue;
          
          var name = data.deals[i].merchant.name,
            lat = dealLoc.lat,
            lng = dealLoc.lng,
            url = data.deals[i].dealUrl,
            img = data.deals[i].mediumImageUrl,
            about = data.deals[i].pitchHtml,
            address = dealLoc.streetAddress1,
            city = dealLoc.city,
            state = dealLoc.state,
            zip = dealLoc.postalCode,
            shortAbout = data.deals[i].announcementTitle,
            tags = data.deals[i].tags,
            show = true;
          
          self.gDeals.push({
            name: name,
            lat: lat,
            lng: lng,
            url: url,
            img: img,
            about: about,
            address: address + "br" + city + ", " + state + " " + zip,
            shortAbout: shortAbout,
            tags: tags,
            show: show,

          });
        }
        self.makeMarkers(self.gDeals());
      },
      error: function() {
        alert("There was a problem Loading groupon deals!");
      }
    });
  };

  self.makeMarkers = function(deals) {
    // console.log("makeMarkers Ran");
    var iconImg = {
      url: 'dist/img/gIcon_2.png',
      scaledSize: new google.maps.Size(40, 40)
    };
    
    // Clear all existing markers 
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
    }

    self.filteredDeals.removeAll();

    for (i = 0; i < deals.length; i++) {
      
      // Show deals that should be shown
      if (deals[i].show === true) {
        var gMarker = new google.maps.Marker({
          position: {lat: deals[i].lat, lng: deals[i].lng},
          map: map,
          icon: iconImg,
          animation: google.maps.Animation.DROP,
          title: deals[i].name,
          content: deals[i]
        });
        
        markers.push(gMarker);

        self.filteredDeals.push(gMarker);

        self.listener(gMarker);

      }
    }
  };

  self.listener = function(item){
    item.addListener('click', function(){
      self.populateInfoWindow(this);
    });
  };

  self.populateInfoWindow = function(marker) {
    var infowindowData =
    '<div id="largeInfowindow">' +
    '<img src="' + marker.content.img + '">' +
    '<h4>' + marker.content.shortAbout + '</h4>' +
    '<p>' + marker.content.address + '</p>' +
    '<p><a href="' + marker.content.url + '" target="_blank">View deal</a></p>' +
    '<p>' + marker.content.about + '</p></div>';

    // Check to make sure the infowindow is not already opened on this marker.
    if (largeInfowindow.marker != marker) {
      largeInfowindow.marker = marker;
      largeInfowindow.setContent(infowindowData);
      largeInfowindow.open(map, marker);

      // Animate selected marker
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function(){ marker.setAnimation(null);
        }, 1400);
      }


      // Make sure the marker property is cleared if the infowindow is closed.
      largeInfowindow.addListener('closeclick', function() {
        largeInfowindow.marker = null;
      });
    }
  };
    
  self.liveSearch = function(value) {
    var Deals = self.gDeals();
    
    // Live show queried deals
    for (var i = 0; i < Deals.length; i++) {
      // Clear all deals not in search
      Deals[i].show = false;
      if (Deals[i].name.toLowerCase().indexOf(value.toLowerCase()) >= 0){

        // Show marker for list items
        Deals[i].show = true;
      }
      // Make markers and list items for shown deals
      self.makeMarkers(Deals);
    }
  };

  // Inital deals load
  self.getGDeals(initLoc);

};







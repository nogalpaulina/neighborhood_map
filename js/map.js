/* Neighborhood map application
 * Created by Paulina Nogal
 */

function initialize() {
	// Searching with an empty string returns popular points of interest
	Model.getYelpLocations('');
	// Initialize map
	Map.initialize();
};

var Model = {
	getYelpLocations: function(term) {
		var yelpURL = 'http://api.yelp.com/business_review_search?lat=41.48611&long=-71.3247682&term=' + term + '&radius=3&num_biz_requested=11&ywsid=glDt6TNTp1kRn1fL055uNQ&callback=?';
		var that = this;
		$.ajax({
			url: yelpURL, 
			async: false,
			dataType: "jsonp",
			success: function(response) {
				if (response.businesses.length > 0) {  
					for (i = 0; i < response.businesses.length; i++) {
						// Build a location object
						var location = {};
						var business = response.businesses[i];
			    			location.title = business.name;
			    			var address = business.address1 + " " + business.city + ", " + business.state;
			    			location.description = address;
			    			addYelpMarker(location);
			    		}  
				} else {
					ViewModel.sidebarList('<h4>No results found</h4>');
				}
			}
		});		
	}
};

function addYelpMarker(location) {
	// Convert the location's address to lat and long for map marker
	var geocoder = new google.maps.Geocoder();
	geocoder.geocode( { 'address': location.description}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			var position = results[0].geometry.location;
			location.latLng = [position.G, position.K];
			Map.addMarkers([location]);
		} else if (status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) { 
			// Fail silently if the location can't be converted
		}
	});
}

// Set up knockout bindings
var ViewModel = {
	sidebarList: ko.observable(),
	searchTerm: ko.observable(),
	searchButton: function() {
		var self = this;
		// Remove existing markers from the map
		Map.removeMarkers();
		// Clear sidebar list
		this.clearSidebar();
		// Get locations based on search term
		Model.getYelpLocations(self.searchTerm());
	},
	clearSidebar: function() {
		this.sidebarList('');
		Map.sidebarList = '';
	}
};

ko.applyBindings(ViewModel);

google.maps.event.addDomListener(window, 'load', initialize);

var Map = {

	initialize: function() {
		// set up map
		var mapOptions = {
			center: {
				lat: 41.4760898,
				lng: -71.3183302
			},
			zoom: 14
		};
		this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		this.markers = [];
		this.sidebarList = "";
		this.defaultIcon = 'img/black-marker.png';
		this.activeIcon = 'img/yellow-marker.png';
		this.infoWindow = new google.maps.InfoWindow();
		// Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
		var boundsListener = google.maps.event.addListener((this.map), 'bounds_changed', function(event) {
			this.setZoom(14);
			google.maps.event.removeListener(boundsListener);
		});
	},

	addMarkers: function(locations) {
		var bounds = new google.maps.LatLngBounds();
		// Loop through our array of markers & place each one on the map  
		for (i = 0; i < locations.length; i++) {
			var position = new google.maps.LatLng(locations[i].latLng[0], locations[i].latLng[1]);
			bounds.extend(position);
			marker = new google.maps.Marker({
				icon: this.defaultIcon,
				animation: google.maps.Animation.BOUNCE,
				position: position,
				map: this.map,
				title: locations[i].title
			});
			setTimeout(function() {
				marker.setAnimation(null)
			}, 750);
			this.markers.push(marker);
			this.sidebarList += "<h5 onclick='Map.clickMarker(" + (this.markers.length - 1) + ");'>" + locations[i].title + "</h5>";
			// Display multiple markers on a map
			var marker, i;

			// Allow each marker to have an info window
			google.maps.event.addListener(marker, 'click', (function(marker, location, that) {
				return function() {
					for (var i=0; i<that.markers.length; i++) {
                   				that.markers[i].setIcon(that.defaultIcon);
                			}
					marker.setIcon(that.activeIcon);
					that.infoWindow.close();
					this.map.panTo(marker.getPosition());
					marker.setAnimation(google.maps.Animation.BOUNCE);
					setTimeout(function() {
						marker.setAnimation(null)
					}, 750);
					that.infoWindow.setContent(infoWindowContent(location.title, location.description));
					that.infoWindow.open(this.map, marker);
				}
			})(marker, locations[i], this));
		}
		ViewModel.sidebarList(this.sidebarList);

		// Info Window Content
		var infoWindowContent = function(title, description) {
			return '<div class="info_content">' +
				'<h3>' + title + '</h3>' +
				'<p>' + description + '</p>' + 
				'</div>';
		};
	},
	clickMarker: function(id) {
		google.maps.event.trigger(this.markers[id], 'click');
	},
	removeMarkers: function() {
		for (var i = 0; i < this.markers.length; i++) {
			this.markers[i].setMap(null);
		}
		this.markers = [];
	}
}

$('#input').keyup(function(e) {
	if(e.which == 13) { // Enter key pressed
		$('#search').click(); // Trigger search button click event
	}
});

$("#eye-button").click(function() {
	$("#sidebar").toggle(1000, "swing");
});
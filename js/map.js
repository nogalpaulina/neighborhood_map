function initialize() {
	Map.initialize();
	Map.addMarkers(Model.locations);
};

var Model = {
	locations: [{
		'title': 'Fort Adams',
		'latLng': [41.4743827, -71.3428249],
		'description': 'Park on the site of a 19th-century fort, with sailing, swimming & the Newport jazz & folk festivals'
	}, {
		'title': 'The Breakers',
		'latLng': [41.4692745, -71.2977931],
		'description': 'The Breakers is the grandest of Newport\'s summer \"cottages\" and a symbol of the Vanderbilt family\'s social and financial preeminence in turn of the century America.'
	}, {
		'title': 'The Elms',
		'latLng': [41.4777992, -71.3089636],
		'description': 'The Elms was the summer residence of Mr. and Mrs. Edward Julius Berwind of Philadelphia and New York. Mr. Berwind made his fortune in the coal industry.'
	}, {
		'title': 'Rosecliff',
		'latLng': [41.464745, -71.3052973],
		'description': 'Commissioned by Nevada silver heiress Theresa Fair Oelrichs in 1899, architect Stanford White modeled Rosecliff after the Grand Trianon, the garden retreat of French kings at Versailles.'
	}, {
		'title': 'Marble House',
		'latLng': [41.4620825, -71.3048545],
		'description': 'Marble House was built between 1888 and 1892 for Mr. and Mrs. William K. Vanderbilt.  It was a summer house, or cottage, as Newporters called them in remembrance of the modest houses of the early 19th century.'
	}, {
		'title': 'Internationl Tennis Hall of Fame and Museum',
		'latLng': [41.4823553, -71.3079833],
		'description': 'As part of the global tennis community the International Tennis Hall of Fame is committed to preserving tennis history, celebrating its champions, and educating and inspiring a worldwide audience.'
	}, {
		'title': 'King Park',
		'latLng': [41.4770937, -71.3180953],
		'description': 'Grassy space on Newport Harbor with a gazebo, a boat ramp & a monument of French General Rochambeau.'
	}, {
		'title': 'Ocean Drive Historic District',
		'latLng': [41.4546443, -71.3350707],
		'description': ' In the late 1800s many wealthy New Yorkers escaped to Newport on "Rhode Island" during hot summers. As Newport became more popular and easier to reach with a passenger steamship route the southern end of Newport...'
	}, {
		'title': 'Cliff Walk',
		'latLng': [41.4850926, -71.2976432],
		'description': 'The Cliff Walk along the eastern shore of Newport, RI is world famous as a public access walk that combines the natural beauty of the Newportshoreline with the architectural history of Newport\'s gilded age. Wildflowers, birds, geology ... all add to this delightful walk.'
	}]
};

// Set up knockout bindings
var ViewModel = {
	sidebarList: ko.observable(),
	searchTerm: ko.observable(),
	searchButton: function() {
		// Filter out the locations that don't match the user input
		self = this;
		var searchLocations = Model.locations.filter(function(location) {
			return location.title.toLowerCase().indexOf(self.searchTerm().toLowerCase()) > -1 ||
				location.description.toLowerCase().indexOf(self.searchTerm().toLowerCase()) > -1;
		});
		Map.addMarkers(searchLocations);
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
		// Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
		var boundsListener = google.maps.event.addListener((this.map), 'bounds_changed', function(event) {
			this.setZoom(14);
			google.maps.event.removeListener(boundsListener);
		});
	},

	addMarkers: function(locations) {
		// Remove existing markers (if any)
		this.removeMarkers();
		var bounds = new google.maps.LatLngBounds();
		// Automatically center the map fitting all markers on the screen
		// TODO: figure out this bounds stuff
		// this.map.fitBounds(bounds);
		// Loop through our array of markers & place each one on the map  
		var sidebarList = "";
		for (i = 0; i < locations.length; i++) {
			var position = new google.maps.LatLng(locations[i].latLng[0], locations[i].latLng[1]);
			bounds.extend(position);
			marker = new google.maps.Marker({
				animation: google.maps.Animation.DROP,
				position: position,
				map: this.map,
				title: locations[i].title
			});
			this.markers.push(marker);
			sidebarList += "<h5 onclick='Map.clickMarker(" + (this.markers.length - 1) + ");'>" + locations[i].title + "</h5>";
			// Display multiple markers on a map
			var infoWindow = new google.maps.InfoWindow(),
				marker, i;

			// Allow each marker to have an info window
			google.maps.event.addListener(marker, 'click', (function(marker, location) {
				return function() {
					marker.setAnimation(google.maps.Animation.BOUNCE);
					setTimeout(function() {
						marker.setAnimation(null)
					}, 700);
					infoWindow.setContent(infoWindowContent(location.title, location.description));
					infoWindow.open(this.map, marker);
				}
			})(marker, locations[i]));
		}
		ViewModel.sidebarList(sidebarList);

		// Info Window Content
		var infoWindowContent = function(title, description) {
			return '<div class="info_content">' +
				'<h3>' + title + '</h3>' +
				'<p>' + description + '</p>' + '</div>';
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
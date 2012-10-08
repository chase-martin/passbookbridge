/**
 * JavaScript bridge to Passbook webservice for mobile Safari on iOS6
 * Self-executing module
 */
var passbridge = function(){
	var then,
		divLoading = document.querySelector(".spinner"),
		divLoaded = document.querySelector(".passbook");	
	
	/**
	 * Prevent scrolling until loading is complete (required!)
	 */
	function preventScrolling(e){
		e.preventDefault();
	};
	
	/**
	 * Display the "loading" message before pass has been generated
	 */
	function loading(){
		// Fade in 'loading' message
		divLoading.style.opacity = 1;
		document.querySelector(".passbook").style.display = "none";
		
		// Prevent false positive for overlay detection
		window.addEventListener('touchmove', preventScrolling, true);
		
		// Initiate passbook webservice call safely after 'loading' fades in
		window.setTimeout(function(){
			document.forms[0].submit();
		}, 500);
	};
	
	/**
	 * Display the "loaded" message after pass created
	 */
	function loaded(){
		// Fire omniture event 'Pass Created.'
		// This is set up in index.html (see omniture.js batch method)
		Omniture.batch();
		
		// It is safe to allow scrolling again
		window.removeEventListener('touchmove', preventScrolling, true);
		
		// Animations: Fade transition to 'loaded' message
		divLoading.addEventListener('webkitTransitionEnd', function(e){
			this.style.display="none";
			divLoaded.style.display = "block";
			divLoaded.style.opacity = 1;
		});
		divLoading.style.opacity = 0;
	};
	
	/**
	 * Wrap the onload event, call loading method, and begin overlay detection polling
	 */
	return window.addEventListener('load', function() {	
		// Show 'loading' msg	
		loading();
			
		// Poll for >300ms pause in JS, assume Passbook overlay (page !visible)
		window.webkitRequestAnimationFrame(function(now){
			if( then !== undefined && now - then > 300 ) {
				// Show 'loaded' msg	
				loaded();
			} else {
				then = Date.now();
				window.webkitRequestAnimationFrame(this);
			}
		});
	});
}();
/**
 * JavaScript bridge to Passbook webservice for mobile Safari on iOS6
 */
var passbridge = function(){	
	return window.addEventListener('load', function() {
		
		// Fade in 'loading' message
		document.querySelector(".loading").style.opacity = 1;
		
		// Prevent scrolling until loading is complete (required!)
		window.addEventListener('touch', function passbook_loading(e){
			e.preventDefault();
		});
		
		// Poll for >200ms pause in JS, assume Passbook overlay (page !visible)
		var then = Date.now();
		window.webkitRequestAnimationFrame(function(now){
			if( now - then > 200) {
				// It is safe to allow page scrolling again
				window.removeEventListener('touch', 'passbook_loading');
				
				// Animations: Fade transition to 'loaded' message
				var loading = document.querySelector(".loading");
				loading.style.opacity = 0;
				loading.addEventListener('webkitTransitionEnd', function(e){
					this.style.display = "none";
				});
				document.querySelector(".loaded").style.opacity = 1;		 
			} else {
				then = Date.now();
				window.webkitRequestAnimationFrame(this);
			}
		});
		
		// Initiate passbook webservice call safely after 'loading' fades in
		window.setTimeout(function(){
			document.forms[0].submit();
		}, 500);
	});
}();
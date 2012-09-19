/**
 * Detect orientation change
 * @callback callback function on orientation change
 */
var disoriented = function(callback){
	var callback = callback || function(){/* do nothing*/ };	
	return {
		init: window.addEventListener("orientationchange", function() {
		
		// Fade in 'loading' message
		document.querySelector(".loading").style.opacity = 1;
		
		// Prevent scrolling until loading is complete (required!)
		window.addEventListener('touch', function passbook_loading(e){
			e.preventDefault();
		});
		
		// Poll for >300ms pause in JS, assume Passbook overlay (page !visible)
		window.webkitRequestAnimationFrame(function(now){
			if( then !== undefined && now - then > 300) {
				// It is safe to allow page scrolling again
				window.removeEventListener('touch', 'passbook_loading');
				
				// Animations: Fade transition to 'loaded' message
				var loading = document.querySelector(".loading");
				loading.style.opacity = 0;
				loading.addEventListener('webkitTransitionEnd', function(e){
					this.style.display = "none";
					var loaded = document.querySelector(".loaded");
					loaded.style.opacity = 1;
					loaded.style.display = "table-cell";
				});
						 
			} else if ( then === undefined ){
				then = Date.now();
				window.webkitRequestAnimationFrame(this);
				
				// Initiate passbook webservice call safely after 'loading' fades in
				window.setTimeout(function(){
					document.forms[0].submit();
				}, 500);
			} else {
				then = Date.now();
				window.webkitRequestAnimationFrame(this);
			}
		});
	});
}();
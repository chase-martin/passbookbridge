/**
 * JavaScript bridge to Passbook webservice for mobile Safari on iOS6
 * Self-executing module
 */
var passbridge = function(){
    var then,
        divLoading = document.querySelector(".spinner"),
        divLoaded = document.querySelector(".passbook"),
        divUnload = document.querySelector(".requirements");
    
    /**
     * Display the "loading" message before pass has been generated
     * Setup passbook overlay polling if iOS, or separate message otherwise
     */
    function loading(){
        // Fade in 'loading' message
        fade(divLoading, 1);
        
        // Prevent false positive for overlay detection
        window.addEventListener('touchmove', preventScrolling, true);
        
        // Initiate passbook webservice call safely after 'loading' fades in
        window.setTimeout(function(){  
            document.forms[0].submit();
        },500);

        if (navigator.userAgent.match(/iPhone/i))
            passbookRAF(); // Initiate passbook webservice and begin polling for overlay
        else 
            setTimeout(unload, 2000); // Or just show the unload message
    };
    
    /**
     * Display the "loaded" message after pass created
     */
    function loaded() {
        // Fire omniture event 
        // This is setup in index.html - see Omniture.batch();
        passCreated.call();
        
        // Animations: Fade transition to 'loaded' message
        fade(divLoading, 0, function(){
            divLoading.style.display="none";
            divLoaded.style.display = "block";
            fade(divLoaded, 1);
        });
    };
    
    /**
     * Display a separate message for non-ios (desktop safari)
     */
    function unload(){        
        // Display unload message 
        divLoading.style.display="none";
        divUnload.style.display = "block";
        fade(divUnload, 1);
    };
    
    /**
     * Poll for >300ms pause in JS, assume Passbook overlay (page !visible)
     * Only works in iOS mobile safari
     */
    function passbookRAF(){
        // Begin polling for passbook overlay (iOS mobile safari only)
        window.webkitRequestAnimationFrame(function(now){console.log(now-then);
            if( then !== undefined && now - then > 300 ) {
                // It is safe to allow scrolling again
                window.removeEventListener('touchmove', preventScrolling, true);
                
                // Show 'loaded' msg    
                loaded();
            } else {
                then = Date.now();
                window.webkitRequestAnimationFrame(this);
            }
        });
    };
    
    /**
     * Utility function to add fadein/fadeout class to element
     * @param div: {DOMElement} element to fade
     * @param direction: {number} 0 or 1 for the opacity propery
     * @param callback: {function} function to call on transitionEnd
     */
    function fade(div, direction, callback) {
        if(callback !== undefined) {
            div.addEventListener('webkitTransitionEnd', function(e){
                callback.call();
            }, false);
        };
        setTimeout(function(){
            div.style.opacity = direction;
        },01);
    };
    
    /**
     * Prevent scrolling until loading is complete (required!)
     */
    function preventScrolling(e){
        e.preventDefault();
    };
    
    /**
     * Wrap the onload event and call the appropriate loading method
     */
    return window.addEventListener('load', function(e) {  
        // Show loading message
        loading()
    });
}();
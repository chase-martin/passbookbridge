/**
 * JavaScript bridge to Passbook webservice for mobile Safari on iOS6
 * Self-executing module
 */
var passbridge = function(){
    var then,
        interval,
        divLoading = document.querySelector(".spinner"),
        divLoaded = document.querySelector(".passbook"),
        divUnload = document.querySelector(".requirements");
        
    /**
     * Display the "loading" message before pass has been generated
     * Setup passbook overlay polling if iOS, or separate message otherwise
     */
    function loading(){
        var passform = passform = document.querySelector("#locationChooser");
        
        // Fade out form and show spinner
        fade(passform, 0, function(e){
            passform.style.display='none';
            fade(divLoading, 1);
        });
        
        if (navigator.userAgent.match(/iPhone/i)) {      
            // Initiate passbook webservice and begin polling for overlay
            passbookSI();
        } else {
            // If not iOS, briefly display spinner, then show unload message
            setTimeout(unload, 2000);
        }

        // Prevent false positive for overlay detection
        window.addEventListener('touchmove', preventScrolling, true);
        
        // Initiate passbook webservice call safely after 'loading' fades in
        window.setTimeout(function(){  
            passform.submit();
        },1000);
    };
    
    /**
     * Display the "loaded" message after pass created
     */
    function loaded() {
        // Fire omniture event 
        // This is setup in index.html - see Omniture.batch();
        passCreated.call();
        
        // Animations: Fade transition to 'loaded' message
        fade(divLoading, 0, function() {
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
     * Same as passbookRAF but uses setInterval
     * Poll for >300ms pause in JS, assume Passbook overlay (page !visible)
     * Only works in iOS mobile safari
     */
    function passbookSI(){
        // Begin polling for passbook overlay (iOS mobile safari only)
        interval = window.setInterval(function(){
            var now = Date.now();
            if( then !== undefined && now - then > 300 ) {
                // It is safe to allow scrolling again
                window.removeEventListener('touchmove', preventScrolling, true);
                window.clearInterval(interval);
                // Show 'loaded' msg    
                loaded();
            } else {
                then = Date.now();
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
        // Add event listeners for passbook location form
        for(var i = 0,
            n = ['zipCode','useLocation','skip','createPass'], // DOM nodes
            e = ['focus','change','click','click'], // events
            f = [ // event handlers
                function (e) { // zipCode_focus: on focusing zip field, select correct radio 
                    e.target.form.useZipCode.checked = true;
                    e.target.form.useLocation.checked = false;
                },
                function (e) { // useLocation_change: on deselecting zip option, empty field
                    if(e.target.id == 'useLocation')
                        e.target.form.zipCode.value = '';
                },
                function (e) { // skip_click: skip button clicked
                    // prevent multiple submits
                    e.target.form.skip.disabled = 'disabled';
                    e.target.form.createPass.disabled = 'disabled';
                    // formSkipped field is redundant
                    e.target.form.formSkipped.value = 'true';
                    // Show loading message
                    loading(e.target.form);
                },
                function (e) { // createPass_click: handle geolocation and submit
                    e.preventDefault();
                    // save form for geo callbacks
                    var thisForm = e.target.form;
                    // prevent multiple submits
                    thisForm.createPass.disabled = 'disabled';
                    thisForm.skip.disabled = 'disabled';
                    // get geolocation, callbacks passed inline
                    if(thisForm.useLocation.checked) { 
                        navigator.geolocation.getCurrentPosition(
                            function useLocationGeo(position) { // geolocation success callback
                                // Add geo data to form fields
                                thisForm.geoTimestamp.value = position.timestamp;
                                thisForm.geoAccuracy.value = position.coords.accuracy;
                                thisForm.geoLatitude.value = position.coords.latitude;
                                thisForm.geoLongitude.value = position.coords.longitude;
                                // Show loading message
                                loading();
                            },
                            function geoError(ex) { // geolocation error callback
                                // pass geo error to form field
                                thisForm.geoError = ex;
                                // Show loading message
                                loading();
                            }
                        );
                    } else { // use zip (or submit empty form)
                        // Show loading message
                        loading();
                    }
                }
            ];
            i<n.length;
            // Add event listeners
            document.getElementById(n[i]).addEventListener(e[i], f[i], false),
            i++
        ){}; 
    });
}();
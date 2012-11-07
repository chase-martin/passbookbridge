/**
 * JavaScript bridge to Passbook webservice for mobile Safari on iOS6
 * Self-executing module
 */
var passbridge = function(){
    var then,
        interval,
        divLoading = document.querySelector('.spinner'),
        divLoaded = document.querySelector('.passbook'),
        divUnload = document.querySelector('.requirements'),
        thisForm = document.getElementById('locationChooser');
        
    /**
     * Display the 'loading' message before pass has been generated
     * Setup passbook overlay polling if iOS, or separate message otherwise
     */
    function loading(){
        var passform = passform = document.querySelector('#locationChooser');
        
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
     * Display the 'loaded' message after pass created
     */
    function loaded() {
        // Fire omniture event 
        // This is setup in index.html - see Omniture.batch();
        passCreated.call();
        
        // Animations: Fade transition to 'loaded' message
        fade(divLoading, 0, function() {
            divLoading.style.display='none';
            divLoaded.style.display = 'block';
            fade(divLoaded, 1);
        });
    };
    
    /**
     * Display a separate message for non-ios (desktop safari)
     */
    function unload(){        
        // Display unload message 
        divLoading.style.display='none';
        divUnload.style.display = 'block';
        fade(divUnload, 1);
    };
    
    /**
     * Poll for >300ms pause in JS, assume Passbook overlay (page !visible)
     * Only works in iOS mobile safari
     */
    function passbookRAF(){
        // Begin polling for passbook overlay (iOS mobile safari only)
        window.webkitRequestAnimationFrame(function(now){
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
            div.addEventListener('webkitTransitionEnd', function call_handle(e) {
                callback.call();
                e.target.removeEventListener('webkitTransitionEnd', call_handle, false);
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
     * Filter zipcode form field allowing digits only
     * requires location.zipcode input field in thisForm
     */
    function validateZip(e){
        if (!isNumeric(thisForm['location.zipcode'])) {
            showFormError(thisForm['location.invalidzip']);
        } else if (thisForm['location.zipcode'].value.length > 5) {
            showFormError(thisForm['location.invalidzip']);
        } else if (thisForm['location.zipcode'].value.length == 5) {
            if (thisForm['location.invalidzip'].type != 'hidden') {
                hideFormError(thisForm['location.invalidzip']);
            }
        } else if ( thisForm['location.zipcode'].value.length < 5
                    && thisForm['location.invalidzip'].dataset.showError == 'true') {
            showFormError(thisForm['location.invalidzip']);
        }
    };
    
    /**
     * Show or hide form error using fade (form errors are type=hidden per request)
     * wrapper for fade which provides a quicker fade out effect
     */
    function hideFormError(formElem){
        fade(formElem, 0);
        // Useing settimeout instead of fade callback for quick fadeout
        setTimeout(function(){formElem.type='hidden';},100);
    }
    
    /**
     * Show form error using fade (form errors are type=hidden per request)
     * wrapper for fade which provides a quicker fade out effect
     */
    function showFormError(selector){
        if(thisForm['location.invalidzip'].dataset.showError != 'true')
            thisForm['location.invalidzip'].dataset.showError = 'true';
        thisForm['location.invalidzip'].type='text';
        fade(thisForm['location.invalidzip'], 1);
    }
    
    /**
     * Check for numerical-only values in a string
     */
     function isNumeric(str){
         // match for anything but a number
          var chars = str.value.match(/[^0-9]+/);
          if (chars !== null )
            return false;
          else
            return true;
     }
    
    // Event Handlers for Passbook form
    
    /**
     * Event Handler for location.zipcode focus: on focusing zip field, select correct radio 
     */
     function zipcode_focus(e) { //  
         thisForm['location.choose_zip'].checked = true;
         thisForm['location.choose_loc'].checked = false;
         // digits only in zipcode
         window.addEventListener('keyup', validateZip, false);
     };
     
    /**
     * Event Handler for location.zipcode blur: remove zip validator if zipcode is not in focus
     */
     function zipcode_blur(e) {
         window.removeEventListener('keyup',validateZip, false);
     }
     
    /**
     * Event Handler for location.choose_loc change: on deselecting zip option, empty field
     */
     function choose_loc_change(e) {
         thisForm['location.invalidzip'].dataset.showError = 'false';
         thisForm['location.zipcode'].value = '';
         hideFormError(thisform['location.invalidzip']);
     }
     
    /**
     * Event Handler for skip click: skip button clicked
     */
     function skip_click(e) {
         // prevent multiple submits
         thisForm['location.skip'].disabled = 'disabled';
         thisForm['location.create'].disabled = 'disabled';
         document.getElementById('errors').innerHTML = '';
         // Clear relevant form elements on skip
         for(var i in thisForm.elements) {
             if( thisForm.elements[i].dataset 
                 && thisForm.elements[i].dataset.clearOnSkip == 'true' ) {
                     thisForm.elements[i].value = '';
             }
         }
         thisForm['location.skipped'].value = 'true';
         // Show loading message
         loading();
     }
     
    /**
     * Event Handler for location.create click: handle geolocation and submit
     */
     function create_click(e) {
         e.preventDefault();
         // Zipcode could be too short at this point, validate.
         if( thisForm['location.choose_zip'].checked == true
             && thisForm['location.zipcode'].value.length != 5
             || !isNumeric(thisForm['location.zipcode'])) {
             thisForm['location.invalidzip'].dataset.showError = 'true';
             thisForm['location.invalidzip'].type='text';
             fade(thisForm['location.invalidzip'], 1);
             return false;
         }
         // prevent multiple submits
         thisForm['location.create'].disabled = 'disabled';
         thisForm['location.skip'].disabled = 'disabled';
         document.getElementById('errors').innerHTML = '';
         // get geolocation, callbacks passed inline
         if(thisForm['location.choose_loc'].checked) { 
             navigator.geolocation.getCurrentPosition(
                 function useLocationGeo(position) { // geolocation success callback
                     // Add geo data to form fields
                     thisForm['location.timestamp'].value = position.timestamp;
                     thisForm['location.accuracy'].value = position.coords.accuracy;
                     thisForm['location.latitude'].value = position.coords.latitude;
                     thisForm['location.longitude'].value = position.coords.longitude;
                     // Show loading message
                     loading();
                 },
                 function geoError(ex) { // geolocation error callback
                     // pass geo error to form field
                     thisForm['location.error'] = ex;
                     // Show loading message
                     loading();
                 }
             );
         } else { // use zip (or submit empty form)
             // Show loading message
             loading();
         }
     }
     
     /**
      * Add Event Handlers for location form
      */
    function initializeForm(e) {
        // nodes, events and handlers
        var c = { 
            n : ['location.zipcode','location.zipcode','location.choose_loc','location.skip','location.create'],
            e : ['focus','blur','change','click','click'],
            h : [zipcode_focus, zipcode_blur, choose_loc_change, skip_click, create_click]
        };
        // Add event listeners for passbook location form
        for(var i = 0; i < c.n.length; i++) {
            document.getElementById(c.n[i]).addEventListener(c.e[i], c.h[i], false);
        }

        if(thisForm['location.zipCodeIsInvalidOnServer'].value == 'true') {
            thisForm['location.invalidzip'].type = "text";
            fade(thisForm['location.invalidzip'], 1, function(){
                thisForm['location.zipcode'].focus();
            });
        }
    }
     
    /**
     * Wrap the page load event and call the appropriate init method
     */
    return window.addEventListener('DOMContentLoaded', initializeForm);
}();
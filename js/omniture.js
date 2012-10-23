//Requires bootstrap.js, coherent.js, apple.js and metrics.js
//Compile to omniture_compressed.js with all dependencies prepended

/**
 * Wrapper for Apple Metrics
 * Currently supports fire and click omniture events
 */
var Omniture = function () {
    "use strict";
    
    /**
     * Wrap all omniture calls here
     * @param callback: {function} the omniture call to be made
     */
    function omniture (callback) {
        // Make sure apple metrics is available
        if (typeof (window.s) === "object") callback.call();
    };
    
    // public
    return {
        /**
         * Initialize multiple omniture calls, see fire and click methods
         * @param config: {json} { fire/click: [ parameters ]} 
         */
        init: function (config){
            for(var fun in config) {
                // Call the fire or click method and pass in an array of parameters
                Omniture[fun].apply(this, config[fun]);
            }
        },
        
        /**
         * Wrapper function for init, allows delayed execution of Omniture.fire events
         * Use var batchName = Omniture.batch({config}); then batchName.call(); to call the saved batch.
          * Note: Omnicure.click events cannot be delayed easily (without a custom loadEvent etc)
          * @param config: {json object} json required by init.
         */
        batch: function (config) {
            return function() { Omniture.init(config); };
        },
        
        /**
         * Call apple metrics fireEvent method
         * @param vars: {json} parameters required by apple metrics 
         */
        fire: function (vars) {
            omniture(function(){ apple.metrics.fireEvent(vars); });
        },
        
        /**
         * Setup a click event to call apple metrics fireEvent onclick
         * @param selector: {string} selector for click element
         * @param vars: {json} parameters required by apple metrics 
         * @param loadEvent: {string} Typically 'load' or 'DOMContentLoaded' 
         */
        click: function (selector, vars, loadEvent) {
            loadEvent = loadEvent || 'DOMContentLoaded';
            window.addEventListener(loadEvent, function () {
                var nodes = (document.querySelectorAll);
                for (var i = 0; i < nodes.length; ++i) {
                    nodes[i].addEventListener('click', function (e) {
                        Omniture.fire(vars);
                    }, false);
                }
            }, false);
        }
    };
}();

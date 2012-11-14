Simple Passbook webservice bridge
Passbridge.js: A passbook overlay is detected by polling for a pause in JavaScript. Scrolling also causes a pause in JS so 'touchmove' events are captured while polling. RequestAnimationFrame is used because it is tied to the kind of throttling we are looking for. Animations are always paused when not visible. 

Omniture.js: Provides a wrapper for apple metrics.js allowing omniture vars to be set in the html. Index.html in particular will fire one of three different pageName values depending on whether device is iOS and if a pass is being generated or already created. 

File compression: Yui compressor is used for main.css -> main_compressed.css, and Closure is used for passbridge.js -> passbridge_compressed.js. Omniture.js is also compressed with Closure but requires that metrics.js and other dependencies be prepended. See omniture.js comments for the complete list.

Build Script (requires closure and yuicompressor):

    cd /users/chase/Sites/passbookbridge/js 
    closure --js passbridge.js --js_output_file passbridge_compressed.js
    closure --js bootstrap.js --js coherent.js --js apple.js --js metrics.js --js omniture.js  --js_output_file omniture_compressed.js
    
    cd /users/chase/Sites/passbookbridge/css
    yuicompressor main.css -o main_compressed.css
    
    function closure() {
        java -jar /Users/chase/Developer/tools/compiler-latest/compiler.jar $@
    }


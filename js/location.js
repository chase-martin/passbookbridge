// Add event listeners for geolocation/zipcode and basic form UI
document.addEventListener('DOMContentLoaded', function(){
    for(var i = 0,
        n = ['zipCode', 'useZipCode','useLocation','skip','createPass'], // DOM nodes
        e = ['focus','change','change','click','click'], // events
        f = [ // event handlers
            function (e) { // zipCode_focus
                e.target.form.useZipCode.checked = true;
                e.target.form.useLocation.checked = false;
            }, 
            function (e) { // useZipCode_change
                // Do nothing!
                //if(e.target.id == 'useZipCode') e.target.form.zipCode.focus();
            },
            function (e) { // useLocation_change
                if(e.target.id == 'useLocation')
                    e.target.form.zipCode.value = '';
            },
            function (e) { // skip_click
                // prevent multiple submits
                e.target.form.skip.disabled = 'disabled';
                e.target.form.createPass.disabled = 'disabled';
                
                e.target.form.formSkipped.value = 'true';
                e.target.form.submit();
            },
            function (e) { // createPass_click
                e.preventDefault();

                var thisForm = e.target.form;
                
                // prevent multiple submits
                thisForm.createPass.disabled = 'disabled';
                thisForm.skip.disabled = 'disabled';
                
                if(thisForm.useLocation.checked) { // get location
                    navigator.geolocation.getCurrentPosition(
                        function useLocationGeo(position) { // location success callback
                            // Add geo data to form fields
                            thisForm.geoTimestamp.value = position.timestamp;
                            thisForm.geoAccuracy.value = position.coords.accuracy;
                            thisForm.geoLatitude.value = position.coords.latitude;
                            thisForm.geoLongitude.value = position.coords.longitude;
                            
                            thisForm.submit();
                        },
                        function geoError(ex) { // location error callback
                            // Add geo error to form field
                            thisForm.geoError = ex;
                            
                            thisForm.submit();
                        }
                    );
                } else { // use zip (or submit empty form)
                    thisForm.submit();
                }
                // enable buttons
                thisForm.createPass.disabled = '';
                thisForm.skip.disabled = '';
            }
        ];
        i<n.length;
        // Add event listeners
        document.getElementById(n[i]).addEventListener(e[i], f[i], false),
        i++
    ){};
}, false);

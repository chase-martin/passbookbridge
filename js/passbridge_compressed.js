var passbridge=function(){function c(a){a.preventDefault()}var a,b=document.querySelector(".spinner"),d=document.querySelector(".passbook");return window.addEventListener("load",function(){b.style.opacity=1;document.querySelector(".passbook").style.display="none";window.addEventListener("touchmove",c,!0);window.setTimeout(function(){document.forms[0].submit()},500);window.webkitRequestAnimationFrame(function(e){void 0!==a&&300<e-a?(Omniture.batch(),window.removeEventListener("touchmove",c,!0),b.addEventListener("webkitTransitionEnd",
function(){this.style.display="none";d.style.display="block";d.style.opacity=1}),b.style.opacity=0):(a=Date.now(),window.webkitRequestAnimationFrame(this))})})}();

// ==UserScript==
// @name       Twitch Player Plus
// @namespace  http://twitch.tv/ehsankia
// @version    0.2
// @description  Various tweaks to the Twitch HTML5 player UI
// @match      http://www.twitch.tv/*
// @match      http://player.twitch.tv/*
// @copyright  2015+, Ehsan Kia
// ==/UserScript==
 
var qualityOptions;
var waitForPlayerReadyTimer = setInterval(function() {
    var html5Player = $('div.player');
    if (html5Player.length > 0) {
        setTimeout(applyFixes, 3000);
        clearInterval(waitForPlayerReadyTimer);
    }
}, 1000);

function applyFixes() {
    // Sticky volume slider
    $('.js-volume-container').css('width', '13em');

    // Move quality options to main bar if available
    qualityOptions = $(".js-quality");
    qualityOptions.insertAfter($('.js-quality-display-contain'));
    qualityOptions.css({
      float: "left",
      margin: "5px",
      color: "white",
      background: "rgba(20, 20, 20, 0.8)",
      border: "1px solid grey",
      boxShadow: "0 0 black",
    });

    // Remove remaining label
    $("span:contains('Video Quality:')").remove();

    // Hide options if there are no transcoders
    setInterval(checkForQualityOptions, 5000);

    // Bind F key to fullscreen
    // document.addEventListener("keypress", function(e){
    //     if(e.which === 102) enterFS($('div.player')[0]);
    // });
}

function checkForQualityOptions() {
  var numQualityOptions = $(".js-quality > option").length;
  if (numQualityOptions > 1) {
    qualityOptions.css('display', 'block');
  } else {
    qualityOptions.css('display', 'none');
  }
}

function enterFS(elem) {
  if (elem.requestFullscreen) {
      elem.requestFullscreen();
  } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
  } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
  }
}

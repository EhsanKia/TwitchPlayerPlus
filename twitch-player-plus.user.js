// ==UserScript==
// @name       Twitch Player Plus
// @namespace  http://twitch.tv/ehsankia
// @version    0.6
// @description  Various tweaks to the Twitch HTML5 player UI
// @match      http://www.twitch.tv/*
// @match      http://player.twitch.tv/*
// @grant      GM_addStyle
// @require    http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @copyright  2015+, Ehsan Kia
// ==/UserScript==

var html5Player;
var qualityOptions;
var waitForPlayerReadyTimer = setInterval(function() {
    html5Player = $('div.player');
    if (html5Player.length > 0) {
        setTimeout(applyFixes, 3000);
        clearInterval(waitForPlayerReadyTimer);
    }
}, 1000);

function applyFixes() {
    // Sticky volume slider
    $('.js-volume-container').css('width', '13em');

    // Move quality options to main bar and style appropriately
    qualityOptions = $(".js-quality");
    qualityOptions.insertAfter($('.js-quality-display-contain'));
    qualityOptions.css({
      float: "left",
      height: "29px",
      margin: "0 6px 0 4px",
      padding: "0",
      color: "white",
      fontWeight: "bold",
      background: "none",
      border: "none",
      boxShadow: "0 0 black",
      appearance: "none",
      "-moz-appearance": "none",
      "-webkit-appearance": "none",
      cursor: "pointer",
    });
    qualityOptions.find("> option").css({
      background: "black",
      padding: "0 5px",
      marginRight: "-15px",
      fontWeight: "normal",
    });
    qualityOptions.mouseover(function() {
        $(this).css("color","#a991d4");
        $(this).find("> option").css({
          color: "white",
        });
    }).mouseout(function() {
        $(this).css("color","white");
    });

    // Remove remaining label
    $("span:contains('Video Quality:')").remove();

    // Hide options if there are no transcoders
    setInterval(checkForQualityOptions, 5000);
    // Remove initially, otherwise there's an empty space for a bit
    checkForQualityOptions()

    // Bind F key to toggle fullscreen
    $('body').keypress(function(e) {
      if (e.which === 102) {
        // fallback to event.target just in case
        var el = document.activeElement || e.target;
        var t  = (el && el.tagName.toLowerCase()) || '';

        // pass through to elements that take keyboard input
        if (/(input|textarea|select)/.test(t)) {
            return true;
        }

        $('.js-control-fullscreen').click();
        return false;
      }
    });
}

function checkForQualityOptions() {
  var numQualityOptions = $(".js-quality > option").length;
  if (numQualityOptions > 1) {
    qualityOptions.css('display', 'block');
  } else {
    qualityOptions.css('display', 'none');
  }
}

GM_addStyle("select:-moz-focusring { outline: none; }");
GM_addStyle(".js-quality:focus { outline: none; }");


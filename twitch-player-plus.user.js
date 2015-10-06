// ==UserScript==
// @name       Twitch Player Plus
// @namespace  http://twitch.tv/ehsankia
// @version    0.9
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
      if (html5Player.attr('data-loading') === "false") {
        setTimeout(applyFixes, 100);
        clearInterval(waitForPlayerReadyTimer);
      }
    }
}, 100);

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
      $(this).find("> option").css("color", "white");
    }).mouseout(function() {
      $(this).css("color","white");
    });

    // Remove remaining label
    $("span:contains('Video Quality:')").remove();

    // Hide options if there are no transcoders
    setInterval(checkForQualityOptions, 5000);
    // Remove initially, otherwise there's an empty space for a bit
    checkForQualityOptions();

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

    // Add latency status under Live icon
    var liveIcon = $('.player-livestatus__online');
    liveIcon.append("<div class='lag-status'></div>");
    $('.lag-status').css({width: "60px", marginLeft: "-20px", textAlign: "center"});
    $('a.js-stats-toggle')[0].click();
    $('.js-playback-stats').attr('data-state', 'off');
    setInterval(updateLatency, 1000);

    // Remove old stats button and add new one
    $('.player-menu__item--stats').css('display', 'none');
    $('.js-control-fullscreen').before(" \
      <button type='button' class='player-button js-custom-stats-toggle'> \
        <span class='player-tip' data-tip='Video Stats'></span> \
        <svg id='icon-stats' viewBox='0 0 1024 1024' style='width: 16px; fill: white; margin: 1px 6px;'> \
          <path d='M960 0h-896c-35.328 0-64 28.672-64 64v640c0 35.328 28.672 64 64 64h256l-128 256h32l230.4-256h115.2l230.4 256h32l-128-256h256c35.328 0 64-28.672 64-64v-640c0-35.328-28.672-64-64-64zM960 672c0 17.696-14.304 32-32 32h-832c-17.696 0-32-14.304-32-32v-576c0-17.696 14.304-32 32-32h832c17.696 0 32 14.304 32 32v576zM668.096 500.192l-144.672-372.128-158.016 297.28-88.192-90.72-149.216 92.992 42.112 24.256 95.616-59.584 115.36 118.784 133.6-251.296 147.712 380.128 125.984-265.216 51.328 109.248 56.288-9.44-107.328-228.224-120.576 253.92z'></path> \
        </svg> \
      </button>");
    $('.js-custom-stats-toggle').mouseover(function() {
      $(this).find('> svg').css("fill","#a991d4");
    }).mouseout(function() {
      $(this).find('> svg').css("fill","white");
    }).click(function(){
      var prev = $('.js-playback-stats').attr('data-state');
      var state = prev === 'off' ? 'on' : 'off';
      $('.js-playback-stats').attr('data-state', state);
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

function updateLatency() {
    var lat = $('.js-stat-hls-latency-broadcaster').text();
    if (lat.length !== 0) {
      $('.lag-status').text(lat + ' sec.');
    }
}

GM_addStyle(".js-quality:focus { outline: none; }");

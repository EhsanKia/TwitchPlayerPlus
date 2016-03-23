// ==UserScript==
// @name       Twitch Player Plus
// @namespace  http://twitch.tv/ehsankia
// @version    1.5
// @description  Various tweaks to the Twitch HTML5 player UI
// @match      https://www.twitch.tv/*
// @match      https://player.twitch.tv/*
// @grant      GM_addStyle
// @grant      GM_getValue
// @grant      GM_setValue
// @require    http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @copyright  2015+, Ehsan Kia
// ==/UserScript==

var backend;
var html5Player;
var waitForPlayerReadyTimer = setInterval(function() {
    html5Player = $('div.player');
    if (html5Player.length > 0) {
      if (html5Player.attr('data-loading') === 'false') {
        html5Player.attr('data-tpp', 'true');
        clearInterval(waitForPlayerReadyTimer);
        registry = App.__container__.lookup('-view-registry:main');
        backend = registry[$('#player>div').attr('id')].get('player');
        setTimeout(applyFixes, 100);
        hostPlayerCheck();
      }
    }
}, 100);

function applyFixes() {

    // Move quality options to main bar
    $(".js-quality").insertAfter($('.js-quality-display-contain'));

    // Remove remaining label
    $("span:contains('Video Quality:')").remove();

    // Hide options if there are no transcoders
    checkForQualityOptions();
    setInterval(checkForQualityOptions, 5000);

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
    setTimeout(updateLatency, 5000);

    // Remove old stats button and add new one
    $('.player-menu__item--stats').css('display', 'none');
    $('.js-control-fullscreen').before(" \
      <button type='button' class='player-button js-custom-stats-toggle'> \
        <span class='player-tip' data-tip='Video Stats'></span> \
        <svg id='icon-stats' viewBox='0 0 1024 1024' style='width: 16px; fill: white; margin: 1px 6px;'> \
          <path d='M960 0h-896c-35.328 0-64 28.672-64 64v640c0 35.328 28.672 64 64 64h256l-128 256h32l230.4-256h115.2l230.4 256h32l-128-256h256c35.328 0 64-28.672 64-64v-640c0-35.328-28.672-64-64-64zM960 672c0 17.696-14.304 32-32 32h-832c-17.696 0-32-14.304-32-32v-576c0-17.696 14.304-32 32-32h832c17.696 0 32 14.304 32 32v576zM668.096 500.192l-144.672-372.128-158.016 297.28-88.192-90.72-149.216 92.992 42.112 24.256 95.616-59.584 115.36 118.784 133.6-251.296 147.712 380.128 125.984-265.216 51.328 109.248 56.288-9.44-107.328-228.224-120.576 253.92z'></path> \
        </svg> \
      </button>");
    $('.js-custom-stats-toggle').click(function(){
      var prev = $('.js-playback-stats').attr('data-state');
      var state = prev === 'on' ? 'off' : 'on';
      $('.js-playback-stats').attr('data-state', state);
    });

    // Check if it's a VOD and there isn't a seek argument in the url
    var vodID = html5Player.attr('data-video');
    var hasSeekParam = document.location.search.search("t=") >= 0;
    if (vodID !== undefined && !hasSeekParam) {
      //seek to previous position and keep track of the position
      var oldTime = GM_getValue("seek_" + vodID);
      if (oldTime !== undefined) {
        backend.setCurrentTime(parseFloat(oldTime));
      }
      setTimeout(function() {
        setInterval(trackSeekTime, 15000);
      }, 5 * 60 * 1000);
    }

    // Setup volume scrolling when in fullscreen or theatre mode
    $("#player").bind('mousewheel DOMMouseScroll', function(event){
      if (!backend.fullscreen && !backend.theatre && !event.shiftKey) return;

      var dir = event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0;
      var delta = dir ? 0.05 : -0.05;

      var flashBackend = $('div#player object')[0];
      var volume = flashBackend.getVolume();
      volume = Math.min(Math.max(volume + delta, 0), 1);
      flashBackend.setVolume(volume);

      event.preventDefault();
      event.stopPropagation();
      return false;
    });

    // Mark that we've fixed the player
    html5Player.attr('data-tpp', 'true');
}

function checkForQualityOptions() {
  var numQualityOptions = $(".js-quality > option").length;
  if (numQualityOptions > 1) {
    $('.js-quality').css('display', 'block');
  } else {
    $('.js-quality').css('display', 'none');
  }
}

function updateLatency() {
  var stats = backend.getStats();
  var lat = stats.hlsLatencyBroadcaster;
  if (lat === undefined || lat.length === 0) {
    setTimeout(updateLatency, 5000);
  } else {
    $('.lag-status').text(lat + ' sec.');
    setTimeout(updateLatency, 1000);
  }
}

function trackSeekTime() {
  var seekTime = backend.getCurrentTime();
  if (seekTime < 5 * 60) return;
  GM_setValue("seek_" + vodID, seekTime);
}

function hostPlayerCheck() {
  setInterval(function() {
      $('div.player').each(function(ind, el){
        var player = $(el);
        if (player.attr('data-tpp') === 'true') return;
        if (player.attr('data-loading') !== 'false') return;

        // Move quality options to main bar
        container = player.find('.js-quality-display-contain');
        player.find(".js-quality").insertAfter(container);

        // Remove remaining label
        player.find("span:contains('Video Quality:')").remove();

        // Mark that we've fixed the player
        player.attr('data-tpp', 'true');
      });
  }, 5000);
}

GM_addStyle(" \
.js-volume-container { width: 13em; } \
select.js-quality:hover { color: #a991d4 !important; } \
select.js-quality, select.js-quality:focus { \
  float: left; \
  height: 29px; \
  margin: 0 6px 0 4px; \
  padding: 0; \
  color: white; \
  font-weight: bold; \
  background: none; \
  border: none; \
  box-shadow: 0 0 black; \
  appearance: none; \
  -moz-appearance: none; \
  -webkit-appearance: none; \
  outline: none; \
  cursor: pointer; \
} \
select.js-quality > option { \
  color: white; \
  background: black; \
  padding: 0 5px; \
  margin-right: -15px; \
  font-weight: bold; \
} \
.lag-status { \
  width: 60px; \
  margin-left: -20px; \
  text-align: center; \
} \
.js-custom-stats-toggle:hover > svg { \
  fill: #a991d4 !important; \
}");

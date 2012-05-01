var mpd_server = "http://rmpd-server.local:9292/";

var pause = function() {
  $.ajax({
    url: mpd_server + 'pause',
    async: true,
    success: function(data) {
      $('li#play').removeClass('pause');
    }
  });
}

var play = function() {
  $.ajax({
    url: mpd_server + "play",
    aync: true,
    success: function(data) {
      $('li#play').addClass('pause');
    }
  });
}

$(document).ready(function() {
  add_control_listeners();
  $.ajax({
    url: mpd_server + 'state',
    async: true,
    success: function(data) {
      if (data == "pause") {
        $('li#play').removeClass('pause');
      }
      else if (data == "play") {
        $('li#play').addClass('pause');
      }
    }
  });
});

function add_control_listeners() {
  $('li#previous').click(function() {
    $.ajax({
      url: mpd_server + 'previous',
      async: true,
      success: function(data) {
        //
      }
    });
  })
  $('li#play').click(function() {
    if (!$(this).hasClass('pause')) {
      play();
    }
    else {
      pause();
    }
  });
  $('li#stop').click(function() {
    $.ajax({
      url: mpd_server + "stop",
      async: true,
      success: function(data) {
        $('li#play').removeClass('pause');
      }
    });
  });
  $('li#next').click(function() {
    $.ajax({
      url: mpd_server + 'next',
      async: true,
      success: function(data) {
        //
      }
    });
  });
  $('ul#repeat_shuffle li.repeat').click(function() {
    $(this).toggleClass('selected');
  });
  $('ul#repeat_shuffle li.shuffle').click(function() {
    $(this).toggleClass('selected');
  });
}
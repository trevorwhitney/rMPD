var mpd_server = "http://localhost:3030/";

var pause = function() {
  $.ajax({
    url: mpd_server + 'player/pause',
    async: true,
    success: function(data) {
      $('li#play').removeClass('pause');
    }
  });
}

var play = function() {
  $.ajax({
    url: mpd_server + "player/play",
    aync: true,
    success: function(data) {
      $('li#play').addClass('pause');
    }
  });
}

function add_control_listeners() {
  $('li#previous').click(function() {
    $.ajax({
      url: mpd_server + 'player/previous',
      async: true,
      dataType: 'json',
      success: function(data) {
        if (!$('li#play').hasClass('pause')) {
          $('li#play').addClass('pause');
        }
        reset_slider();
        update_current_song(data);
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
      url: mpd_server + "player/stop",
      async: true,
      success: function(data) {
        $('li#play').removeClass('pause');
        reset_slider();
      }
    });
  });
  $('li#next').click(function() {
    $.ajax({
      url: mpd_server + 'player/next',
      async: true,
      dataType: 'json',
      success: function(data) {
        if (!$('li#play').hasClass('pause')) {
          $('li#play').addClass('pause');
        }
        reset_slider();
        update_current_song(data);
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

function reset_slider() {
 $('#seek_bar').slider("value", 0);
 $('#seek_time').text("0:00");
}
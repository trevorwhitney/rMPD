var mpd_server = "http://rmpd-server.local/";

$(document).ready(function() {
  add_control_listeners();
});

function add_control_listeners() {
  $('li#play').click(function() {
    $.ajax({
        url: mpd_server + "play",
        aync: true,
        success: function(data) {
          //do something with the data
          $('li#play').toggleClass('pause');
        }
      });
  });
  $('li#stop').click(function() {
    $.ajax({
      url: mpd_server + "stop",
      async: true,
      success: function(data) {
        //process data
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
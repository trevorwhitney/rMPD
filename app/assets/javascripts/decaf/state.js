var mpd_server = "http://mediacenter:3000/";

var timer = new WebSocket("ws://mediacenter:3001/");
timer.onmessage = function(message) {
  message = $.parseJSON(message.data);
  if (message.time != null) {
    print_time(message.time.elapsed, message.time.total);
  }
  if (message.state != null) {
    switch(message.state) {
      case "play":
        $('li#play').addClass('pause');
        break;
      case "pause":
      case "stop":
        $('li#play').removeClass('pause');
        break;
    }
  }
  if (message.new_song != null) {
    $.ajax({
      url: mpd_server + 'current_song',
      dataType: 'json',
      success: function(data) { update_current_song(data) }
    });
  }
};

function print_time(elapsed, total) {
  var minutes = Math.floor(elapsed / 60);
  var seconds = pad2(elapsed % 60);
  var percent = Math.floor((elapsed/total)*100);
  $('#seek_time').text(minutes + ":" + seconds);
}
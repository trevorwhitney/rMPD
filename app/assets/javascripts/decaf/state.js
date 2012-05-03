var mpd_server = "http://rmpd-server.local:4567/";

var state_es = new EventSource(mpd_server + "state");
state_es.onmessage = function(e) { 
  console.log(e.data);
  switch(e.data) {
    case "play":
      $('li#play').addClass('pause');
      break;
    case "pause":
    case "stop":
      $('li#play').removeClass('pause');
      break;
    case "new_song":
      //load the current song
      $.ajax({
        url: mpd_server + 'current_song',
        dataType: 'json',
        success: function(data) { update_current_song(data) }
      });
      break;
  }
};
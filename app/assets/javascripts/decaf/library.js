var track_list = {};

/* Add artists to the UI */
function populate_artists(data) {
  results = $.parseJSON(data);
  var artist_template = $('#artist_template').html();
  $.each(results.artists, function(i, artist) {
    var template_data = {
      artist_name: artist
    }
    $("ul#artist_list").append(
      Mustache.render(artist_template, template_data));
  });
  add_artist_listeners();
}

/* Load all albums belongin to a specific artist */
function load_albums(artist) {
  var album_template = $('script#album_template').html();

  $.ajax({
    url: mpd_server + '/albums',
    async: true,
    type: 'POST',
    data: 'artist=' + escape(artist),
    success: function(data) {
      var albums = $.parseJSON(data);
      $.each(albums, function(i, album) {
        var template_data = {
          album_name: album
        }
        $("table#album_list").append(
          Mustache.render(album_template, template_data));
      });
    },
    complete: function() {
      add_album_listeners();
    }
  });
}

/* Get tracks from the server, given an album */
function load_tracks(album) {
  var track_template = $('#track_template').html();

  $.ajax({
    url: mpd_server + '/tracks',
    async: true,
    type: 'POST',
    data: 'album=' + escape(album),
    success: function(data) {
      // Frist load tracks without numbers
      var tracks = $.parseJSON(data);
      console.log(tracks);
      $.each(tracks.no_track_num, function(i, song) {
        var template_data = {
          track_title: song.title
        }
        $("table#track_list").append(
          Mustache.render(track_template, template_data));
        track_list[song.title] = song;
      })

      // Now load the rest
      $.each(tracks.tracks, function(i, song) {
        var template_data = {
          track_number: song.track,
          track_title: song.title
        }
        $("table#track_list").append(
          Mustache.render(track_template, template_data));
        track_list[song.title] = song;
      });
    },
    complete: function() {
      add_track_listeners();
    }
  });
}

/* BEGIN LISTENERS */
function add_artist_listeners() {
  $('li.artist').click(function() {
    clear_selected('artists');
    clear_albums();
    clear_tracks();
    $(this).toggleClass('selected');
    artist = $(this).text();
    load_albums(artist);
  });
}

function add_album_listeners() {
  $('td.album_name').click(function(e) {
    clear_selected('albums');
    clear_tracks();
    $(this).parent().toggleClass('selected');
    var album = $(this).text();
    var artist = $('li.artist.selected').text();
    load_tracks(album);
    add_track_listeners();
  });

  $('td.album_name').dblclick(function(e) {
    e.preventDefault();
    clear_selection();
    var album = $(e.currentTarget).siblings('.album_name').text();
    add_album_to_playlist(album);
  });

  $('td.add_album').click(function () {
      var album = $(this).siblings('.album_name').text();
      add_album_to_playlist(album);
  });
}

function add_track_listeners() {
  $('tr.track').click(function() {
    clear_selected('tracks');
    $(this).toggleClass('selected');
  });

  $('tr.track').dblclick(function(e) {
    e.preventDefault();
    clear_selection();
    track = $(e.currentTarget).children('.track_title').text();
    add_track_to_playlist(track_list[track]);
  });

  $('td.add_track').click(function(e) {
    track = $(e.currentTarget).siblings('.track_title').text();
    add_track_to_playlist(track_list[track]);
  });
}

/* END LISTENERS */


function clear_menu() {
  $('ul#nav_menu li.current').removeClass('current');
  $('#navigation_content > div').addClass('hidden');
}

function clear_selected(string) {
  if (string == "artists") {
    $('li.artist').removeClass('selected');
  }
  else if (string == "albums") {
    $('tr.album').removeClass('selected');
  }
  else if (string == "tracks") {
    $('tr.track').removeClass('selected');
  }
  else if (string == "playlist") {
    $('tr.playlist_item').removeClass('current');
  }
}

//this removes all entries from the album_list
function clear_albums() {
  $('tr.album').remove();
}

//this removes all entries from the track_list
function clear_tracks() {
  $('tr.track').remove();
}

function clear_selection() {
  var sel;
  if(document.selection && document.selection.empty){
    document.selection.empty() ;
  } else if(window.getSelection) {
    sel=window.getSelection();
    if(sel && sel.removeAllRanges)
      sel.removeAllRanges() ;
  }
}

//FIXME: What if it's the last song? What if I just added a song, or there's
//no songs currently?
function update_current_song(data) {
  $('span#title').text(data.title);
  $('div#album_name span.album_name').text(data.album);
  $('div#artist_name span.artist_name').text(data.artist);
  
  if (current_song == null || data.album != current_song.album) {
    get_album_art(data.artist, data.album);
  }

  clear_selected("playlist");
  var position = playlist.indexOf(data.title);
  $.each($('#playlist td.position:contains('+position+')'), 
    function(i, element) {
      regex = new RegExp("^"+position+"$");
      if (regex.test($(element).text())) {
        $(element).parent('tr').addClass('current');
      }
    }
  );
  var now = new Date().getTime();
  current_song = data;
}

function get_album_art(artist, album, thumbnail) {
  if (typeof artist !== "undefined" || typeof album !== "undefined") {
    $.ajax({
      url: "http://ws.audioscrobbler.com/2.0/",
      type: "POST",
      dataType: "json",
      data: "method=album.getinfo" + 
        "&api_key=c433c18b364aec4369ecb3c151f06f79" + 
        "&artist=" + escape(artist) + "&album=" + escape(album) + 
        "&format=json",
      success: function(data) {
        if (data.error == null) {
          if (data.album.image[2]["#text"].length > 0) {
            image_url = data.album.image[2]["#text"];
            $('div#album_art img').attr("src", image_url);
            if (data.album.image[4]["#text"].length > 0) {
              large_image_url = image_url = data.album.image[4]["#text"];
              $('div#large_album_art img').attr("src", large_image_url);
            }
          }
          else {
            //load empty album
            $('div#album_art img').attr("src", "http://rmpd.local/assets/no_art.png");
          }
        }
      }
    });
  }
}

function pad2(number) {
  return (number < 10 ? '0' : '') + number.toString();
}


function loadPopup() {
  if (popupStatus == 0) {
    $("#popup_content").fadeIn(400);
    popupStatus = 1;
  }
}

function disablePopup() {
  if (popupStatus == 1) {
    $("#popup_content").fadeOut(200);
    popupStatus = 0;
  }
}

function centerPopup(){
  //request data for centering
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var popupHeight = $("#popup_content").height();
  var popupWidth = $("#popup_content").width();
  //centering
  $("#popup_content").css({
    "position": "absolute",
    "top": windowHeight/2 - popupHeight/2,
    "left": windowWidth/2 - popupWidth/2
  });
}
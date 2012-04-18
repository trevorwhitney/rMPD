var artists = [];

$(document).ready(function(){
  $.ajax({
    url:"/library_objects.json",
    async: false,
    success: function(data) {
      load_artists(data);
    },
    complete:function() {
      $('div#loading').addClass('hidden');
      $('div#container').removeClass('hidden');
    }
  });
  print_artists(artists);
  $('li.artist').click(function() {
    clear_selected('artists');
    $(this).toggleClass('selected');
    //current_albums = current_artist.albums;
  });
  $('li.album').click(function() {
    clear_selected('albums');
    $(this).toggleClass('selected');
  });
});

function clear_selected(string) {
  if (string == "artists") {
    $('li.artist').removeClass('selected');
  }
  else if (string == "albums") {
    $('li.album').removeClass('selected');
  }
}


function load_artists(data) {
  $.each(data.artists, function(i, artist){
    var new_artist = { name: artist.name, albums: [] };
    $.each(artist.albums, function(j, album) {
      var new_album = { name: album.name, songs: [] };
      $.each(album.songs, function(k, song) {
        new_album.songs[k] = song;
      });
      new_artist.albums[j] = new_album;
    });
    //console.debug(new_artist);
    artists.push(new_artist);
  });
}

function print_artists(_artists) {
  for (var i = 0; i < _artists.length; i++) {
    artist = _artists[i];
    $("ul#artist_list").append("<li class=\"artist\">" + artist.name + "</li>");
  }
}

function load_albums($albums) {
  for (i = 0; i < $albums.length; i = i + 1) {
    album = $albums[i];
    $("ul#album_list").append("<li class=\"album\">" + album + "</li>");
  }
}


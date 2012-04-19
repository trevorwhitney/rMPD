//library = { artist : }
var library = {};

$(document).ready(function(){
  $.ajax({
    url:"/library_objects.json",
    async: false,
    success: function(data) {
      get_library(data);
    },
    complete:function() {
      $('div#loading').addClass('hidden');
      $('div#container').removeClass('hidden');
    }
  });
  load_artists(library);
  $('ul#artist_list li:first').addClass('selected');
  load_albums("All");
  $('li.artist').click(function() {
    clear_selected('artists');
    clear_albums();
    $(this).toggleClass('selected');
    artist = $(this).text();
    load_albums(artist);
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

function clear_albums() {
  $('li.album').remove();
}

function clear_tracks() {
  $('li.track').remove();
}

function add_albums_listener() {
  $('li.album').click(function() {
    clear_selected('albums');
    clear_tracks();
    $(this).toggleClass('selected');
    album = $(this).text();
    artist = $('li.artist.selected').text();
    console.log("Starting loading tracks for" + artist + " " + album);
    load_tracks(artist, album);
    console.log("Finished loading tracks...")
  });
}


function get_library(data) {
  $.each(data.artists, function(i, artist){
    var album_list = {};
    $.each(artist.albums, function(j, album) {
      album_list[album.name] = album.songs;
    });
    //console.debug(new_artist);
    library[artist.name] = album_list;
  });
}

function load_artists(_library) {
  var artists = [];
  $.each(_library, function(name, albums) {
    artists.push(name);
  });
  artists.sort();
  $.each(artists, function(i, artist) {
    $("ul#artist_list").append("<li class=\"artist\">" + artist + "</li>");
  });
}

function load_albums(artist_string) {
  var _albums = [];
  if (artist_string == "All") {
    $.each(library, function(name, albums) {
      $.each(albums, function(name, songs) {
        _albums.push(name);
      });
    });
  }
  else {
    $albums = library[artist_string];
    $.each($albums, function(name, songs) {
      _albums.push(name);
    });
  }
  _albums.sort();
  $.each(_albums, function(i, album) {
    $("ul#album_list").append("<li class=\"album\">" + album + "</li>");
  });
  add_albums_listener();
}

function load_tracks(artist, album) {
  var tracks = {};
  var _tracks = {};
  var track_nums = [];
  if (artist == "All") {
    $.each(library, function(artist, albums) {
      $.each(albums, function(_album, songs) {
        if (_album == album) {
          $.each(songs, function(i, song) {
            tracks[song.track] = song.title;
            track_nums.push(song.track);
          });
        }
      });
    });
  }
  else {
    var songs = library[artist][album];
    //console.debug(songs);
    //console.debug(songs.length);
    $.each(songs, function(i, song) {
      tracks[song.track] = song.title;
      track_nums.push(song.track);
    });
  }
  track_nums.sort();
  $.each(track_nums, function(i, number) {
    _tracks[number] = tracks[number];
  });
  console.debug(_tracks);

  $.each(_tracks, function(track, title) {
    if(track != 0) {
      $("ul#tracks_list").append("<li class=\"track\">" + track + ": " + title + "</li>");
    }
  });
}


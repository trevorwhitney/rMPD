//library is a hash of artists where library[artist] will return
//a hash of albums by that artist.
//The album hash is indexed by the albums name, and will return
//an array of songs. Each song is a hash, as returned by MPD
//for mor information, see the get_library() function, as well
//as the parsed json file
var library = {};


//wait for the page to load, and then set everything up here
$(document).ready(function(){
  //get the library, which is contained in a cached json file
  //the complete parameter handles the "loading" screen
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

  //laod the artist and album lists, adding the necessary listeners to
  //the artists, and defualting to selecting "All" artists
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

//this builds the whole music library into memory. It takes the data object
//returned by the above ajax call as it's argument. It then parses through this
//object, which is bascially a hash of the library returned by the server.
//The library object is populated with artists, which are each a hash of albums,
//which are each an array of songs. Songs are a hash of attributes.
function get_library(data) {
  $.each(data.artists, function(i, artist){
    var album_list = {};
    $.each(artist.albums, function(j, album) {
      $.each(album.songs, function(k, song) {
        if (song['track'] != null) {
          song['track'] = parseInt(song['track']);
        }
        song['date'] = parseInt(song['date']);
        song['time'] = parseInt(song['time']);
      });
      album_list[album.name] = album.songs;
    });
    //console.debug(new_artist);
    library[artist.name] = album_list;
  });
}

//takes a string as an argument that is either artists, albums, or tracks
//this function clears all currently selected items in the given context
function clear_selected(string) {
  if (string == "artists") {
    $('li.artist').removeClass('selected');
  }
  else if (string == "albums") {
    $('li.album').removeClass('selected');
  }
}

//this removes all entries from the album_list
function clear_albums() {
  $('li.album').remove();
}

//this removes all entries from the track_list
function clear_tracks() {
  $('li.track').remove();
}

//this will add click listeners to each element in the album_list
//this is abstracted to it's own function since the listeners have to be
//re-initialized after every time album_list is cleared
function add_albums_listener() {
  $('li.album').click(function() {
    clear_selected('albums');
    clear_tracks();
    $(this).toggleClass('selected');
    album = $(this).text();
    artist = $('li.artist.selected').text();
    load_tracks(artist, album);
  });
}

//this populates the artist_list from a given library
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

//this populates the album_list with albums that belong to a given artist
//if the artist string is "All", it will add all albums to the list
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

//this populates the track_list with tracks from a given album
//if a specific artist is provided, as opposed to all, it will speed things up
function load_tracks(artist, album) {
  var tracks = {};
  var _tracks = {};
  var track_nums = [];
  if (artist == "All") {
    $.each(library, function(artist, albums) {
      $.each(albums, function(_album, songs) {
        if (_album == album) {
          $.each(songs, function(i, song) {
            if (song.track != null) {
              tracks[song.track] = song.title;
              track_nums.push(parseInt(song.track));
            }
            else {
              tracks["nil"] = [];
              tracks["nil"].push(song.title);
            }
          });
        }
      });
    });
  }
  else {
    var songs = library[artist][album];
    $.each(songs, function(i, song) {
      if (song.track != null) {
        tracks[song.track] = song.title;
        track_nums.push(parseInt(song.track));
      }
      else {
        tracks["nil"] = [];
        tracks["nil"].push(song.title);
      }
    });
  }
  track_nums.sort();
  $.each(track_nums, function(i, number) {
    _tracks[number] = tracks[number];
  });
  if (tracks["nil"] != null) {
    tracks["nil"].sort();
    $.each(tracks["nil"], function(i, title) {
      $("ul#tracks_list").append("<li class=\"track\">" + title + "</li>");
    })
  }
  $.each(_tracks, function(track, title) {
    if(track != 0) {
      $("ul#tracks_list").append("<li class=\"track\">" + track + ": " + title + "</li>");
    }
  });
}


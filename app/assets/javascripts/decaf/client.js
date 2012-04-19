//library is a hash of artists where library[artist] will return
//a hash of albums by that artist.
//The album hash is indexed by the albums name, and will return
//an array of songs. Each song is a hash, as returned by MPD
//for mor information, see the get_library() function, as well
//as the library.json file
var library = {};


//wait for the page to load, and then set everything up here
$(document).ready(function(){
  //get the library, which is contained in a cached json file
  //the complete parameter handles the "loading" screen
  $.ajax({
    url:"/library.json",
    async: false,
    beforeSend: function(xhr) {
      $('div#container').hide();
      $('div#loading').show();
    },
    success: function(data) {
      get_library(data);
    },
    complete: function() {
      //laod the artist and album lists defualting to selecting "All" artists
      //before showing the library
      load_artists(library);
      $('ul#artist_list li:first').addClass('selected');
      load_albums("All");
      $('div#loading').hide();
      $('div#container').show();
    }
  });

  //add listeners to artists
  $('li.artist').click(function() {
    clear_selected('artists');
    clear_albums();
    clear_tracks();
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
    $('tr.album').removeClass('selected');
  }
  else if (string == "tracks") {
    $('tr.track').removeClass('selected');
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

//this will add click listeners to each element in the album_list
//this is abstracted to it's own function since the listeners have to be
//re-initialized after every time album_list is cleared
function add_album_listeners() {
  $('td.album_name').click(function(e) {
    clear_selected('albums');
    clear_tracks();
    $(this).parent().toggleClass('selected');
    album = $(this).text();
    artist = $('li.artist.selected').text();
    load_tracks(artist, album);
    add_track_listeners();
  });
}

function add_track_listeners() {
  $('td.track').click(function() {
    clear_selected('tracks');
    $(this).parent().toggleClass('selected');
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
        if ($.inArray(name, _albums) == -1) {
          _albums.push(name);
        }
      });
    });
  }
  else {
    $albums = library[artist_string];
    $.each($albums, function(name, songs) {
      if ($.inArray(name, _albums) == -1) {
        _albums.push(name);
      }
    });
  }
  _albums.sort();
  $.each(_albums, function(i, album) {
    $("table#album_list").append("<tr class=\"album\">" + 
      "<td class=\"album_name\">" + album + "</td>" +
      "<td class=\"add_album\" title=\"add album to playlist\">" + 
      "&nbsp;</td></tr>");
  });
  add_album_listeners();
}

//this populates the track_list with tracks from a given album
//if a specific artist is provided, as opposed to all, it will speed things up
function load_tracks(artist, album) {
  var tracks = {};
  var _tracks = {};
  var track_nums = [];

  //if the artist is "All", need to do things the long way
  if (artist == "All") {
    $.each(library, function(artist, albums) {
      $.each(albums, function(_album, songs) {
        if (_album == album) {
          $.each(songs, function(i, song) {
            
            //conditional to handle the case of songs without a track number
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

  //a specific artist was provided, excellent! We can skip a few loops and
  //dig straight down to the album
  else {
    var songs = library[artist][album];
    $.each(songs, function(i, song) {
      
      //again, conditional for blank track case
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

  //put the tracks in order based on track number
  track_nums.sort();
  $.each(track_nums, function(i, number) {
    _tracks[number] = tracks[number];
  });

  //if we had blank track numbers, we'll print out those tracks here
  if (tracks["nil"] != null) {
    tracks["nil"].sort();
    $.each(tracks["nil"], function(i, title) {
      $("table#track_list").append("<tr class=\"track\">" +
        "<td class=\"track_number\"></td>" + 
        "<td class=\"track_name\">" + title + "</td>" +
        "<td class=\"add_track\" title=\"add track to playlist\">" +
        "&nbsp;</td></tr>");
    });
  }

  //print all the other tracks with track numbers, now nice and sorted
  $.each(_tracks, function(track, title) {
    if(track != 0) {
      $("table#track_list").append("<tr class=\"track\">" +
        "<td class=\"track_number\">" + track + "</td>" + 
        "<td class=\"track_name\">" + title + "</td>" +
        "<td class=\"add_track\" title=\"add track to playlist\">" +
        "&nbsp;</td></tr>");
    }
  });
}


//library is a hash of artists where library[artist] will return
//a hash of albums by that artist.
//The album hash is indexed by the albums name, and will return
//an array of songs. Each song is a hash, as returned by MPD
//for mor information, see the get_library() function, as well
//as the library.json file
var library = {};
var track_list = {};
var mpd_server = "http://rmpd-server.local:9292/";


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
      $('div#loading').hide();
      $('div#container').show();
    }
  });

  //load the current playlist
  $.ajax({
    url: mpd_server + 'playlist',
    aync: true,
    success: function(data) {
      $.each(data, function(i, track) {
        populate_local_playlist(track);
      });
      adjust_playlist_widths;
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

  //add listeners to navigation
  $('li#search_button').click(function() {
    if (!$(this).hasClass('current')) {
      clear_menu();
      $('#navigation_content #search_content').show();
      $(this).addClass('current');
    }
  });
  $('li#library_button').click(function() {
    if (!$(this).hasClass('current')) {
      clear_menu();
      $('#navigation_content #library_content').show();
      $(this).addClass('current');
    }
  });
  $('li#filesystem_button').click(function() {
    if (!$(this).hasClass('current')) {
      clear_menu();
      $('#navigation_content #filesystem_content').show();
      $(this).addClass('current');
    }
  });
  $('li#playlist_button').click(function() {
    if (!$(this).hasClass('current')) {
      clear_menu();
      $('#navigation_content #playlist_content').show();
      $(this).addClass('current');
    }
  })

  //a few more listeners
  $('#clear_playlist').click(clear_playlist);

  $('li#library_button').addClass('current');

  set_height();
  set_song_info_width();
  set_playlist_width();
  $(window).resize(function() {
    set_height();
    set_song_info_width();
    set_playlist_width();
  });

  $('table#playlist_table_header').colResizable({
    liveDrag: false,
    headerOnly: true,
    onResize: adjust_playlist_widths
  });
});

function clear_menu() {
  $('ul#nav_menu li.current').removeClass('current');
  $('#navigation_content > div').hide();
}

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

var clear_playlist = function() {
  $.ajax({
    url: mpd_server + 'clear',
    async: true,
    success: function(data) {
      $('tr.playlist_item').remove();
    }
  });
}

//this will add click listeners to each element in the album_list
//this is abstracted to it's own function since the listeners have to be
//re-initialized after every time album_list is cleared
function add_album_listeners() {
  $('td.album_name').click(function(e) {
    clear_selected('albums');
    clear_tracks();
    $(this).parent().toggleClass('selected');
    var album = $(this).text();
    var artist = $('li.artist.selected').text();
    track_list = load_tracks(artist, album);
    add_track_listeners();
  });

  $('td.album_name').dblclick(function(e) {
    e.preventDefault();
    clear_selection();
    var album = $(e.currentTarget).siblings('.album_name').text();
    var artist = $('li.artist.selected').text();
    add_album_to_playlist(artist, album, 
      $(e.currentTarget).parent().hasClass('selected'));
  });

  $('td.add_album').click(function () {
      var album = $(this).siblings('.album_name').text();
      var artist = $('li.artist.selected').text();
      add_album_to_playlist(artist, album, 
        $(this).parent().hasClass('selected'));
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

//this populates the artist_list from a given library
function load_artists(_library) {
  var artists = [];
  var artist_template = $('#artist_template').html();
  $.each(_library, function(name, albums) {
    if (name.length > 0 ) {
      artists.push(name);
    }
  });
  artists.sort();
  $.each(artists, function(i, artist) {
    var template_data = {
      artist_name: artist
    }
    $("ul#artist_list").append(
      Mustache.render(artist_template, template_data));
  });
}

//this populates the album_list with albums that belong to a given artist
//if the artist string is "All", it will add all albums to the list
function load_albums(artist_string) {
  var _albums = [];
  var album_template = $('script#album_template').html();
  $albums = library[artist_string];
  $.each($albums, function(name, songs) {
    if ($.inArray(name, _albums) == -1) {
      _albums.push(name);
    }
  });
  _albums.sort();
  $.each(_albums, function(i, album) {
    var template_data = {
      album_name: album
    }
    $("table#album_list").append(
      Mustache.render(album_template, template_data));
  });
  add_album_listeners();
}

//this populates the track_list with tracks from a given album
//if a specific artist is provided, as opposed to all, it will speed things up
function load_tracks(artist, album) {
  var tracks = {};
  var _tracks = {};
  var track_nums = [];
  var track_template = $('#track_template').html();
  var track_list = {};

  tracks["nil"] = []; //in case of null or 0 for track number

  var songs = library[artist][album];
  $.each(songs, function(i, song) {
    
    //again, conditional for blank or 0 track case
    if (song.track != null && parseInt(song.track) > 0) {
      tracks[song.track] = song.title;
      track_nums.push(parseInt(song.track));
    }
    else {
      tracks["nil"].push(song.title);
    }
    track_list[song.title] = song;
  });

  //put the tracks in order based on track number
  track_nums.sort();
  $.each(track_nums, function(i, number) {
    _tracks[number] = tracks[number];
  });

  //if we had blank track numbers, we'll print out those tracks here
  if (tracks["nil"] != null) {
    tracks["nil"].sort();
    $.each(tracks["nil"], function(i, title) {
      var template_data = {
        track_title: title
      }
      $("table#track_list").append(
        Mustache.render(track_template, template_data));
    });
  }

  //print all the other tracks with track numbers, now nice and sorted
  $.each(_tracks, function(track, title) {
    var template_data = {
      track_number: track,
      track_title: title
    }
    $("table#track_list").append(
      Mustache.render(track_template, template_data));
  });

  return track_list;
}

function add_album_to_playlist(artist, album, selected) {
  var tracks = {};
  var _tracks = {};
  var track_nums = [];
  var tracks_to_add = [];


  //if album is currently selected, the track list is already loaded
  if (selected) {
    tracks_to_add = track_list;
  }
  else {
    var tracks = library[artist][album];
    $.each(tracks, function(i, track) {
      tracks_to_add.push(track);
    });
  }
  $.each(tracks_to_add, function(i, track) {
    add_track_to_playlist(track);
  });
}

function add_track_to_playlist(track) {
  $.ajax({
    url: mpd_server + "add",
    aync: true,
    data: 'filename=' + track.file,
    type: "POST",
    success: function(data) {
      populate_local_playlist(track);
      adjust_playlist_widths();
    }
  });
}

function populate_local_playlist(track) {
  var playlist_item_template = $('script#playlist_item_template').html();
  var template_data = {
    track_number: track.track,
    title: track.title,
    artist: track.artist,
    album: track.album,
    time: track.time,
    file: track.file
  }
  $("table#playlist_table").append(
    Mustache.render(playlist_item_template, template_data));
  $('table#playlist_table').colResizable({
    disable: true
  });
}

function set_song_info_width() {
  var parent_width = $('div#song_info').parent().width();
  var song_info_width = parent_width - 230;
  $('div#song_info').width(song_info_width);
}

function set_playlist_width() {
  var playlist_width = $('table#playlist_table').width();
  $('table#playlist_table_header').width(playlist_width);
  adjust_playlist_header_widths();
}

var adjust_playlist_header_widths = function() {
  var row = $('table#playlist_table').find('tr').first();
  var track, title, artist, album, time, file;
  track = row.children('.track').width();
  title = row.children('.title').width();
  artist = row.children('.artist').width();
  album = row.children('.album').width();
  time = row.children('.time').width();
  file = row.children('.file').width();

  $("table#playlist_table_header .track").width(track);
  $("table#playlist_table_header .title").width(title);
  $("table#playlist_table_header .artist").width(artist);
  $("table#playlist_table_header .album").width(album);
  $("table#playlist_table_header .time").width(time);
  $("table#playlist_table_header .file").width(file);
}

var adjust_playlist_widths = function() {
  var row = $('table#playlist_table_header').find('tr').first();
  var track = $(row).children('.track').width();
  var title = $(row).children('.title').width();
  var artist = $(row).children('.artist').width();
  var album = $(row).children('.album').width();
  var time = $(row).children('.time').width();
  var file = $(row).children('.file').width();

  var rows = $("table#playlist_table").children('tr');
  for (var i = 0; i < rows.length; i ++) {
    row = rows[i];
    $(row).children('.track').width(track);
    $(row).children('.title').width(title);
    $(row).children('.artist').width(artist);
    $(row).children('.album').width(album);
    $(row).children('.time').width(time);
    $(row).children('.file').width(file);
  }
}

function set_height() {
  window_height = $(window).height();
  height = window_height - 20;
  $('#container').height(height);
  inner_height = (height - 170 ) / 2;
  $('#navigation').height(inner_height)
  $('#navigation_content').height(inner_height - 27);
  $('#playlist').height(inner_height - 26);
}

function clear_selection() {
  var sel ;
  if(document.selection && document.selection.empty){
    document.selection.empty() ;
  } else if(window.getSelection) {
    sel=window.getSelection();
    if(sel && sel.removeAllRanges)
      sel.removeAllRanges() ;
  }
}

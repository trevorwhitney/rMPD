var library;
var _artists = new Array();
var _albums = new Array();
var _songs = new Array();

$.getJSON('/library.json', function(data) {
  library = data;
});

$(document).ready(function(){
  get_artists();
  print_artists();
  get_albums();
  print_albums();
  $('li.artist').click(function() {
    $(this).toggleClass('selected');
  });
});


function get_artists() {
  $.each(library.artists, function(i, artist){
    _artists[i] = artist;
  });
  _artists.sort();
}

function get_albums() {
  $.each(library.albums, function(i, album){
    _albums[i] = album;
  });
  _albums.sort();
}

function print_artists() {
  for (i = 0; i < _artists.length; i = i + 1) {
    artist = _artists[i];
    $("ul#artist_list").append("<li class=\"artist\">" + artist + "</li>");
  }
}

function print_albums() {
  for (i = 0; i < _albums.length; i = i + 1) {
    album = _albums[i];
    $("ul#album_list").append("<li class=\"album\">" + album + "</li>");
  }
}


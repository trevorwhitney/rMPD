var playlist = [];

/* This file contains functions relating to playlist funcationality.
* For example:
*   -Adding items to the playlist
*   -Clearing the playlist
*   -Removing items from the playlist
*   -Adjusting the display of the playlist
*/

/* Populate the playlist */
function populate_local_playlist(track, position) {
  var playlist_item_template = $('script#playlist_item_template').html();
  var minutes = Math.floor(parseInt(track.time) / 60);
  var seconds = parseInt(track.time) - (minutes * 60);
  var template_data = {
    track_number: track.track,
    title: track.title,
    artist: track.artist,
    album: track.album,
    time: minutes.toString() + ":" + pad2(seconds),
    file: track.file,
    position: position
  }
  $("table#playlist_table").append(
    Mustache.render(playlist_item_template, template_data));
  $('table#playlist_table').colResizable({
    disable: true
  });

  //append to playlist array, need to know id
  playlist[position] = track.title;
}

function refresh_playlist() {
  playlist = [];
  $('tr.playlist_item').remove();
  reset_slider();
  $('li#play').removeClass('pause');

  $.ajax({
    url: mpd_server + 'playlist',
    async: true,
    dataType: 'json',
    success: function(data) {
      $.each(data, function(i, track) {
        populate_local_playlist(track, i);
      });
    },
    complete: function() {
      adjust_playlist_widths;
      add_playlist_listeners();
    }
  });
}

/* Add items to playlist */

function add_album_to_playlist(album) {
  $.ajax({
    url: mpd_server + '/playlist/add/album',
    async: true,
    type: 'POST',
    data: 'album=' + album,
    dataType: 'json',
    success: function(data) {
      var position = playlist.length - 1;
      $.each(data, function(i, track) {
        populate_local_playlist(track, (position + i));
      })
    }
  })
}

/*function add_track_to_playlist(track) {
  $.ajax({
    url: mpd_server + "add",
    aync: true,
    data: 'filename=' + track.file,
    dataType: 'json',
    type: "POST",
    success: function(data) {
      populate_local_playlist(data, position);
      adjust_playlist_widths();
      add_playlist_listeners();
    }
  });
}*/


function add_playlist_listeners() {
  $('tr.playlist_item').dblclick(function(e) {
    e.preventDefault();
    clear_selection();
    var position = parseInt($(e.currentTarget).children('.position').text());
    $.ajax({
      url: mpd_server + 'play',
      type: 'POST',
      data: 'position=' + position,
      dataType: 'json',
      success: function(data) {
        $('li#play').addClass('pause');
        update_current_song(data);
      }
    });
  });
}

var clear_playlist = function() {
  $.ajax({
    url: mpd_server + 'clear',
    async: true,
    success: function(data) {
      $('tr.playlist_item').remove();
      reset_slider();
      $('li#play').removeClass('pause');
    }
  });
}

/* Adjust playlist appearance */

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
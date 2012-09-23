/*

function set_search_result_widths() {
  var search_results_width = $('table#search_results_table').width();
  $('table#search_results_table_header').width(search_results_width);
  adjust_search_result_header_widths();
}


var adjust_search_result_header_widths = function() {
  var row = $('table#search_results_table').find('tr').first();
  var track, title, artist, album, time, file;
  track = row.children('.track').width();
  title = row.children('.title').width();
  artist = row.children('.artist').width();
  album = row.children('.album').width();
  time = row.children('.time').width();
  file = row.children('.file').width();

  $("table#search_results_table_header .track").width(track);
  $("table#search_results_table_header .title").width(title);
  $("table#search_results_table_header .artist").width(artist);
  $("table#search_results_table_header .album").width(album);
  $("table#search_results_table_header .time").width(time);
  $("table#search_results_table_header .file").width(file);
}

var adjust_search_result_widths = function() {
  var row = $('table#search_results_table_header').find('tr').first();
  var track = $(row).children('.track').width();
  var title = $(row).children('.title').width();
  var artist = $(row).children('.artist').width();
  var album = $(row).children('.album').width();
  var time = $(row).children('.time').width();
  var file = $(row).children('.file').width();

  var rows = $("table#search_results_table").children('tr');
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
*/
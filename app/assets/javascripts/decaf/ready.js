//wait for the page to load, and then set everything up here
$(document).ready(function(){
  //Load the first page of artists
  $.ajax({
    url: mpd_server + 'library/artists',
    async: false,
    type: 'GET',
    data: 'page=' + artist_page,
    dataType: 'json',
    beforeSend: function(xhr) {
      $('div#client').hide();
      $('div#loading').show();
    },
    success: function(data) {
      populate_artists(data);
    },
    complete: function() {
      $('div#loading').hide();
      $('div#client').show();
    }
  });

  //set up interface
  add_control_listeners();
  $.ajax({
    url: mpd_server + 'current_state',
    async: true,
    success: function(data) {
      pause_regex = new RegExp("pause");
      play_regex = new RegExp("play");
      if (pause_regex.test(data)) {
        $('li#play').removeClass('pause');
      }
      else if (play_regex.test(data)) {
        $('li#play').addClass('pause');
      }
    }
  });

  //load the current playlist
  refresh_playlist();

  //load the current song
  $.ajax({
    url: mpd_server + 'current_song',
    dataType: 'json',
    success: function(data) { 
      if (!data.no_song)
        update_current_song(data);
    }
  });

  //add listeners to navigation
  $('li#search_button').click(function() {
    if (!$(this).hasClass('current')) {
      clear_menu();
      console.log($('#navigation_content #search_content'));
      $('#navigation_content #search_content').removeClass('hidden');
      $(this).addClass('current');
    }
  });
  $('li#library_button').click(function() {
    if (!$(this).hasClass('current')) {
      clear_menu();
      $('#navigation_content #library_content').removeClass('hidden');
      $(this).addClass('current');
    }
  });
  $('li#filesystem_button').click(function() {
    if (!$(this).hasClass('current')) {
      clear_menu();
      $('#navigation_content #filesystem_content').removeClass('hidden');
      $(this).addClass('current');
    }
  });
  $('li#playlist_button').click(function() {
    if (!$(this).hasClass('current')) {
      clear_menu();
      $('#navigation_content #playlist_content').removeClass('hidden');
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

  //add listeners to album art for displaying popup
  //display popip
  $('#album_art').click(function(e) {
    get_album_art(current_song.artist, current_song.album);
    centerPopup();
    loadPopup();
  });
  //close popup
  //Click the x event!
  $("#popup_content_close").click(function(){
    disablePopup();
  });
  //Press Escape event!
  $(document).keypress(function(e){
  if(e.keyCode==27 && popupStatus==1){
    disablePopup();
  }
  });

  $('#seek_bar').slider({
    min: 0,
    max: 100,
    step: 1,
    range: 'min',
    animate: true,
    stop: function(event, ui) {
      //seek to selected position in the song
      $.ajax({
        url: mpd_server + 'seek',
        type: 'POST',
        dataType: 'json',
        data: "percent=" + ui.value,
        success: function(data) {
          print_time(data.elapsed, data.total);
        }
      })
    }
  });
});
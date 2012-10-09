$(document).ready ->
  
  #Load first page of artists
  $.ajax
    url: mpd_server + 'library/artists'
    async: false
    type: 'GET'
    data: 'page=' + artist_page
    dataType: 'json'
    beforeSend: (xhr)->
      $('div#client').hide()
      $('div#loading').show()
    success: (data)->
      populate_artists(data)
    complete: ->
      $('div#loading').hide()
      $('div#client').show()

  #Set up listeners on the interface
  add_control_listeners()

  #Get MPD's state to put interface in the right state
  $.ajax
    url: mpd_server + 'player/state'
    async: true
    success: (data)->
      pause_regex = new RegExp("pause")
      play_regex = new RegExp("play")
      if pause_regex.test(data)
        $('li#play').removeClass('pause')
        player.play()
      else if play_regex.test(data)
        $('li#play').addClass('pause')
        player.stop()

  #Need to load the playlist, which refresh already does
  refresh_playlist()
  get_current_song()

  #Add listeners to the interface
  add_perspective_listeners()
  $('#clear_playlist').click -> clear_playlist()

  #Default view is Library
  $('li#library_button').addClass('current')

  #Set dynamic size of interface
  set_height()
  set_song_info_width()
  set_playlist_width()
  #set_search_result_widths()
  $(window).resize ->
    set_height()
    set_song_info_width()
    set_playlist_width()

  #Setup the column resizing magic
  $('table#search').colResizable
    liveDrag: false
    headerOnly: true
    onResize: adjust_search_result_widths()
  $('table#playlist_table_header').colResizable
    liveDrag: false
    headerOnly: true
    onResize: adjust_playlist_widths()

  #FIXME: Make these methods and variables conform to Ruby style 
  #used elsewhere
  #Album art listeners for displaying & closing larger size art pop-up
  $('#album_art').click ->
    get_album_art(current_song.artist, current_song.album)
    center_popup();
    display_popup();
  $('#popup_content_close').click ->
    hide_popup();
  $(document).keypress (e)->
    if e.keyCode == 27 and popupStatus == 1
      hide_popup()

  #jQuery UI for the song position slider
  $('seek_bar').slider
    min: 0
    max: 100
    step: 1
    range: 'min'
    animate: true
    stop: (event, ui)->
      #This will seek to the requested position in song
      $.ajax
        url: mpd_server + 'player/seek'
        type: 'POST'
        dataType: 'json'
        data: "percent=" + ui.value
        success: (data)->
          print_time(data.elapsed, data.total)

  
add_perspective_listeners = ->
  $('li#search_button').click ->
    if not $(this).hasClass('current')
      toggle_perspective('#search_content')
  $('li#library_button').click ->
    if not $(this).hasClass('current')
      toggle_perspective('#library_content')
  $('li#filesystem_button').click ->
    if not $(this).hasClass('current')
      toggle_perspective('#filesystem_content')
  $('li#playlist_button').click ->
    if not $(this).hasClass('current')
      toggle_perspective('#playlist_content')


toggle_perspective = (perspective_id, perspective_button) ->
  clear_menu()
  $("#navigation_content #{perspective_id}").removeClass('hidden')
  $(perspective_button).addClass('current')



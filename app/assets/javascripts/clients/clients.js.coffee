mpd_server = "http://localhost:3030/"

pause = ->
  $.ajax
    url: mpd_server + 'player/pause'
    async: true
    success: (data)->
      player.stop()
      $('li#play').removeClass("pause")


play = ->
  $.ajax
    url: mpd_server + 'player/play'
    async: true
    success: (data)->
      player.play()
      $('li#play').addClass('pause')


add_control_listeners = ->
  $('li#previous').click ->
    $.ajax
      url: mpd_server + 'player/previous'
      async: true
      dataType: 'json'
      success: (data)->
        if not $('li#play').hasClass('pause')
          $('li#play').addClass('pause')
        reset_slider()
        player.reset()
        update_current_song(data)
  
  $('li#play').click ->
    if not $(this).hasClass('pause')
      play()
      player.play()
    else
      pause()
      player.stop()

  $('li#stop').click ->
    $.ajax
      url: mpd_server + 'player/stop'
      async: true
      success: (data)->
        $('li#play').removeClass('pause')
        reset_slider()
        player.stop()

  $('li#next').click ->
    $.ajax
      url: mpd_server + 'player/next'
      async: true
      dataType: 'json'
      success: (data)->
        if not $('li#play').hasClass('pause')
          $('li#play').addClass('pause')
        reset_slider()
        player.reset()
        update_current_song(data)

  $('ul#repeat_shufflie li.repeat').click ->
    $(this).toggleClass('selected')
  $('ul#repeat_shuffle li.shuffle').click ->
    $(this).toggleClass('selected')


reset_slider = ->
  $('#seek_bar').slider("value", 0)
  $('#seek_time').text("0:00")get_artists = (page)->
  $.ajax
    url: mpd_server + 'library/artists'
    async: true
    type: 'GET'
    data: 'page=' + page
    dataType: 'json'
    success: (data)->
      populate_artists(data)

#Add artists to the UI
populate_artists = (data)->
  artist_template = $('#artist_template').html()
  if not data.last_page
    for index, artist in data.artists
      template_data = artist_name: artist
      $('ul#artist_list').append(
        Mustache.render(artist_template, template_data))
    update_artist_waypoint()
    add_artist_listeners()

update_artist_waypoint = ->
  $('ul#artist_list').waypoint(
    (event, direction)->
      if direction == "down"
        artist_page += 1
        get_artists(artist_page)
    context: $('div#artists')
    triggerOnce: true
    offset: 'bottom-in-view')

load_albums = (artist)->
  album_template = $('script#album_template').html()
  $ajax
    url: mpd_server + 'library/albums'
    aync: true
    type: 'POST'
    data: 'artist=' + escape(artist)
    dataType: 'json'
    success: (data)->
      for index, album in data
        template_data = album_name: album
        $('table#album_list').append(
          Mustache.render(album_template, template_data))
    complete: ->
      add_album_listeners()

#FIXME: Tracks should be stored in track_list[] by filename,
#not by title, to prevent conflicts if two tracks have the
#same name
load_tracks = (album)->
  track_template = $('#track_template').html()
  $.ajax
    url: mpd_server + 'library/album'
    async: true
    type: 'GET'
    data: 'album=' + escape(album)
    dataType: 'json'
    success: (data)->
      for index, track in tracks.numberless
        template_data = track_title: track.title
        $("table#track_list").append(
          Mustache.render(track_template, template_data))
        track_list[track.title] = track
      for index, track in tracks.tracks
        template_data =
          track_number: track.track
          track_title: track.title
        $('table#track_list').append(
          Mustache.render(track_template, template_data))
        track_list[track.title] = track;
    complete: ->
      add_track_listeners()

add_artist_listeners = ->
  $('li.artist').click ->
    clear_selected('artists')
    clear_albums()
    clear_tracks()
    $(this).toggleClass('selected')
    load_albums($(this).text())

add_album_listeners = ->
  $('td.album_name').click ->
    clear_selected('albums')
    clear_tracks()
    $(this).parent().toggleClass('selected')
    load_tracks($(this).text())
  $('td.album_name').dblclick (e)->
    e.preventDefault()
    clear_selection()
    add_album_to_playlist(
      $(e.currentTarget).siblings('.album_name').text())
  $('td.add_album').click ->
    add_album_to_playlist($(this).siblings('.album_name').text())

add_track_listeners = ->
  $('tr.track').click ->
    clear_selected('tracks')
    $(this).toggleClass('selected')
  $('tr.track').dblclick (e)->
    e.preventDefault()
    clear_selection()
    track = $(e.currentTarget).children('.track_title').text()
    add_track_to_playlist(track_list[track])
  $('td.add_track').click ->
    track = $(e.currentTarget).siblings('.track_title').text()
    add_track_to_playlist(track_list[track])

clear_menu = ->
  $('ul#nav_menu li.current').removeClass('current')
  $('#navigation_content > div').addClass('hidden')

clear_selected = (string)->
  if string == "artists"
    $('li.artist').removeClass('selected')
  else if string == "albums"
    $('tr.album').removeClass('selected')
  else if string == "tracks"
    $('tr.track').removeClass('selected')
  else if string == "playlist"
    $('tr.playlist_item').removeClass('current')

clear_albums = ->
  $('tr.album').remove()

clear_tracks = ->
  $('tr.track').remove()

clear_selection = ->
  if document.selection and document.selection.empty
    document.selection.empty()
  else if window.getSelection
    sel = window.getSelection()
    if sel and sel.removeAllRanges
      sel.removeAllRanges()

update_current_song = (data)->
  $('span#title').text(data.title)
  $('div#album_name span.album_name').text(data.album)
  $('div#artist_name span.artist_name').text(data.artist)
  if current_song == nill or data.album != current_song.album
    get_album_art(data.artist, data.album)
  clear_selected("playlist")
  position = data.position
  track_positions = $('#playlist td.position:contains(' + position + ')')
  for index, pos in track_positions
    regex = new RegExp("^" + position + "$")
    if regex.test($(pos).text())
      $(pos).parent('tr').addClass('current')
  current_song = data

get_album_art = (artist, album)->
  if typeof artist isnt "undefined" or typeof album isnt "undefined"
    $.ajax
      url: 'http://ws.audioscrobbler.com/2.0/'
      type: 'POST'
      dataType: 'json'
      data: "method=album.getinfo" + 
        "&api_key=c433c18b364aec4369ecb3c151f06f79" + 
        "&artist=" + escape(artist) + "&album=" + escape(album) + 
        "&format=json"
      success: (data)->
        if data.error == null
          if data.album.image[2]["#text"].length > 0
            image_url = data.album.image[2]["#text"]
            $('div#album_art img').attr("src", image_url)
            if data.album.image[4]["#text"].length > 0
              large_image_url = image_url = data.album.image[4]["#text"]
              $('div#large_album_art img').attr("src", large_image_url)
          else
            #load empty album
            $('div#album_art img').attr(
              "src", "http://rmpd.local/assets/no_art.png")

pad2 = (number)->
  (number < 10 ? '0' : '') + number.toString()

display_popup = ->
  if popup_status == 0
    $("#popup_content").fadeIn(400)
    popup_status = 1

hide_popup = ->
  if popup_status == 1
    $('#popup_content').fadeOut(200)
    popup_status = 0

center_popup = ->
  #Dimesnions to figure out center
  windowWidth = document.documentElement.clientWidth
  windowHeight = document.documentElement.clientHeight
  popupHeight = $("#popup_content").height()
  popupWidth = $("#popup_content").width()
  $("#popup_content").css
    "position": "absolute"
    "top": windowHeight/2 - popupHeight/2
    "left": windowWidth/2 - popupWidth/2# #player = new LocalPlayback()

# #LocalPlayback =
#   #playback = document.getElementById("audio_player")

#   play = ->
#     playback.volume(1)
#     playback.play()

#   stop = ->
#     playback.stop()

#   source = (source)->
#     playback.src(source)

#   reset = ->
#     playback.stop()
#     playback.play()
#=Playlist
#
#This file contains fuctions relating to manipulation of the playlist
# *Adding items (album or artist) to the playlist
# *Clearing the playlist
# *Removing items from the playlist
# *Adjusting the display of the playlist

playlist = []

populate_local_playlist = (track, position)->
  playlist_item_template = $('script#playlist_item_template').html()
  minutes = Math.floor(parseInt(track.time) / 60)
  seconds = parseInt(track.time) - (minutes * 60)
  template_data = 
    track_number: track.track
    title: track.title
    artist: track.artist
    album: track.album
    time: "#{minutes.toString()}:#{pad2(seconds)}"
    file: track.file
    position: position

  $('table#playlist_table').append(
    Mustache.render(playlist_item_template, template_data))
  $('table#playlist_table').colResizable(disable: true)

  playlist[position] = track.title

refresh_playlist = ->
  playlist = []
  $('tr.playlist_item').remove()
  reset_slider()
  $('li#play').removeClass('pause')

  $.ajax
    url: mpd_server + 'playlist'
    async: true
    dataType: 'json'
    success: (data)->
      for index,track in data
        populate_local_playlist(track, index)
    complete: ->
      adjust_playlist_widths()
      add_playlist_listeners()

add_album_to_playlist = (album)->
  $.ajax
    url: mpd_server + 'playlist/album'
    async: true
    type: 'POST'
    data: "album=" + escape(album)
    dataType: 'json'
    success: (data)->
      position = 0
      if playlist.length > 0
        position = playlist.length
      for index,track in data
        populate_local_playlist(track, position + index)
    complete: ->
      adjust_playlist_widths()
      add_playlist_listeners()

add_track_to_playlist = (track) ->
  $.ajax
    url: mpd_server + 'playlist/track'
    async: true
    data: 'filename=' + escape(track.file)
    dataType: 'json'
    type: 'POST'
    success: (data)->
      position = 0
      if playlist.length > 0
        position = playlist.length
      populate_local_playlist(data, position)
    complete: ->
      adjust_playlist_width()
      add_playlist_listeners()

add_playlist_listeners = ->
  $('tr.playlist_item').dblclick (e)->
    e.preventDefault()
    clear_selection()
    position = parseInt($(e.currentTarget).children('.position').text())
    $.ajax
      url: mpd_server + 'play'
      type: 'POST'
      data: "position=" + position
      dataType: 'json'
      success: (data)->
        $('li#play').addClass('pause')
        update_current_song(data)
        player.reset()

clear_playlist = ->
  $.ajax
    url: mpd_server + 'playlist/clear'
    aysnc: true
    success: (data)->
      $('tr.playlist_item').remove()
      reset_slider()
      player.stop()
      $('li#play').removeClass('pause')
    complete: ->
      playlist = []

#Functions to dynamically adjust size of interface
set_song_info_width = ->
  parent_width = $('div#song_info').parent().width()
  song_info_width = parent_width - 230
  $('div#song_info').width(song_info_width)

set_playlist_width = ->
  playlist_width = $('table#playlist_table').width()
  $('table#playlist_table_header').width(playlist_width)
  adjust_playlist_header_widths()

adjust_playlist_header_widths = ->
  row = $('table#playlist_table').find('tr').first()
  track = row.children('.track').width()
  title = row.children('.title').width()
  artist = row.children('.artist').width()
  album = row.children('.album').width()
  time = row.children('.time').width()
  file = row.children('.file').width()

  $("table#playlist_table_header .track").width(track)
  $("table#playlist_table_header .title").width(title)
  $("table#playlist_table_header .artist").width(artist)
  $("table#playlist_table_header .album").width(album)
  $("table#playlist_table_header .time").width(time)
  $("table#playlist_table_header .file").width(file)

adjust_playlist_widths = ->
  row = $('table#playlist_table_header').find('tr').first()
  track = $(row).children('.track').width()
  title = $(row).children('.title').width()
  artist = $(row).children('.artist').width()
  album = $(row).children('.album').width()
  time = $(row).children('.time').width()
  file = $(row).children('.file').width()
  rows = $("table#playlist_table").children('tr')
  for row in rows
    (row)->
      $(row).children('.track').width(track)
      $(row).children('.title').width(title)
      $(row).children('.artist').width(artist)
      $(row).children('.album').width(album)
      $(row).children('.time').width(time)
      $(row).children('.file').width(file)

set_height = ->
  window_height = $(window).height()
  height = window_height - 20
  $('#container').height(height)
  inner_height = (height - 170) / 2
  $('#navigation').height(inner_height)
  $('#navigation_content').height(inner_height - 27)
  $('#search_results').height(inner_height - 107)
  $('#[laylist').height(inner_height - 26)$(document).ready ->
  
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


adjust_search_result_header_widths = ->
  row = $('table#search_results_table').find('tr').first()
  track = row.children('.track').width()
  title = row.children('.title').width()
  artist = row.children('.artist').width()
  album = row.children('.album').width()
  time = row.children('.time').width()
  file = row.children('.file').width()

  $("table#search_results_table_header .track").width(track)
  $("table#search_results_table_header .title").width(title)
  $("table#search_results_table_header .artist").width(artist)
  $("table#search_results_table_header .album").width(album)
  $("table#search_results_table_header .time").width(time)
  $("table#search_results_table_header .file").width(file)

adjust_search_result_widths = ->
  row = $('table#search_results_table_header').find('tr').first()
  track = $(row).children('.track').width()
  title = $(row).children('.title').width()
  artist = $(row).children('.artist').width()
  album = $(row).children('.album').width()
  time = $(row).children('.time').width()
  file = $(row).children('.file').width()
  rows = $("table#search_results_table").children('tr')
  for row in rows
    $(row).children('.track').width(track)
    $(row).children('.title').width(title)
    $(row).children('.artist').width(artist)
    $(row).children('.album').width(album)
    $(row).children('.time').width(time)
    $(row).children('.file').width(file)timer = new WebSocket("ws://localhost:3001")
timer.onmessage = (message)->
  message = $.parseJSON(message.data)
  if message.time != null
    print_time(message.time.elapsed, message.time.total)
  if message.state != null
    switch message.state
      when "play" then $('li#play').addClass('pause')
      when "pause" then $('li#play').removeClass('pause')
      when "stop" then $('li#play').removeClass('pause')
  if message.new_song != null
    get_current_song()

print_time = (elapsed, total)->
  minutes = Math.floor(elapsed / 60)
  seconds = pad2(elapsed % 60)
  percent = Math.floor((elapsed/total) * 100)
  $('#seek_time').text("#{minutes}:#{seconds}")
  $('#seek_bar').slider("value", percent)

get_current_song = ->
  $.ajax
    url: mpd_server + 'player/current_song'
    dataType: 'json'
    async: true
    success: (data)-> update_current_song(data)
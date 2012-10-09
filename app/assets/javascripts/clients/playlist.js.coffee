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
  $('#[laylist').height(inner_height - 26)
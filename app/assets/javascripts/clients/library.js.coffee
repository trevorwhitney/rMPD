get_artists = (page)->
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
    "left": windowWidth/2 - popupWidth/2
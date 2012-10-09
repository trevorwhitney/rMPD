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
  $('#seek_time').text("0:00")
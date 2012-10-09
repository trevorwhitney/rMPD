timer = new WebSocket("ws://localhost:3001")
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
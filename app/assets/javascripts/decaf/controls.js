$(document).ready(function() {
  add_control_listeners();
});

function add_control_listeners() {
  $('li#play').click(function() {
    $(this).toggleClass('pause');
  })
}
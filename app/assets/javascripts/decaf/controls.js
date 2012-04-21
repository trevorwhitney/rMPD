$(document).ready(function() {
  add_control_listeners();
});

function add_control_listeners() {
  $('li#play').click(function() {
    $(this).toggleClass('pause');
  });
  $('ul#repeat_shuffle li.repeat').click(function() {
    $(this).toggleClass('selected');
  });
  $('ul#repeat_shuffle li.shuffle').click(function() {
    $(this).toggleClass('selected');
  });
}
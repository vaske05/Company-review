$(document).ready(function() { //dodaj u HTML
  var id = $('#receiverID').val();

  $('#messageBtn').on('click', function(){
    var message = $.trim($('#msg').val());

    if(message != ''){
      $.post('/message/' + id, {
        message: message,
        id: id
      }, function(data){
        $('#msg').val('');
      });
    }
  });

  setInterval(function(){
    $('.msg').load(location.href + ' .msg')
  }, 200);


});

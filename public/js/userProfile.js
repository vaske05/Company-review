$(document).ready(function(){
  var clickedValue = 0;


  $('#editBtn').on('click', function(){
    if(clickedValue == 0){
      $('#fullName').removeAttr('readOnly');
      $('#company').removeAttr('readOnly');
      $('#role').removeAttr('readOnly');
      $('#country').removeAttr('readOnly');
      $('#city').removeAttr('readOnly');
      clickedValue = 1;
    }
    else {
      $('#fullName').attr('readOnly','true');
      $('#company').attr('readOnly','true');
      $('#role').attr('readOnly','true');
      $('#country').attr('readOnly','true');
      $('#city').attr('readOnly','true');
      clickedValue = 0;
    }


    //console.log(clickedValue);

  });
/*
  $('#rate').on('click', function(){
    var review = $('#review').val();
    var sender = $('#sender').val();
    var id = $('#id').val();

    var valid = true;
    if(clickedValue === 0 || clickedValue > 5){
      valid = false;
      $('#error').html('<div class="alert alert-danger">Please give a rating and review before submit.</div>')
    } else {
      $('#error').html('');
    }

    if(valid === true){
       $.ajax({
         url: '/review/'+id,
         type: 'POST',
         data: {
           clickedValue: clickedValue,
           review: review,
           sender: sender
         },
         success: function(){
           $('#review').val('');
           $('#sender').val('');
           $('#id').val('');
         }
       });

    } else {
      return false;
    }

  });
*/
});

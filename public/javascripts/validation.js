/* [새 파일] public/javascripts/validation.js */
// $는 jQuery를 의미합니다.
$('#addReview').submit(function (e) {
  // 1. 기존에 표시된 에러 메시지가 있다면 숨깁니다.
  $('.alert.alert-danger').hide();

  // 2. 폼 필드 중 하나라도 비어있는지 확인합니다.
  // (!'input#name'.val()) -> ID가 name인 input
  // (!'select#rating'.val()) -> ID가 rating인 select
  // (!'textarea#review'.val()) -> ID가 review인 textarea
  if (!$('input#name').val() || !$('select#rating').val() || !$('textarea#review').val()) {
    
    // 3. 비어있다면, 'alert' 클래스를 가진 태그가 이미 있는지 확인합니다.
    if ($('.alert.alert-danger').length) {
      // 4a. 이미 있다면, 숨겨둔 것을 다시 표시합니다.
      $('.alert.alert-danger').show();
    } else {
      // 4b. 없다면, 폼 상단에 새로운 에러 메시지를 삽입합니다.
      $(this).prepend('<div role="alert" class="alert alert-danger">All fields required, please try again</div>');
    }
    
    // 5. 폼 전송(submit)을 중단시킵니다.
    return false;
  }
  // 6. (모든 필드가 채워졌다면, return false가 실행되지 않고 폼이 정상적으로 서버에 제출됩니다.)
});
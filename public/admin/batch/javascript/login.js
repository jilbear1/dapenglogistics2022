async function loginFormHandler(event) {
    event.preventDefault;

    const email = document.querySelector('#email-login').value.trim();
    const password = document.querySelector('#password-login').value.trim();

    if (email && password) {
      console.log(email, password);
      const response = await fetch('/api/user/login', {
        method: 'post',
        body: JSON.stringify({
          email,
          password
        }),
        headers: { 'Content-Type': 'application/json' }
      }); console.log("email: "+ email + ' w/ password: ' + password);

      if (response.ok) {
         document.location.replace('/');
      } else {
        alert("Failed to log in! Please try again with correct login info.\n 密码或帐号有误，请重新输入!");
        location.reload()
      }
    }
  };

  (function() {
    'use strict';
    window.addEventListener('load', function() {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName('needs-validation');
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function(form) {
        form.addEventListener('submit', function(event) {
          if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
          }
          form.classList.add('was-validated');
          event.preventDefault();
          loginFormHandler(event)
        }, false);
      });
    }, false);
})();

function myFunction() {
  var x = document.getElementById("password-login");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}

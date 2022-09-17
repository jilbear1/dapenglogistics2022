async function signupFormHandler(admin) {
    const email = document.querySelector('#email-signup').value.trim();
    const password = document.querySelector('#password-signup').value.trim();
    const name = document.querySelector('#name-signup').value.trim();
    const username = document.querySelector('#username-signup').value.trim();

    if (username && password && name) {
      const response = await fetch('/api/user', {
        method: 'post',
        body: JSON.stringify({
          name,
          email,
          password,
          username,
          admin
        }),
        headers: { 'Content-Type': 'application/json' }
      }); console.log(email, password, name, admin, username);

      // check the response status
      if (response.ok) {
        console.log('success');
        if (admin) {
          document.location.replace('/admin')
        } else {
          document.location.replace('/');
        }
      } else {
        alert('This email is already registered with an existed account')
      }
    }
}

function eligibility(event) {
  event.preventDefault();
  const adminCode = document.querySelector('#admin-signup').value.trim();
  var admin = false;
  if (adminCode == 'tempadmin') {
    admin = true;
    signupFormHandler(admin);
  } else if (adminCode == 'tempclient') {
    signupFormHandler(admin);
  } else {alert('Your eligibility code is invalid; please try again.')};
}

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
        eligibility(event);
      }, false);
    });
  }, false);
})();

/* Team login (demo): password visibility toggle only. */
(function () {
  var pass = document.getElementById('pass');
  var eye = document.getElementById('eye');

  eye.addEventListener('click', function () {
    var show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    eye.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });

  document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
  });
})();

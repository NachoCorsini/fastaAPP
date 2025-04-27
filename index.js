function login() {
  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const clave = document.getElementById("clave").value.trim();

  if (!nombre || !apellido || !clave) {
    Swal.fire({
      icon: 'warning',
      title: 'Campos incompletos',
      text: 'Por favor, completá todos los campos antes de ingresar.'
    });
    return;
  }

  if (clave === "*preceptores*") {
    const nombreCompleto = `${nombre.toUpperCase()} ${apellido.toUpperCase()}`;
    localStorage.setItem("preceptor", nombreCompleto);
    window.location.href = "panel.html"; // Va a panel.html como acordamos
  } else {
    Swal.fire({
      icon: 'error',
      title: '¡Ups!',
      text: 'Solo los preceptores tienen acceso.'
    });
  }
}

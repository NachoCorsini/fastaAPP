const inasistenciasPorAlumno = {};

function formatearFecha(fechaISO) {
  const [año, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${año}`;
}

function cargarListaCurso(curso) {
  const tableBody = document.querySelector('#alumnosTable tbody');
  tableBody.innerHTML = '';

  db.collection("cursos").doc(curso).get().then(doc => {
    if (doc.exists) {
      const alumnos = doc.data().alumnos || {};

      Object.entries(alumnos).forEach(([dni, nombreCompleto]) => {
        if (!inasistenciasPorAlumno[dni]) {
          inasistenciasPorAlumno[dni] = [];
        }

        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${dni}</td>
          <td>${nombreCompleto}</td>
          <td>
            <button onclick="cargarInasistencia('${dni}', '${nombreCompleto}')" class="btn-verde">➕</button>
            <button onclick="editarInasistencia('${dni}', '${nombreCompleto}')" class="btn-naranja">✏️</button>
            <button onclick="verInasistencias('${dni}', '${nombreCompleto}')" class="btn-azul">👁️</button>
          </td>
        `;
        tableBody.appendChild(row);
      });

      document.getElementById('alumnosTable').style.display = 'table';
    } else {
      Swal.fire("Sin lista", `No hay alumnos cargados para ${curso}`, "info");
    }
  });
}

function cargarInasistencia(dni, nombre) {
  Swal.fire({
    title: `Cargar inasistencia de ${nombre}`,
    html: `
      <input type="date" id="fecha" class="swal2-input" />
      <select id="contraturno" class="swal2-input">
        <option value="">Tipo de contraturno</option>
        <option>Educación Física</option>
        <option>Teatro</option>
        <option>Plástica</option>
        <option>Coro</option>
      </select>
    `,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const fecha = document.getElementById("fecha").value;
      const contraturno = document.getElementById("contraturno").value;
      if (!fecha || !contraturno) {
        Swal.showValidationMessage("Completá todos los campos.");
        return false;
      }
      return { fecha, contraturno };
    }
  }).then(result => {
    if (result.isConfirmed) {
      const curso = document.getElementById("curso").value;
      const nuevaFalta = result.value;
      const idFalta = `${nuevaFalta.fecha}-${Date.now()}`;

      if (!inasistenciasPorAlumno[dni]) {
        inasistenciasPorAlumno[dni] = [];
      }
      inasistenciasPorAlumno[dni].push(nuevaFalta);

      db.collection("inasistencias")
        .doc(curso)
        .collection(dni)
        .doc(idFalta)
        .set(nuevaFalta)
        .then(() => {
          Swal.fire("Guardado", "Inasistencia registrada", "success");
        })
        .catch(err => {
          console.error("Error guardando:", err);
          Swal.fire("Error", "No se pudo guardar en Firestore", "error");
        });
    }
  });
}

function editarInasistencia(dni, nombre) {
  const curso = document.getElementById("curso").value;

  db.collection("inasistencias").doc(curso).collection(dni).get()
    .then(snapshot => {
      if (snapshot.empty) {
        Swal.fire("Sin registros", `${nombre} no tiene inasistencias cargadas.`, "info");
        return;
      }

      const inasistencias = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        inasistencias.push({ id: doc.id, ...data });
      });

      const opciones = inasistencias.map(i => {
        return `<option value="${i.id}">${formatearFecha(i.fecha)} - ${i.contraturno}</option>`;
      }).join("");

      Swal.fire({
        title: `Editar inasistencia de ${nombre}`,
        html: `
          <select id="inasistSelect" class="swal2-input">${opciones}</select>
          <input type="date" id="nuevaFecha" class="swal2-input" />
          <select id="nuevoContraturno" class="swal2-input">
            <option value="">Tipo de contraturno</option>
            <option>Educación Física</option>
            <option>Teatro</option>
            <option>Plástica</option>
            <option>Coro</option>
          </select>
        `,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Guardar cambios",
        denyButtonText: "🗑️ Eliminar",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
          const id = document.getElementById("inasistSelect").value;
          const fecha = document.getElementById("nuevaFecha").value;
          const contraturno = document.getElementById("nuevoContraturno").value;
          if (!fecha || !contraturno) {
            Swal.showValidationMessage("Completá todos los campos.");
            return false;
          }
          return { id, fecha, contraturno };
        }
      }).then(result => {
        const selectedId = document.getElementById("inasistSelect").value;

        if (result.isConfirmed) {
          const { fecha, contraturno } = result.value;

          db.collection("inasistencias")
            .doc(curso)
            .collection(dni)
            .doc(selectedId)
            .update({ fecha, contraturno })
            .then(() => {
              Swal.fire("Actualizado", "Inasistencia editada correctamente", "success");
            })
            .catch(err => {
              console.error("Error editando:", err);
              Swal.fire("Error", "No se pudo actualizar", "error");
            });

        } else if (result.isDenied) {
          Swal.fire({
            title: "¿Eliminar esta inasistencia?",
            text: "Esta acción no se puede deshacer.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar"
          }).then(confirmDelete => {
            if (confirmDelete.isConfirmed) {
              db.collection("inasistencias")
                .doc(curso)
                .collection(dni)
                .doc(selectedId)
                .delete()
                .then(() => {
                  Swal.fire("Eliminado", "Inasistencia borrada correctamente", "success");
                })
                .catch(err => {
                  console.error("Error eliminando:", err);
                  Swal.fire("Error", "No se pudo eliminar", "error");
                });
            }
          });
        }
      });
    })
    .catch(err => {
      console.error(err);
      Swal.fire("Error", "No se pudo obtener los datos", "error");
    });
}

function verInasistencias(dni, nombre) {
  const curso = document.getElementById("curso").value;

  db.collection("inasistencias").doc(curso).collection(dni).get()
    .then(snapshot => {
      if (snapshot.empty) {
        Swal.fire("Sin inasistencias", `${nombre} no tiene registros.`, "info");
        return;
      }

      let html = "<strong>Inasistencias registradas:</strong><br>";

      snapshot.forEach(doc => {
        const data = doc.data();
        html += `<p>${formatearFecha(data.fecha)} - ${data.contraturno}</p>`;
      });

      Swal.fire({
        title: `Inasistencias de ${nombre}`,
        html: html,
        icon: "info"
      });
    })
    .catch(err => {
      console.error(err);
      Swal.fire("Error", "No se pudieron obtener los datos", "error");
    });
}

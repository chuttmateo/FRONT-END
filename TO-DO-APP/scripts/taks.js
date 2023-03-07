// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.
if (!localStorage.jwt) {
  location.replace('./index.html');
}
/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener('load', function () {

  const urlBase = 'http://todo-api.ctd.academy:3000/v1';
  const urlTareas = `${urlBase}/tasks`;
  const urlUsuario = `${urlBase}/users/getMe`;
  const token = JSON.parse(localStorage.jwt);

  const formCrearTarea = document.querySelector('.nueva-tarea');
  const nuevaTarea = document.querySelector('#nuevaTarea');
  const btnCerrarSesion = document.querySelector('#closeApp');

  const imagenPerfil = document.querySelector(".div-imagen")
  const body = document.querySelector("body")

  obtenerNombreUsuario();
  consultarTareas();
  bodyImagen()


  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */
  btnCerrarSesion.addEventListener('click', function () {
    const cerrarSesion = confirm("¿Desea cerrar sesión?");
    if (cerrarSesion) {
      //limpiamos el localstorage y redireccioamos a login
      localStorage.clear();
      location.replace('./index.html');
    }
  });
  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */
  function obtenerNombreUsuario() {
    imagenRandom()
    const settings = {
      method: 'GET',
      headers: {
        authorization: token
      }
    };
    console.log("Consultando mi usuario...");
    fetch(urlUsuario, settings)
      .then(response => response.json())
      .then(data => {
        console.log("Nombre de usuario:");
        console.log(data.firstName);
        const nombreMayus = data.firstName[0].toUpperCase() + data.firstName.slice(1);
        const nombreUsuario = document.querySelector('.user-info p');
        nombreUsuario.innerText = nombreMayus;
      })
      .catch(error => console.log(error));
  }
  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */

  function consultarTareas() {
    const settings = {
      method: 'GET',
      headers: {
        authorization: token
      }
    };
    console.log("Consultando mis tareas...");
    fetch(urlTareas, settings)
      .then(response => response.json())
      .then(tareas => {
        console.log("Tareas del usuario");
        console.table(tareas);

        renderizarTareas(tareas);
        botonesCambioEstado();
        botonBorrarTarea();
      })
      .catch(error => console.log(error));
  };


  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 4 - Crear nueva tarea [POST]                    */
  /* -------------------------------------------------------------------------- */

  formCrearTarea.addEventListener('submit', function (event) {

    event.preventDefault();

    if (!nuevaTarea.value){
    alert("error en el llenado de campos")
    return null
    }

    console.log("crear terea");
    console.log(nuevaTarea.value);

    const payload = {
      description: nuevaTarea.value.trim()
    };

    const settings = {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        authorization: token
      }
    }

    console.log("Creando un tarea en la base de datos");
    fetch(urlTareas, settings)
      .then(response => response.json())
      .then(tarea => {
        console.log(tarea)
        consultarTareas();
      })
      .catch(error => console.log(error));


    //limpiamos el form
    formCrearTarea.reset();
  })
  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarTareas(listado) {

    // obtengo listados y limpio cualquier contenido interno
    const tareasPendientes = document.querySelector('.tareas-pendientes');
    const tareasTerminadas = document.querySelector('.tareas-terminadas');

    // limpiamos siempre las cajas
    tareasPendientes.innerHTML = "";
    tareasTerminadas.innerHTML = "";

    listado.forEach(tarea => {
      let fecha = new Date(tarea.createdAt);
      // chequear si la tarea está terminada o no
      if (tarea.completed) {
        tareasTerminadas.innerHTML += `
        <li class="tarea">
          <div class="hecha">
            <i class="fa-regular fa-circle-check"></i>
          </div>
          <div class="descripcion">
            <p class="nombre">${tarea.description}</p>
            <div class="cambios-estados">
              <button class="change completa" id="${tarea.id}" ><i class="fa-solid fa-rotate-left"></i></button>
              <button class="borrar" id="${tarea.id}"><i class="fa-regular fa-trash-can"></i></button>
            </div>
          </div>
        </li>
        `
      } else {
        // tareas pendientes
        tareasPendientes.innerHTML += `
        <li class="tarea">
          <button class="change" id="${tarea.id}"><i class="fa-regular fa-circle"></i></button>
          <div class="descripcion">
            <p class="nombre">${tarea.description}</p>
            <p class="timestamp">${fecha.toLocaleDateString()}</p>
          </div>
        </li>
        `
      }
    })


  }

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Cambiar estado de tarea [PUT]                 */
  /* -------------------------------------------------------------------------- */
  function botonesCambioEstado() {

    const btnCambioEstado = document.querySelectorAll('.change');

    btnCambioEstado.forEach(boton => {
      //a cada boton le asignamos una funcionalidad
      boton.addEventListener('click', function (event) {

        console.log("Cambiando estado de tarea...");

        const id = event.target.id;
        const url = `${urlTareas}/${id}`
        const payload = {};

        //segun el tipo de boton que fue clickeado, cambiamos el estado de la tarea
        if (event.target.classList.contains('completa')) {
          // si está completada, la paso a pendiente
          payload.completed = false;
        } else {
          // sino, está pendiente, la paso a completada
          payload.completed = true;
        }


        const settingsCambio = {
          method: 'PUT',
          headers: {
            "Authorization": token,
            "Content-type": "application/json"
          },
          body: JSON.stringify(payload)
        }
        fetch(url, settingsCambio)
          .then(response => {
            console.log(response.status);
            //vuelvo a consultar las tareas actualizadas y pintarlas nuevamente en pantalla
            consultarTareas();
          })
      })
    });


  };
  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarTarea() {
    const btnBorrarTarea = document.querySelectorAll('.borrar');

    btnBorrarTarea.forEach(btn => {
      btn.addEventListener('click', event => {
        const id = event.target.id;

        const settings = {
          method: 'DELETE',
          headers: {
            "Authorization": token
          }
        }

        fetch(`${urlTareas}/${id}`, settings)
          .then(response => {
            console.log(response.status);
            //vuelvo a consultar las tareas actualizadas y pintarlas nuevamente en pantalla
            consultarTareas();
          })
      });
    });

  };

  function imagenRandom() {
    const imagenes = ["../imagenesParaRandom/goku.gif","../imagenesParaRandom/tf2-random.gif","../imagenesParaRandom/libart.jpg","../imagenesParaRandom/ce59837dd46efcaa5549a75bf2b1e443.jpg", "../imagenesParaRandom/descarga (1).jfif","../imagenesParaRandom/descarga (2).jfif","../imagenesParaRandom/descarga (3).jfif","../imagenesParaRandom/descarga.jfif","../imagenesParaRandom/images (1).jfif","../imagenesParaRandom/images (2).jfif","../imagenesParaRandom/images.jfif"]
    const aleatorio = imagenes[Math.floor(Math.random() * imagenes.length)]
    imagenPerfil.innerHTML = `<img src="${aleatorio}" class="user-image" alt="">`
  }
  function bodyImagen(){
    const imagenes = ["../assets/wallpaper3.jpg","../assets/wallpaper2.jpg","../assets/wallpaper1.jpg"]
    const aleatorio = imagenes[Math.floor(Math.random() * imagenes.length)]
    body.setAttribute("background", aleatorio)
  }


imagenPerfil.addEventListener("click",()=>{
  imagenRandom()
})

});


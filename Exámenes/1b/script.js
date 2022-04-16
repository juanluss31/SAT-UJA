function loadTask() {
  let conn = new XMLHttpRequest();
  conn.open("GET", "http://labtelema.ujaen.es:8083/task/");
  conn.onload = function () {
    if (conn.readyState === 4) {
      switch (conn.status) {
        case 200:
          //Se recibe el JSON
          let tasks = JSON.parse(conn.responseText);
          listarTasks(tasks);
          alert("Datos descargados");
          break;
        case 500:
          console.log("Error del servidor");
          break;
      }
    }
  };
  conn.send(null);
}

function listarTasks(tasks) {
  let section = document.getElementById("list");
  let lista = window.document.getElementById("ul-list");
  if (lista === null) {
    lista = document.createElement("ul");
    lista.setAttribute("id", "ul-list");
  }
  lista.innerHTML = "<hr>";

  for (let item of tasks) {
    let elementoLista = document.createElement("li");
    let contenedor1 = document.createElement("div");
    let contenedor2 = document.createElement("div");
    let boton = document.createElement("button");
    boton.setAttribute("onclick", "detalles(" + JSON.stringify(item) + ")");
    boton.classList.add("boton");
    boton.innerHTML = "&nbsp Más &nbsp detalles";
    contenedor1.innerHTML =
      "<b>Tarea: </b> " + item.task + " <br> <b>Usuario: </b> " + item.user;
    contenedor2.appendChild(boton);

    contenedor1.classList.add("contenedorTexto");
    contenedor2.classList.add("contenedorBoton");

    elementoLista.appendChild(contenedor1);
    elementoLista.appendChild(contenedor2);
    lista.appendChild(elementoLista);
  }

  section.appendChild(lista);
}

function detalles(tarea) {
  let aside = window.document.getElementById("details");
  let parrafo = window.document.getElementById("info");
  if (parrafo === null) {
    parrafo = document.createElement("p");
    parrafo.setAttribute("id", "info");
  }
  parrafo.innerHTML =
    "<b>Descripción: </b> " +
    tarea.description +
    " <br> <b>Fecha:</b> " +
    tarea.date;
  aside.appendChild(parrafo);
}


/*

PRÁCTICA 2: APLICACIÓN WEB CLIENTE BÁSICA

SERVICIOS Y APLICACIONES TELEMÁTICAS 
INGENIERÍA DE LAS TECNOLOGÍAS DE LA TELECOMUNICACIÓN

CURSO 2021/22

JUAN LUIS HERREROS BÓDALO - MANUEL BALLESTEROS BOSQUES

*/

var SERVERURL = "";

var currentUser = "";

function show(n) {
  let sections = document.querySelectorAll("[id^='section']");
  let menus = document.querySelectorAll("[id^='menu']");
  for (let s of sections) {
    s.classList.add("oculto");
  }
  for (let m of menus) {
    m.classList.remove("activo");
  }

  let oculto = document.getElementById("section-" + n);
  oculto.classList.remove("oculto");
  if (n != 4) {
    let ocultoa = document.getElementById("section-" + n + "a");
    ocultoa.classList.remove("oculto");
  }

  let activo = document.getElementById("menu-" + n);
  activo.classList.add("activo");
}
function menuLogeado(user) {
  currentUser = user;
  loadRepository();

  let menus = document.querySelectorAll("[id^='menu']");

  for (let m of menus) {
    m.classList.add("oculto");
  }
  let nuevoExamen = document.getElementById("menu-3");
  nuevoExamen.classList.remove("oculto");

  let acercade = document.getElementById("menu-4");
  acercade.classList.remove("oculto");

  show(3);
}

function login(event) {
  event.preventDefault();

  let user = document.forms.acceso.user.value;
  let password = document.forms.acceso.passwordLogin.value;
  let json = {
    user: user,
    password: password,
  };
  let conn = new XMLHttpRequest();
  conn.open("POST", SERVERURL + "/login");
  conn.onreadystatechange = function () {
    if (conn.readyState === 4) {
      switch (conn.status) {
        case 200:
          menuLogeado(user);
          break;
        case 401:
          escribirError(1, "Error de autenticación");
          break;
        case 500:
          escribirError(1, "Error de autenticación");
          break;
      }
    }
  };
  conn.setRequestHeader("Content-Type", "application/json");
  conn.send(JSON.stringify(json));
}

function user(event) {
  event.preventDefault();

  let user = document.forms.register.nick.value;
  let password = document.forms.register.password.value;
  let name = document.forms.register.name.value;
  let surname = document.forms.register.surname.value;
  let email = document.forms.register.email.value;
  let json = {
    user: user,
    password: password,
    name: name,
    surname: surname,
    email: email,
  };
  console.log(JSON.stringify(json));
  let conn = new XMLHttpRequest();
  conn.open("PUT", SERVERURL + "/user");
  conn.onreadystatechange = function () {
    if (conn.readyState === 4) {
      switch (conn.status) {
        case 201:
          //Usuario logueado
          menuLogeado(user);
          break;
        case 400:
          escribirError(2, "Ya existe un usuario igual en el sistema");
          break;
        case 500:
          escribirError(2, "Error del servidor");
          break;
      }
    }
  };
  conn.setRequestHeader("Content-Type", "application/json");
  conn.send(JSON.stringify(json));
}

function loadRepository() {
  let conn = new XMLHttpRequest();
  conn.open("GET", SERVERURL + "/repository/" + currentUser);
  conn.onload = function () {
    if (conn.readyState === 4) {
      switch (conn.status) {
        case 200:
          //Se recibe el JSON
          let repositorios = JSON.parse(conn.responseText);
          listarRepositorios(repositorios);
          break;
        case 403:
          console.log("Acceso prohibido");
          break;
      }
    }
  };
  conn.send(null);
}

function listarRepositorios(repo) {
  let lista = document.getElementById("repositorioSelector");

  for (let item of repo) {
    let opcion = document.createElement("option");
    opcion.setAttribute("value", item._id);
    opcion.innerHTML = item.name;
    lista.appendChild(opcion);
  }
}

function crearExamen(event) {
  event.preventDefault();

  let user = currentUser;
  let title = document.forms.exam.title.value;
  let date = document.forms.exam.date.value;
  let repository = document.forms.exam.repository.value;

  let json = {
    user: user,
    title: title,
    date: date,
    repository: repository,
  };
  console.log(JSON.stringify(json));
  let conn = new XMLHttpRequest();
  conn.open("PUT", SERVERURL + "/exam");
  conn.onreadystatechange = function () {
    if (conn.readyState === 4) {
      switch (conn.status) {
        case 201:
          escribirError(3, "Examen creado");
          document.forms.exam.reset();
          break;
        case 500:
          escribirError(3, "Error del servidor");
          break;
      }
    }
  };
  conn.setRequestHeader("Content-Type", "application/json");
  conn.send(JSON.stringify(json));
}

function escribirError(n, c) {
  let aside = window.document.getElementById("section-" + n + "a");
  let parrafo = window.document.getElementById("error");
  if (parrafo === null) {
    parrafo = document.createElement("p");
    parrafo.setAttribute("id", "error");
  }
  parrafo.innerHTML = c;
  aside.appendChild(parrafo);
}

function borrarExamen(id) {
  const init = {
    method: "DELETE",
  };

  fetch("/exam/" + id, init)
    .then((response) => {
      if (response.ok) {
        let p = document.getElementById(id);
        p.remove();
        escribirError(3, "Examen borrado");
      } else {
        alert("Error" + response.status);
      }
    })
    .catch((ex) => {
      ul.innerHTML = "Error " + ex;
    });
}

function cargarExamenes() {
  const ul = document.getElementById("listExamen");
  fetch("/exam")
    .then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          if (data.length > 0) {
            ul.innerHTML = "";
            for (let item of data) {
              let li = document.createElement("li");
              let h3 = document.createElement("h3");
              let b = document.createElement("button");
              let div = document.createElement("div");
              li.setAttribute("id", item._id);
              h3.innerHTML = item.title;
              div.innerHTML =
                "<b>Fecha:</b> " +
                item.date +
                "<br/> <b>Repositorio:</b> " +
                item.repository;
              b.setAttribute("id", "botonGrande");
              b.onclick = () => borrarExamen(item._id);
              //b.setAttribute("onclick", "eliminarExamen('" + item._id + "')");
              b.innerHTML = "Borrar";
              b.classList.add("boton");
              li.appendChild(h3);
              li.appendChild(div);
              li.appendChild(b);
              ul.appendChild(li);
            }
          } else {
            ul.innerHTML = "No hay registros";
          }
        });
      } else {
        ul.innerHTML = "Error " + response.status;
      }
    })
    .catch((ex) => {
      ul.innerHTML = "Error al conectar" + ex;
    });
}

/*

PRÁCTICA 2: APLICACIÓN WEB CLIENTE BÁSICA

SERVICIOS Y APLICACIONES TELEMÁTICAS 
INGENIERÍA DE LAS TECNOLOGÍAS DE LA TELECOMUNICACIÓN

CURSO 2021/22

JUAN LUIS HERREROS BÓDALO - MANUEL BALLESTEROS BOSQUES

*/

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
  if (n != 4 && n != 5) {
    let ocultoa = document.getElementById("section-" + n + "a");
    ocultoa.classList.remove("oculto");
  }

  let activo = document.getElementById("menu-" + n);
  activo.classList.add("activo");
}
function menuLogeado(user) {
  currentUser = user;
  loadRepository();
  loadExams();
  

  let menus = document.querySelectorAll("[id^='menu']");
  
  for (let m of menus) {
    m.classList.add("oculto");
  }
  let nuevoExamen = document.getElementById("menu-3");
  nuevoExamen.classList.remove("oculto");

  let acercade = document.getElementById("menu-4");
  acercade.classList.remove("oculto");

  let listaExamenes = document.getElementById("menu-5");
  listaExamenes.classList.remove("oculto");

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
  conn.open("POST", "http://labtelema.ujaen.es:8083/login");
  conn.onreadystatechange = function () {
    if (conn.readyState === 4) {
      switch (conn.status) {
        case 200:
          menuLogeado(user);
          break;
        case 401:
          escribirError(1,"Error de autenticación");
          break;
        case 500:
          escribirError(1,"Error de autenticación");
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
  conn.open("PUT", "http://labtelema.ujaen.es:8083/user");
  conn.onreadystatechange = function () {
    if (conn.readyState === 4) {
      switch (conn.status) {
        case 201:
          //Usuario logeado
          menuLogeado(user);
          break;
        case 400:
          escribirError(2,"Ya existe un usuario igual en el sistema");
          break;
        case 500:
          escribirError(2,"Error del servidor");
          break;
      }
    }
  };
  conn.setRequestHeader("Content-Type", "application/json");
  conn.send(JSON.stringify(json));
}

function loadRepository() {
  let conn = new XMLHttpRequest();
  conn.open("GET", "http://labtelema.ujaen.es:8083/repository/" + currentUser);
  conn.onload = function () {
    if (conn.readyState === 4) {
      switch (conn.status) {
        case 200:
          //Se recibe el JSON
          let repositorios = JSON.parse(conn.responseText);
          console.log(repositorios);
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
  
  for (let item of repo){
    console.log(item._id);
    let opcion = document.createElement("option");
    opcion.setAttribute("value", item._id);
    opcion.innerHTML=item.name;
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
  conn.open("PUT", "http://labtelema.ujaen.es:8083/exam");
  conn.onreadystatechange = function () {
    if (conn.readyState === 4) {
      switch (conn.status) {
        case 201:
          escribirError(3,"Examen creado");
          break;
        case 500:
          escribirError(3,"Error del servidor");
          break;
      }
    }
  };
  conn.setRequestHeader("Content-Type", "application/json");
  conn.send(JSON.stringify(json));
}

function escribirError(n,c) {
    let aside = window.document.getElementById("section-"+n+"a");
    let parrafo = window.document.getElementById("error");
    if (parrafo === null){
      parrafo = document.createElement("p");
      parrafo.setAttribute("id", "error");
    }    
    parrafo.innerHTML = c;
    aside.appendChild(parrafo);
}

function loadExams() {
  let conn = new XMLHttpRequest();
  conn.open("GET", "http://labtelema.ujaen.es:8083/exam");
  conn.onload = function () {
    if (conn.readyState === 4) {
      switch (conn.status) {
        case 200:
          //Se recibe el JSON
          let examenes = JSON.parse(conn.responseText);
          console.log(examenes);
          listarExamenes(examenes);
          break;
        case 403:
          console.log("Acceso prohibido");
          break;
      }
    }
  };
  conn.send(null);
}

function listarExamenes(exam) {
  let lista = document.getElementById("listExamen");
  
  for (let item of exam){
    let p = document.createElement("p");
    let b = document.createElement("b");
    p.setAttribute("id", item._id);
    p.innerHTML=item.title + item.date;
    b.setAttribute("value","Borrar");
    p.appendChild(b);
    lista.appendChild(p);
  }

}

function eliminarExamen(event){
  event.preventDefault();
  let id = document.forms.listExam.exams.value;
  let conn = new XMLHttpRequest();
  conn.open("DELETE", "http://labtelema.ujaen.es:8083/exam/"+id);
  conn.onload = function () {
    if (conn.readyState === 4) 
      loadExams();
      
    }
  
  conn.send(null);
}
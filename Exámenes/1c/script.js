var datoslista = [];

function addtolist(event) {
  event.preventDefault();

  articulo = window.document.forms.nuevoElemento.item.value;
  numero = window.document.forms.nuevoElemento.number.value;

  let json = {
    "item": articulo,
    "number": numero,
  };

  datoslista.push(json);
  let lista = window.document.getElementById("listanonumerada");
  let li = document.createElement("li");
  let contenedor1 = document.createElement("div");
  let contenedor2 = document.createElement("div");

  contenedor1.innerHTML = "<b>Artículo:</b> &nbsp" + articulo;

  contenedor2.innerHTML = "&nbsp <b>Cantidad:</b> &nbsp" + numero;

  li.appendChild(contenedor1);
  li.appendChild(contenedor2);
  lista.appendChild(li);

  window.document.getElementById("formulario").reset();
}

function enviarLista() {
  if (Object.keys(datoslista).length != 0) {
    let json = {
      "list": datoslista,
    };

    let conn = new XMLHttpRequest();
    conn.open("POST", "http://labtelema.ujaen.es:8083/list");
    conn.onreadystatechange = function () {
      if (conn.readyState === 4) {
        switch (conn.status) {
          case 201:
            alert("Operación realizada correctamente");
            break;
          case 500:
            alert("Error del servidor");
            break;
        }
      }
    };
    conn.setRequestHeader("Content-Type", "application/json");
    conn.send(JSON.stringify(json));
  }
}

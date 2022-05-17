function cargarUsuarios(event) {
  event.preventDefault();
  const ul = document.getElementById("resultados");
  let edad = document.forms.edad.age.value;
  fetch("/user/" + edad)
    .then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          if (data.length > 0) {
            ul.innerHTML = "";
            for (let item of data) {
              let li = document.createElement("li");
              let div = document.createElement("div");
              div.innerHTML =
                "<b>Nombre:</b> " +
                item.name +
                "<br/> <b>Apellidos:</b> " +
                item.surname +
                "<br/> <b>Edad:</b> " +
                item.age +
                "<br/> <b>Correo electrónico:</b> " +
                item.email +
                "<br/><br/>";
              li.appendChild(div);
              ul.appendChild(li);
            }
          } else {
            alert("Error: No se han recibido datos");
          }
        });
      }
      if (response.status === 404) {
        alert(
          "Error " +
            response.status +
            " (No hay usuarios con edad mayor o igual a " +
            edad +
            ")"
        );
      }
      if (response.status === 500) {
        alert("Error del servidor");
      }
    })
    .catch((ex) => {
      ul.innerHTML = "Error al conectar" + ex;
    });
}

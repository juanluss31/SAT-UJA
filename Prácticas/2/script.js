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

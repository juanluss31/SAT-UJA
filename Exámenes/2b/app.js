/* ********************************************************************************************
 * Prueba de evaluación 2 - Práctica 3 - Tipo B
 * Descripción: servidor Node.JS que implementa algunos servicios empleados en la práctica 2
 * ASIGNATURA: Servicios y Aplicaciones Telemáticas
 * TITULACIÓN: Grado en Ingeniería de tecnologías de telecomunicación (14312020)
 * TITULACIÓN: Doble Grado Ing. de tecnologías de la telecomunicación e Ing. telemática (15212007)
 * TITULACIÓN: Grado en Ingeniería telemática (14512016)
 * CENTRO: ESCUELA POLITÉCNICA SUPERIOR (LINARES)
 * CURSO ACADÉMICO: 2021-2022
 * AUTOR/ES: Juan Luis Herreros Bódalo
 *********************************************************************************************/

const express = require("express"); //Módulo de express
const path = require("path"); //Módulo para manejar rutas de archivos
const MongoClient = require("mongodb").MongoClient; // Módulo de gestión MongoDB
const ObjectID = require("mongodb").ObjectID; // Modulo para poder emplear los objetos ID para referenciar documentos mongo
//const Mustache = require("mustache"); //Módulo para el motor de plantilla Mustache
//const mustacheExpress = require("mustache-express"); //Módulo para el motor de plantilla Mustache
const dns = require("dns"); //Módulo para emplear el servicio DNS
const os = require("os"); //Módulo de información relativa al sistema operativo y el host
const { response } = require("express");

const app = express(); //Instancia de Express

const urlMongoDB = "mongodb://localhost:27017/examenes"; //URL de la base de datos MongoDB

const DEFAULT_PORT = 8083; //Puerto del servidor por defecto
const PORT = DEFAULT_PORT; //Para poder actualizarla por los argumentos del programa.

//Mustache
//app.engine("html", mustacheExpress());
//app.set("view engine", "html");
//app.set("views", "./views");

//Ruta a los recursos estáticos, normalmente CSS o html sin personalizar
app.use(express.static(__dirname + "/public"));

app.use(express.json()); //Preparar req.body para contenido JSON
app.use(express.urlencoded({ extended: true })); // Preparar req.body para contenido application/x-www-form-urlencoded

/************************ 
  Rutas a los servicios 
*************************/

/** [Aportado por el profesor] Simplemente muestra la petición de entrada como registro y pasa el manejo al siguiente  */
app.use((req, res, next) => {
  console.log("[SERVIDOR] Petición entrante:" + req.method + " " + req.path);
  next(); //Cede el control a la siguiente parte de código que se ajuste con la petición.
});

// Servicio para descargar los usuarios por edad
app.get("/user/:edad", function (req, res) {
  edad = parseInt(req.params.edad);
  console.log("[SERVIDOR][/user/" + edad + "]");

  MongoClient.connect(
    urlMongoDB,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    function (err, client) {
      if (err) {
        res.status(500).end();
      } else {
        var db = client.db("students");
        db.collection("users")
          .find({ age: { $gte: edad } })
          .toArray(function (err, result) {
            if (err) {
              res.status(500).end();
            } else {
              console.log(result);
              if (result != undefined && result !== null && result.length > 0) {
                console.log(
                  "[SERVIDOR][/user/" +
                    req.params.edad +
                    "] Encontrado:" +
                    JSON.stringify(result)
                );
                res
                  .writeHead("200", { "Content-Type": "application/json" })
                  .end(JSON.stringify(result));
              } else {
                res.status(404).end();
              }
            }
            client.close();
          });
      }
    }
  );
});

//Se busca la ip del host para mostrarla en el mensaje de inicio
dns.lookup(os.hostname(), 4, function (err, address, family) {
  //4 para IPv4
  if (err) {
    console.log("Error al obtener la IP del servidor");
  } else {
    console.log("IP del servidor: " + address.toString());
    //Se inicia el servidor una vez se ha buscado la ip
    app.listen(PORT, address.toString(), () => {
      console.log(`Servidor ejecutándose en http://${address}:${PORT}`);
    });
  }
});

//La colección "users" de la base de datos "students" de MongoDB es en JSON:

/*
[
    {
        "_id":{
            "$oid": "628270ccdfe92b7b15e24de7"
        },
        "name":"Juan",
        "surname":"Nadie",
        "age":21,
        "email":"jn00001@red.ujaen.es"
    },
    {
        "_id":{
            "$oid": "628270ccdfe92b7b15e24de8"
        },
        "name":"Manoli",
        "surname":"López",
        "age":18,
        "email":"mlopez@ujaen.es"
    },
    {
        "_id":{
            "$oid": "628270ccdfe92b7b15e24de9"
        },
        "name":"Antonia",
        "surname":"Fernández",
        "age":15,
        "email":"antoniafer@gmail.com"
    },
    {
        "_id":{
            "$oid": "628270ccdfe92b7b15e24df0"
        },
        "name":"Alberto",
        "surname":"Jiménez",
        "age":30,
        "email":"alberto@gmail.com"
    },
    {
        "_id":{
            "$oid": "628270ccdfe92b7b15e24df1"
        },
        "name":"María",
        "surname":"Montes",
        "age":17,
        "email":"mmontes@red.ujaen.es"
    }
]
*/
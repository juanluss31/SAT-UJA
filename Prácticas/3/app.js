/* ********************************************************************************************
 * Práctica 3. Aplicación web en el servidor
 * Descripción: servidor Node.JS que implementa algunos servicios empleados en la práctica 2
 * ASIGNATURA: Servicios y Aplicaciones Telemáticas
 * TITULACIÓN: Grado en Ingeniería de tecnologías de telecomunicación (14312020)
 * TITULACIÓN: Doble Grado Ing. de tecnologías de la telecomunicación e Ing. telemática (15212007)
 * TITULACIÓN: Grado en Ingeniería telemática (14512016)
 * CENTRO: ESCUELA POLITÉCNICA SUPERIOR (LINARES)
 * CURSO ACADÉMICO: 2021-2022
 * AUTOR/ES: Juan Luis Herreros Bódalo y Manuel Ballesteros Bosques
 *********************************************************************************************/

const express = require("express"); //Módulo de express
const path = require("path"); //Módulo para manejar rutas de archivos
const MongoClient = require("mongodb").MongoClient; // Módulo de gestión MongoDB
const ObjectID = require("mongodb").ObjectID; // Modulo para poder emplear los objetos ID para referenciar documentos mongo
const Mustache = require("mustache"); //Módulo para el motor de plantilla Mustache
const mustacheExpress = require("mustache-express"); //Módulo para el motor de plantilla Mustache
const dns = require("dns"); //Módulo para emplear el servicio DNS
const os = require("os"); //Módulo de información relativa al sistema operativo y el host
const { response } = require("express");

const app = express(); //Instancia de Express

const urlMongoDB = "mongodb://localhost:27017/examenes"; //URL de la base de datos MongoDB

const DEFAULT_PORT = 8083; //Puerto del servidor por defecto
const PORT = DEFAULT_PORT; //Para poder actualizarla por los argumentos del programa.

//Mustache
app.engine("html", mustacheExpress());
app.set("view engine", "html");
app.set("views", "./views");

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

/** [Aportado por el profesor] Servicio para crear usuario */
app.put("/user", function (req, res) {
  console.log("[SERVIDOR] PUT /user Recibido:" + JSON.stringify(req.body));

  MongoClient.connect(
    urlMongoDB,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, db) {
      if (err) {
        res.status(500);
        res.end();
      } else {
        const dbo = db.db("examenes");
        //Se busca primero si el usuario ya existe.
        dbo
          .collection("users")
          .countDocuments(
            { user: { $eq: req.body.user } },
            function (err, number) {
              console.log(
                number + " coincidencia/s del usuario:" + req.body.user
              );
              if (err) {
                //Error de búsqueda de usuarios existentes
                console.log("Error: " + err);
                res.status(500);
                res.end("{}");
              } else if (number == 0) {
                //Si el usuario no existe, se inserta
                dbo
                  .collection("users")
                  .insertOne(req.body, function (err, result) {
                    if (err) {
                      //Error de inserción
                      console.log("Error: " + err);
                      res.status(500);
                      res.end("{}");
                    } else {
                      //Usuario insertado correctamente
                      console.log(
                        "1 document inserted: " + JSON.stringify(result)
                      );
                      db.close();
                      res.status(201);
                      res.type("application/json");
                      res.end(JSON.stringify(result));
                    }
                  });
              } else {
                //Usuario repetido
                console.log("Usuario ya existe");
                res.status(400);
                res.end("{}");
              }
            }
          );
      }
    }
  );
});

// [Aportado por el profesor] Servicio para recibir los repositorios
/* Este servicio es una emulación, solamente devuelve una constante */
app.get("/repository/:user", function (req, res) {
  console.log(`[SERVIDOR][/repository:${req.params.user}]`);
  let json = [
    {
      _id: "6013d4393070e93b9d93dc32",
      user: req.params.user,
      name: "Matemáticas",
    },
    {
      _id: "6013d4413070e93b9d93dc33",
      user: req.params.user,
      name: "Geografía",
    },
  ];

  res.json(json);
});

/* [Aportado por el profesor] Servicio de login */
app.post("/login", (req, res) => {
  console.log("[SERVIDOR][/login] Recibido: " + JSON.stringify(req.body));

  MongoClient.connect(
    urlMongoDB,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    function (err, client) {
      if (err) {
        console.log("Error: " + err);
        res.status(500).end();
      } else {
        var db = client.db("examenes");
        db.collection("users")
          .find({ user: req.body.user })
          .toArray(function (err, result) {
            if (err) {
              res.status(500).end();
            } else {
              if (result != undefined && result !== null && result.length > 0) {
                console.log(
                  "[SERVIDOR][/login] Encontrado:" + JSON.stringify(result)
                );
                if (req.body.password === result[0].password) {
                  res.status(200).end();
                } else {
                  res.status(401).end();
                }
              } else {
                res.status(401).end();
              }
            }
            client.close();
          });
      }
    }
  );
});

/* [Aportado por el profesor] Servicio GET exam para obtener la lista de todos los exámenes
para que en la sección de nuevo examen se pueda mostar la lista de todos ellos y añadir
el botón para borrar */
app.get("/exam", function (req, res) {
  console.log("[SERVIDOR][/exam]");

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
        var db = client.db("examenes");
        db.collection("exams")
          .find({})
          .toArray(function (err, result) {
            if (err) {
              res.status(500).end();
            } else {
              res.writeHead("200", { "Content-Type": "application/json" });
              res.end(JSON.stringify(result));
              //res.json(result);
            }
            client.close();
          });
      }
    }
  );
});

/******* INICIO PRÁCTICA 3 **********/

//Estos son los servicios que se deben crear en la práctica 3

//Tarea 3: servicio PUT /exam
app.put("/exam", (request, response) => {
  if (checkExam(request.body)) {
    MongoClient.connect(
      urlMongoDB,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      function (err, client) {
        if (err) {
          response.status(500).end();
        }
        var db = client.db("examenes");
        db.collection("exams").insertOne(request.body, function (err, result) {
          if (err) {
            response.status(500).end();
          } else {
            console.log("1 document inserted: " + JSON.stringify(result));
            response.status(201);
            response.type("application/json");
            response.end(JSON.stringify(result));
          }
          client.close();
        });
      }
    );
  } else {
    console.log("El formato recibido es incorrecto");
    response.status(400).end();
  }
});

//Tarea 4: servicio DELETE /exam/id
app.delete("/exam/:id", (request, response) => {
  MongoClient.connect(
    urlMongoDB,
    { useNewUrlParser: true, useUnifiedTopology: true },
    function (err, client) {
      if (err) {
        response.status(500).end();
      } else {
        var db = client.db("examenes");
        try {
          var postId = new ObjectID(request.params.id);
          db.collection("exams").deleteOne(
            { _id: postId },
            function (err, result) {
              if (err) {
                response.status(500).end();
              } else {
                if (result.deletedCount > 0) {
                  console.log("Deleted result: " + JSON.stringify(result));
                  response.status(200).end();
                } else {
                  console.log("404 - No se ha encontrado en la base de datos");
                  response.status(404).end();
                }
              }
              client.close();
            }
          );
        } catch (ex) {
          console.log("Exception: " + ex);
          response.status(404).end();
        }
      }
    }
  );
});

//Tarea 5: servicio GET /exam/user
app.get("/exam/:user", function (req, res) {
  console.log("[SERVIDOR][/exam]");

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
        var db = client.db("examenes");
        db.collection("exams")
          .find({ user: { $eq: req.params.user } })
          .toArray(function (err, result) {
            if (err) {
              res.status(500).end();
            } else {
              res.render("exams", { exams: result }, function (err, html) {
                if (err) {
                  console.log(err);
                  res.write("Error de plantilla");
                  //res.write("Error: " + err + " " + html);
                  res.end();
                } else {
                  res.write(html);
                  res.end();
                }
              });
            }
            client.close();
          });
      }
    }
  );
});

/******* FIN PRÁCTICA 3 **********/

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

function checkExam(obj) {
  let examen = {
    user: "",
    title: "",
    date: "",
    repository: "",
  };

  for (let prop in obj) if (examen[prop] == undefined) return false;
  for (let prop in examen) if (obj[prop] == undefined) return false;

  return true;
}

//Prueba:

var user = {
  user: "Joe Doe",
  title: "Mr.",
};

app.get("/mustache", function (req, res) {
  res.render("mustache", user, function (err, html) {
    //En caso de error
    if (err) {
      res.write("Error: " + err + " " + html);
    } else {
      res.write(html);
    }
    res.end();
  });
});
app.listen(3000);

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

//se copia de ajustes/configuracion de servicio en firebase web
//tambien debe de descargar el serviceAccountKey (clave privada)
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://firestore-grafica-a57b5.firebaseio.com"
});

const bd = admin.firestore();

export const helloWorld = functions.https.onRequest((request, response) => {
     response.json({
         mensaje :"Hola mundo desde funciones de firebaseee!"
    });
});


export const getGOTY = functions.https.onRequest(async (request, response) => {
    //const nombre = request.query.nombre || 'sin nombre';

    const gotyRef = bd.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map(doc => doc.data() );
  
    response.json(juegos);
});

//npm install express cors
//npm install @types/express --save-dev
//npm install @types/cors --save-dev
//todo dentro de la carpeta functions

//express
const app = express();
app.use(cors({origin: true}));

app.get('/goty', async(request, response) => {

    const gotyRef = bd.collection('goty');
    const docsSnap = await gotyRef.get();
    const juegos = docsSnap.docs.map(doc => doc.data() );
  
    response.json(juegos);
});


app.post('/goty/:id', async(request, response) => {

    const id = request.params.id;
    const gameRef = bd.collection('goty').doc(id);
    const gameSnap = await gameRef.get();

    if(!gameSnap.exists){
        response.status(404).json({
            ok: false,
            mensaje: 'No existe un juego con ese ID ' + id
        });
    }else {
        const antes = gameSnap.data() || {votos: 0};    
        gameRef.update({
            votos: antes.votos + 1
        }).catch(() => {

            response.status(404).json({
                ok: false,
                mensaje: 'Error al actualizar el juego'
            });
            
        });

        response.json({
            ok: true,
            mensaje: `Gracias por tu voto a ${antes.name}`
        });

    }

});


export const api = functions.https.onRequest(app);

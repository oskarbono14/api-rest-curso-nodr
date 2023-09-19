const startupDebugger = require('debug')('app:startup');

const express = require('express');
const config = require('config');
//const logger = require('./logger');
const morgan = require('morgan');
const app = express();
const Joi = require('@hapi/joi');
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

// configuracion de entornos

console.log('Aplicacion: ' + config.get('nombre'));
console.log('BD server: ' + config.get('configDB.host'));


// Uso de middleware de terceros
if(app.get('env') === 'development'){
    app.use(morgan('tiny'));
    //console.log('Morgan enabled...')
    startupDebugger('Morgan enabled...');
}

// Trabajos con la base sde datos
startupDebugger('Conectando con la base de datos...');

//app.use(logger);




// app.use(function(req, res, next) {
//     console.log('Authenticating...');
//     next();
// });





const users = [
    { id: 1, name: 'user1' },
    { id: 2, name: 'user2' },
    { id: 3, name: 'user3'}
]


app.get('/', (req, res) => {
    res.send('Hello World!');

})

app.get('/api/users', (req, res) => {
    res.send(users);
})

app.get('/api/users/:id', (req, res) => {
    let user = existeUser(req.params.id);
    if (!user) res.status(404).send('User not found');
    res.send(user);
})

app.post('/api/users', (req, res) => {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });

    const { error, value } = schema.validate({ name: req.body.name });

    if (!error) {
        const user = {
            id: users.length + 1,
            name: value.name
        };
        users.push(user);
        res.json(user);
    } else {
        res.status(400).send(error.details[0].message);
    }
});


// app.post('/api/users', (req, res) => {


// let body = req.body;
// console.log(body);
// res.json({
//     body});

//     const schema = Joi.object({
//         name: Joi.string().min(3).required()
//     });
//     const {error, value} = validateUser(req.body.name);
//     if (!error) {
//         const user = {
//             id: users.length + 1,
//             name: value.name
//         };
//         users.push(user);
//         res.send(user);
//     }
//     else {
//         res.status(400).send(error.details[0].message);
//     }    

// });

app.put('/api/users/:id', (req, res) => {
       let user = existeUser(req.params.id);   
    if (!user) {
        res.status(404).send('User not found');
        return;
    }
    
    
    const {error, value} = validateUser(req.body.name);
    
    if (error){
        res.status(400).send(error.details[0].message);
        return;
    }
    user.name = value.name;
    res.send(user);

});

app.delete('/api/users/:id', (req, res) => {
    let user = existeUser(req.params.id);
    if (!user) {
        res.status(404).send('User not found');
        return;
    }
    const index = users.indexOf(user);
    users.splice(index, 1);
    res.send(users);
});
        


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Listening on port ${port}...`);
})



function existeUser(id) {
    return users.find(user => user.id === parseInt(id));
}

function validateUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(3).required()
    });
    return schema.validate({name: user} );
}




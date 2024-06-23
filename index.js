const http_port = 8181;
const express = require('express');
const path = require('path');
const fs = require('fs');
const joi = require('joi');
const app = express();
//app.use('./static', express.static(path.join(__dirname, 'content')));
const staticFolder = path.join(__dirname, 'content');
const usersdb = 'usersdb.json';

const userScheme = joi.object({
    first_name: joi.string().min(1).required(),
    second_name: joi.string().min(1).required(),
    age: joi.number().min(0).max(150).required(),
    city: joi.string().min(1).required()
})

app.use(express.json());


app.get('/users', (req, res, next)=>{
    let userinfo = {};
    try {
        userinfo = JSON.parse(fs.readFileSync(path.join(staticFolder, usersdb), 'utf-8'));
    } catch (e) {
        console.log('no info');
    }
    res.send(userinfo);
    next();
})

app.get('/users/:id', (req,res,next)=>{
    const userid = req.params.id;
    let userlist = {};
    try {
        userlist = JSON.parse(fs.readFileSync(path.join(staticFolder, usersdb), 'utf-8'));
        if (userlist.hasOwnProperty('user' + userid)){
            res.send(userlist['user' + userid]);
        } else {
            console.log('can`t find user');
        }
    } catch (e) {
        console.log('can`t read users');
    }    
    next();
})

app.delete('/users/:id', (req,res,next)=>{
    const userid = req.params.id;
    let userlist = {};
    try {
        userlist = JSON.parse(fs.readFileSync(path.join(staticFolder, usersdb), 'utf-8'));
        if (userlist.hasOwnProperty('user' + userid)){
            delete userlist['user' + userid];
            fs.writeFile(path.join(staticFolder, usersdb),JSON.stringify(userlist), (err)=>{
                if (err){
                    console.error(err);
                }
                    console.log('user was deleted');    
                });
        } else {
            console.log('can`t find user');
        }
    } catch (e) {
            console.log('can`t read users');
    }        
    next();
})



app.post('/users',(req, res, next)=>{
    const result = userScheme.validate(req.body);
    if (result.error){
        return res.status(404).send({error: result.error.details}); 
    }
    let uniqueId = 0;
    fs.readFile(path.join(staticFolder, usersdb), 'utf-8', (err, data)=>{
        let userlist = {};
        try {
            userlist = JSON.parse(data,'utf-8');
            uniqueId = userlist.maxid + 1;
        } catch (e) {
            console.log('empty userdb');
        }        
        if (!userlist.hasOwnProperty('user' + uniqueId.toString())){
            let newuser = {};
            newuser = JSON.parse(JSON.stringify(req.body,'utf-8'), 'utf-8');
            //console.log(newuser);
            //console.log(newuser.id);
            userlist.maxid = uniqueId;
            if (newuser.hasOwnProperty('id')){
                newuser.id = uniqueId;
            }
            userlist['user' + uniqueId.toString()] = newuser;
            fs.writeFile(path.join(staticFolder, usersdb),JSON.stringify(userlist), (err)=>{
                if (err){
                 console.error(err);
                }
                 console.log('user was added');    
             });
        }
    })
    next();   
})

app.put('/users/:id', (req,res,next)=>{
    const result = userScheme.validate(req.body);
    if (result.error){
        return res.status(404).send({error: result.error.details}); 
    }
    const userid = req.params.id;
    fs.readFile(path.join(staticFolder, usersdb), 'utf-8', (err, data)=>{
        let userlist = {};
        try {
            userlist = JSON.parse(data, 'utf-8');
            if (userlist.hasOwnProperty('user' + userid)){
                let updateduser = {};
                updateduser = userlist['user' + userid];
                updateduser.first_name = req.body.first_name;
                updateduser.second_name = req.body.second_name;
                updateduser.age = req.body.age;
                updateduser.city = req.body.city;
                userlist['user' + userid] = updateduser;
                console.log(userlist);
                fs.writeFile(path.join(staticFolder, usersdb),JSON.stringify(userlist), (err)=>{
                    if (err){
                     console.error(err);
                    }
                     console.log('user was updated');    
                 });
            } else {
                console.log('no user');
            }
        } catch (e) {
            console.log('no user');
        }        
        
    })
    next();
})

app.listen(http_port, ()=>{
    console.log(`Server started on port ${http_port}`);
});

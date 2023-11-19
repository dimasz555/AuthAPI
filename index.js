const express = require('express'),
    cors = require('cors'),
    app = express(),
    morgan = require('morgan'),
    PORT = process.env.PORT || 3000,
    router = require('./routes/index'),
    bodyParser  = require('body-parser');

require('dotenv').config()

// app.use(express.json({strict: false}))

// Menetapkan direktori statis
app.use(express.static('public'));

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(cors());
app.use(bodyParser.urlencoded({extended:true})); 

app.use(morgan('combined'));

app.use(router)

app.get('*', (req, res) => {
    return res.status(404).json({
        error: 'End point is not registered'
    })
})

app.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`)
})

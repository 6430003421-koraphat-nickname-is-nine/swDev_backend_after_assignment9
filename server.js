const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

const cookieParser = require('cookie-parser');

//load env vars
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

// Router file
const hospitals = require('./routes/hospitals');
const appointments = require('./routes/appointments');
const auth = require('./routes/auth');
const { version } = require('mongoose');

const app = express();

// Enable CORS
app.use(cors())


//Body parser
app.use(express.json());

// Cookie Parser

app.use(cookieParser());

// Sanitize Data 

app.use(mongoSanitize());

// Set security headers

app.use(helmet());

//prevent XSS attack

app.use(xss());

// Rate Limiting

const limiter = rateLimit({
    windowsMs : 10*60*1000,//10 mins
    max: 100
});

app.use(limiter)

// Prevent http param pollutions

app.use(hpp());

// Swagger

const swaggerOptions = {
    swaggerDefinition :{
        openapi : '3.0.0',
        info:{
            title:'Library API',
            version: '1.0.0',
            description :'A simple Express VacQ API'
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1'
            }
        ]
    },
    apis:['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs',swaggerUI.serve ,swaggerUI.setup(swaggerDocs));

// Mount routers
app.use('/api/v1/hospitals' , hospitals);
app.use('/api/v1/auth',auth);
app.use('/api/v1/appointments' , appointments);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT , console.log('Server running in ' , process.env.NODE_ENV , 'mode on port ', PORT));

// Handle unhandled promise rejections
process.on('unhandleRejection' , (err , promise) => {
    console.log(`ERROR: ${err.massage}`);
    // Close server & exit process
    server.close(() => process.exit(1)); // close server and program if error occurs
}
);
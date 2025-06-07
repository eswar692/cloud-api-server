const express = require('express');
const app = express();
app.use(express.json());
const cors = require('cors');
require('dotenv').config();

//app.use(cors());
const allowedOrigins = [
  'https://cloud-api-client-hd6byjmv3-yerubandi-eswara-prasads-projects.vercel.app',
  'https://cloud-api-client.vercel.app'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) {
        // allow requests with no origin (e.g., mobile apps, curl, Postman)
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);

const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
app.use(cookieParser());

const { connectRedis } = require('./utils/redisClient');

const webhookRoute = require('./routes/webhookRoute');
const userRoute = require('./routes/userRoutes');
const apiRoute = require('./routes/apiRoutes');
const fileRoute = require('./routes/userSideFileROute');
const { initSocket } = require('./utils/socket');
const contactRoute = require('./routes/contactRoutes');
const message = require('./routes/messageRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const agendaDefine = require('./job/define');
const agenda = require('./job/agend');
const autoReplyRoute = require('./routes/autoReplyRoutes');
const profileRoute = require('./routes/profileRoutes');
const forgotPasswordRoute = require('./routes/forgotPasswordRoutes');

app.use('/api', apiRoute);
app.use('/webhook', webhookRoute);
app.use('/user', userRoute);
app.use('/contact', contactRoute);
app.use('/file', fileRoute);
app.use('/message', message);
app.use('/payment', paymentRouter);
app.use('/auto-reply', autoReplyRoute);
app.use('/profile', profileRoute);
app.use('/forgot-password', forgotPasswordRoute);

cloudinary.v2.config({
  cloud_name: process.env.cloud_name,
  api_key: process.env.api_key,
  api_secret: process.env.api_secret
});

mongoose
  .connect(process.env.mongo_url)
  .then(() => console.log('Connected to DB!'))
  .catch((err) => console.log('DB Connection Error:', err));

// connectRedis();

// agenda

(async function () {
  await agendaDefine(agenda);

  await agenda.start();
  console.log('✅ Agenda is running...');
})();

const PORT = process.env.PORT || 80;
const server = app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server is running on port ${PORT}`)
);
initSocket(server);

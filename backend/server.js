const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const updatesRouter = require("./routes/updates.js");
const loginRouter = require("./routes/login.js");

require("dotenv").config();

const PORT = process.env.PORT || 5050;
const app = express();

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected successfully');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});

if (process.env.DEV_MODE) {
    app.use(cors({
        origin: 'http://localhost:5173',
    }));
}
else {
    //app.use(cors({
    //    origin: 'http://willbergforever.com',
    //}))
}
app.use(express.json());
app.use('/updates', updatesRouter);
app.use('/login', loginRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieparser = require('cookie-parser');

const updatesRouter = require("./routes/updates.js");
const adminRouter = require("./routes/admin.js");
const userRouter = require("./routes/user.js");

require("dotenv").config();

const PORT = process.env.PORT || 5050;
const app = express();

mongoose.connect(process.env.DEV_MODE ? process.env.DEV_MONGO_URI : process.env.MONGO_URI)
.then(() => {
    console.log('MongoDB connected successfully');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});

if (process.env.DEV_MODE) {
    app.use(cors({
        origin: true,
        credentials: true,
    }));
} else {
    app.use(cors({
        origin: (origin, callback) => {
            try {
                const host = (new URL(origin)).hostname;
                if (host == "willbergforever.com" || host.endsWith(".willbergforever.com")) {
                    callback(null, origin);
                } else {
                    callback(null);
                }
            } catch {
                callback(null);
            }
        },
        credentials: true,
    }));
}
app.use(express.json());
app.use(cookieparser());
app.use(express.urlencoded({ extended: false }));
app.use('/updates', updatesRouter);
app.use('/admin', adminRouter);
app.use('/user', userRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
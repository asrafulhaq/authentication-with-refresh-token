// allowed origin
const allowedOrigins = ["http://localhost:5050/", "http://localhost:5173/"];

// cors options
const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not Allowed by CORS"));
    }
  },
  credential: true,
  optionsSuccessStatus: 200,
};

// exports
module.exports = corsOptions;

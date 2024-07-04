require("dotenv").config();

let ENV = {
  PROD: {
    WEBSITE_URL: "https://front-chat-app-nine.vercel.app",
  },
  DEV: {
    WEBSITE_URL: "http://localhost:3000",
  },
};

module.exports = {
  WEBSITE_URL: `${ENV[process.env.STAGE].WEBSITE_URL}`,
};

const path = require("path");

require("dotenv").config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "development" ? ".development.env" : ".env"
  ),
});

module.exports = {
  env: {
    APP_NAME: process.env.APP_NAME,
    APP_URL_PREFIX: process.env.APP_URL_PREFIX,
    APP_IMAGE_URL: process.env.APP_IMAGE_URL,
    COPYRIGHT: process.env.COPYRIGHT,
    BEI_AN: process.env.BEI_AN,
    HOME_OG_IMAGE_URL: process.env.HOME_OG_IMAGE_URL,
  }
};

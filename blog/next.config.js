const path = require("path");

require("dotenv").config({
  path: path.resolve(
    process.cwd(),
    process.env.NODE_ENV === "development" ? ".env.development" : ".env"
  ),
});

module.exports = {
  env: {
    APP_NAME: process.env.APP_NAME,
    APP_URL_PREFIX: process.env.APP_URL_PREFIX,
    COPYRIGHT: process.env.COPYRIGHT,
    BEI_AN: process.env.BEI_AN,
    HOME_OG_IMAGE_URL: process.env.HOME_OG_IMAGE_URL,
  },
};

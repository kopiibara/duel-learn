const moment = require("moment-timezone");

const currentTimestamp = moment()
  .tz("Asia/Manila")
  .format("YYYY-MM-DD HH:mm:ss");

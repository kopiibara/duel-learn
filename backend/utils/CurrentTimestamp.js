const moment = require("moment-timezone");

const manilacurrentTimestamp = moment()
  .tz("Asia/Manila")
  .format("YYYY-MM-DD HH:mm:ss");

module.exports = manilacurrentTimestamp;

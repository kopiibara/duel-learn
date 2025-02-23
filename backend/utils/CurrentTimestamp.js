import moment from "moment-timezone";

const manilacurrentTimestamp = moment()
  .tz("Asia/Manila")
  .format("YYYY-MM-DD HH:mm:ss");

export default manilacurrentTimestamp;

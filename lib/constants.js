const WIN = "windows";
const RHEL = "rhel";
const SOL = "solaris";
const DB = "noe-db";
const DB_URL = process.env.DB_URL || "localhost";
const PLATFORMS_ARRAY = [WIN, RHEL, SOL];

module.exports = {
    WIN             : WIN,
    RHEL            : RHEL,
    SOL             : SOL,
    PLATFORMS_ARRAY : PLATFORMS_ARRAY,
    DB_NAME         : DB,
    DB_URL          : DB_URL
};
const WIN = "windows";
const RHEL = "rhel";
const SOL = "solaris";
const DB = process.env.DB_NAME || "noe-db";
const DB_USERNAME = process.env.DB_USERNAME || "user";
const DB_PASSWORD = process.env.DB_PASSWORD || "password";
const DB_PORT = process.env.MONGODB_SERVICE_PORT || "27017";
const DB_URL = process.env.MONGODB_SERVICE_HOST || "localhost";
const PLATFORMS_ARRAY = [WIN, RHEL, SOL];

module.exports = {
    WIN             : WIN,
    RHEL            : RHEL,
    SOL             : SOL,
    PLATFORMS_ARRAY : PLATFORMS_ARRAY,
    DB_NAME         : DB,
    DB_URL          : DB_URL,
    DB_USERNAME     : DB_USERNAME,
    DB_PORT         : DB_PORT,
    DB_PASSWORD     : DB_PASSWORD
};

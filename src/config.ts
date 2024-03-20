import dotenv from "dotenv";

import { LogLevel, LogTimeFormat, LogType } from "./logger";

const {
	name: APP_NAME,
	description: APP_DESCRIPTION,
	version: APP_VERSION,
	state: APP_STATE,
	author: APP_AUTHOR,
} = require("../package.json");

// Import the dotenv package to load environment variables from a .env file
dotenv.config();

// Create variables from the environment variables
const RENDER_PORT = +process.env.RENDER_PORT || 3001;
const RENDER_TIMEOUT = +process.env.RENDER_TIMEOUT || 60;
const RENDER_CONCURRENCY = +process.env.RENDER_CONCURRENCY || 5;
const RENDER_QUEUE_LIMIT = +process.env.RENDER_QUEUE_LIMIT || -1;
const RENDER_SCALE = +process.env.RENDER_SCALE || 1;
const RENDER_WIDTH = +process.env.RENDER_WIDTH || 768;
const RENDER_HEIGHT = +process.env.RENDER_HEIGHT || 1024;
const RENDER_TZ = process.env.RENDER_TZ || "Africa/Tunis";
const RENDER_AUTH_SECRET_TOKEN = process.env.RENDER_AUTH_SECRET_TOKEN || "-";

let LOG_LEVEL = (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
let LOG_TYPE = (process.env.LOG_TYPE as LogType) || LogType.CONTEXT;
let LOG_TIME_FORMAT = (process.env.LOG_TIME_FORMAT as LogTimeFormat) || "iso";

if (![LogLevel.DEBUG, LogLevel.INFO].includes(LOG_LEVEL)) {
	LOG_LEVEL = LogLevel.INFO;
}

if (![LogType.CONTEXT, LogType.JSON].includes(LOG_TYPE)) {
	LOG_TYPE = LogType.CONTEXT;
}

if (LOG_TIME_FORMAT === "iso") {
	LOG_TIME_FORMAT = "YYYY-MM-DD[T]HH:mm:ss.SSS[Z]";
}

// Export the variables
export default {
	APP_NAME,
	APP_DESCRIPTION,
	APP_VERSION,
	APP_STATE,
	APP_AUTHOR,

	RENDER_PORT,
	RENDER_TIMEOUT,
	RENDER_CONCURRENCY,
	RENDER_QUEUE_LIMIT,
	RENDER_SCALE,
	RENDER_WIDTH,
	RENDER_HEIGHT,
	RENDER_TZ,
	RENDER_AUTH_SECRET_TOKEN,

	LOG_LEVEL,
	LOG_TYPE,
	LOG_TIME_FORMAT,
};

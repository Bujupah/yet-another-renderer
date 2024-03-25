import dotenv from "dotenv";
import { env } from "process";
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
const RENDER_PORT = +env.RENDER_PORT || 3001;
const RENDER_TIMEOUT = +env.RENDER_TIMEOUT || 60;
const RENDER_CONCURRENCY = +env.RENDER_CONCURRENCY || 5;
const RENDER_QUEUE_LIMIT = +env.RENDER_QUEUE_LIMIT || -1;
const RENDER_SCALE = +env.RENDER_SCALE || 1;
const RENDER_WIDTH = +env.RENDER_WIDTH || 768;
const RENDER_HEIGHT = +env.RENDER_HEIGHT || 1024;
const RENDER_TZ = env.RENDER_TZ || "Africa/Tunis";
const RENDER_AUTH_SECRET_TOKEN = env.RENDER_AUTH_SECRET_TOKEN || "-";

const RENDER_BRANDING_IMAGE = env.RENDER_BRANDING_IMAGE;

const RENDER_PDF_COVER_TEMPLATE =
	env.RENDER_PDF_COVER_TEMPLATE || "assets/template/default_cover.html";

const RENDER_HEADER = env.RENDER_HEADER || "true";
const RENDER_HEADER_TIME = env.RENDER_HEADER_TIME || "true";
const RENDER_HEADER_CREATOR = env.RENDER_HEADER_CREATOR || "true";
const RENDER_HEADER_TIME_FORMAT =
	env.RENDER_HEADER_TIME_FORMAT || "YYYY/MM/DD HH:mm:ss z";

const RENDER_FOOTER = env.RENDER_FOOTER || "true";
const RENDER_FOOTER_TEXT =
	env.RENDER_FOOTER_TEXT ||
	`&copy; 2024 Yet-another-renderer. All rights reserved.`;

let LOG_LEVEL = (env.LOG_LEVEL as LogLevel) || LogLevel.INFO;
let LOG_TYPE = (env.LOG_TYPE as LogType) || LogType.CONTEXT;
let LOG_TIME_FORMAT = (env.LOG_TIME_FORMAT as LogTimeFormat) || "iso";

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

	RENDER_PDF_COVER_TEMPLATE,

	RENDER_HEADER,
	RENDER_HEADER_TIME,
	RENDER_HEADER_CREATOR,
	RENDER_HEADER_TIME_FORMAT,

	RENDER_FOOTER,
	RENDER_FOOTER_TEXT,

	RENDER_BRANDING_IMAGE,
	RENDER_AUTH_SECRET_TOKEN,

	LOG_LEVEL,
	LOG_TYPE,
	LOG_TIME_FORMAT,
};

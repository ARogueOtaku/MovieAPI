require("dotenv").config();
const fetch = require("node-fetch");

const getTMDBUrl = (netlifyEvent) => {
  const path = netlifyEvent.path.substring(29);
  if (typeof path !== "string" || path.length < 1) throw "No Path Specified!";
  const urlParams = new URLSearchParams(netlifyEvent.queryStringParameters).toString();
  const fullPath = `${process.env.TMDB_API_URL}/${path}?${urlParams}&api_key=${process.env.TMDB_API_KEY}`;
  return fullPath;
};

const validateRequest = (netlifyEvent) => {
  if (netlifyEvent.httpMethod !== "GET") throw "Only GET Requests Allowed";
  const allowedOrigins = process.env.allowedOrigins.split(process.env.delimeter || ";");
  if (!process.env.allowedOrigins.includes(netlifyEvent.headers.host)) throw "Uauthorized";
  return { "Access-Control-Allow-Origin": netlifyEvent.headers.host };
};

exports.handler = async (evt) => {
  let headers = { "Access-Control-Allow-Origin": evt.headers.host };
  try {
    headers = validateRequest(evt);
    const API_URL = getTMDBUrl(evt);
    const response = await fetch(API_URL);
    const data = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    console.log(err);
    return { statusCode: 400, headers, body: err.toString() };
  }
};

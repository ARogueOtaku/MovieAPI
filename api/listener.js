require("dotenv").config();
const fetch = require("node-fetch");

//Get TMDB API URL from Request Request URL
const getTMDBUrl = (netlifyEvent) => {
  const path = netlifyEvent.path.substring(29);
  if (typeof path !== "string" || path.length < 1) throw "No Path Specified!";
  const urlParams = new URLSearchParams(netlifyEvent.queryStringParameters).toString();
  const fullPath = `${process.env.TMDB_API_URL}/${path}?${urlParams}&api_key=${process.env.TMDB_API_KEY}`;
  return fullPath;
};

//Validate Request for HTTP Type and CORS
const validateRequest = (netlifyEvent) => {
  const validationResult = {
    err: undefined,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
  //Validate HTTP Method
  if (netlifyEvent.httpMethod !== "GET") {
    validationResult["err"] = "Only GET Allowed!";
    return validationResult;
  }

  //Validate Request Origin
  const origin = netlifyEvent.headers.origin;
  if (origin && typeof origin === "string") {
    const allowedOrigins = process.env.allowedOrigins.split(process.env.delimeter || ";");
    if (!allowedOrigins.includes(origin)) {
      validationResult["err"] = "Uauthorized";
      validationResult["headers"]["Access-Control-Allow-Origin"] = "";
      return validationResult;
    } else headers["Access-Control-Allow-Origin"] = origin;
  }
  return validationResult;
};

//API Request Handler
exports.handler = async (evt) => {
  const valResult = validateRequest(evt);
  console.log(evt);
  try {
    if (valResult["err"]) throw valResult["err"];
    const API_URL = getTMDBUrl(evt);
    const response = await fetch(API_URL);
    const data = await response.json();
    return { statusCode: 200, headers: valResult["headers"], body: JSON.stringify(data) };
  } catch (err) {
    console.log(err);
    return { statusCode: 400, headers: valResult["headers"], body: err.toString() };
  }
};

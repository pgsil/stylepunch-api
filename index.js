const express = require("express");
const app = express();
const fs = require("fs");
const http = require("http");
const https = require("https");

// const cloudStore = require("./gcloudapi").uploadFile;
const jsonDatabase = require("./data");

const PORT = "80";

const options = {
  ca: [fs.readFileSync(__dirname + "/certs/chain.pem")],
  cert: fs.readFileSync(__dirname + "/certs/cert.pem"),
  key: fs.readFileSync(__dirname + "/certs/privkey.pem")
};

const getStylesFromUrl = (styleString, database) => {
  const styles = styleString.split(",");
  
  const hasAllStyles = styles.every(style => database.includes(style));
  if (!hasAllStyles) {
    throw new Error("Bad input. One or more styles don't exist");
  }
  return styles.reduce((acc, val) => acc + val, '');
};

const writeNewStyle = (cssString, styleString) => {
  const filePath = styleString.split(",").join("") + ".css";

  fs.writeFileSync("./cached/" + filePath, cssString, err => {
    throw new Error(err);
  });

  return "/cached/" + filePath;
};

const uploadFileToCloud = filePath => {
  fs.readFileSync(filePath);
  cloudStore();
};

const createCss = (styleString, database) => {
  return writeNewStyle(getStylesFromUrl(styleString, database), styleString);
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(function(req, resp, next) {
  if (req.headers["x-forwarded-proto"] == "http") {
    return resp.redirect(301, "https://" + req.headers.host + "/");
  } else {
    return next();
  }
});

app.use(express.static("static"));

app.get("/styles/:styles", (req, res) => {
  if (req.params.styles.length > 0) {
    res.send("https://" + req.get("host") + createCss(req.params.styles, jsonDatabase));
  } else {
    res.sendStatus(500);
  }
});

app.get("/cached/:file", (req, res) => {
  res.set("Content-Type", "text/css");

  res.sendFile(__dirname + "/cached/" + req.params.file, err => {
    res.end();
  });
});

app.get("/list", (req, res) => res.sendFile(__dirname + "/data.json"));

app.get("/*", (req, res) => res.sendStatus(404));

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);

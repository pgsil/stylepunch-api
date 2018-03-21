const express = require("express");
const app = express();
const fs = require("fs");
const randStr = require("randomstring").generate;

const jsonDatabase = require("./data");

const getStylesFromUrl = (styleString, database) => {
  const styles = styleString.split(",");
  
  const hasAllStyles = styles.every(style => database.includes(style));
  if (!hasAllStyles) {
    throw new Error("Bad input. One or more styles don't exist");
  }
  return styles.reduce((acc, val) => acc + val, '');
};

const writeNewStyle = cssString => {
  const filePath = randStr(6) + ".css";

  fs.writeFileSync("./cached/" + filePath, cssString, err => {
    throw new Error(err);
  });

  return "/cached/" + filePath;
};

const createCss = (styleString, database) => {
  return writeNewStyle(getStylesFromUrl(styleString, database));
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/styles/:styles", (req, res) => {
  if (req.params.styles.length > 0) {
    res.send("https://" + req.get("host") + createCss(req.params.styles, jsonDatabase));
  } else {
    res.sendStatus(500);
  }
});

app.get("/cached/:file", (req, res) => {
  res.set("Content-Type", "text/css");
  res.sendFile(__dirname + "/cached/" + req.params.file);
});

app.get("/list", (req, res) => res.sendFile(__dirname + "/data.json"));

app.get("/*", (req, res) => res.sendStatus(404));

app.listen(process.env.PORT || 3000, () => console.log("Example app listening on port 3000!"));

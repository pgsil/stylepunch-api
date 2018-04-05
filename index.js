const express = require("express");
const app = express();
const fs = require("fs");
const randStr = require("randomstring").generate;
const https = require("https");

// const cloudStore = require("./gcloudapi").uploadFile;
const jsonDatabase = require("./data");

const PORT = "80";

const getStylesFromUrl = (styleString, database) => {
  const styles = styleString.split(",");

  let hasAllStyles = true;

  styles.forEach(element => {
    if (!(element in database)) {
      hasAllStyles = false;
      console.log(element + " not found");
    }
  });

  let styleCode = "";

  if (hasAllStyles) {
    styles.forEach(element => {
      styleCode = styleCode + database[element].code;
    });

    return styleCode;
  } else {
    throw new Error("Bad input. One or more styles don't exist");
  }
};

const writeNewStyle = cssString => {
  const filePath = randStr(6) + ".css";

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
  return writeNewStyle(getStylesFromUrl(styleString, database));
};

const options = {
  ca: [fs.readFileSync(__dirname + "/certs/ca_bundle.crt")],
  cert: fs.readFileSync(__dirname + "/certs/certificate.crt"),
  key: fs.readFileSync(__dirname + "/certs/private.key")
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

app.get("/.well-known/acme-challenge/:file", (req, res) => {
  res.sendFile(__dirname + "/.well-known/acme-challenge/" + req.params.file);
});

app.get("/*", (req, res) => res.sendStatus(404));

app.listen(PORT, () => console.log("Example app listening on port 3000!"));

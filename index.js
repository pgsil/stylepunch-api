const express = require("express");
const app = express();
const fs = require("fs");
const randStr = require("randomstring").generate;

const jsonDatabase = require("./data");

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

const createCss = (styleString, database) => {
  return writeNewStyle(getStylesFromUrl(styleString, database));
};

app.get("/styles/:styles", (req, res) => {
  if (req.params.styles.length > 0) {
    res.send(req.protocol + "://" + req.get("host") + createCss(req.params.styles, jsonDatabase));
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

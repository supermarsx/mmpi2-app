const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const fs = require("fs");
require("dotenv").config();
const app = express();
const port = 3e3;
const transport = {
  host: "a.mail.s--0.com",
  port: 25,
  secure: false,
  tls: {
    maxVersion: "TLSv1.3",
    minVersion: "TLSv1.2",
    ciphers: "TLS_AES_256_GCM_SHA384"
  },
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD
  }
};
const staticFolder = "dist";
const staticExtensions = ["html"];
app.use(
  express.static(staticFolder, {
    extensions: staticExtensions
  })
);
app.use(
  bodyParser.urlencoded(
    { extended: true }
  )
);
app.use(bodyParser.json());
const settingViewEngine = "view engine";
const settingViewEngineValue = "ejs";
app.set(settingViewEngine, settingViewEngineValue);
const transporter = nodemailer.createTransport(transport);
const emailTemplate = getEmailTemplate();
transporter.verify(function(error, success) {
  if (error) {
    console.error(error);
  } else {
    console.log("Ready to send mail", success);
  }
});
app.get("/", function(req, res) {
  res.redirect("/questionnaire");
});
app.get("/dashboard", function(req, res) {
  try {
    const keys = ["name", "dob", "age", "gender", "version", "answers"];
    const keysLength = keys.length;
    const bodyKeysLength = Object.keys(req.query).length;
    const reqHasAllkeys = hasAllKeys(req.query, keys) ? true : false;
    if (reqHasAllkeys === false)
      throw new Error("Doesnt have all keys");
    if (bodyKeysLength !== keysLength)
      throw new Error("Has a different amount of keys");
    const keysThreshold = {
      name: 200,
      dob: 50,
      age: 3,
      gender: 100,
      version: 20,
      answers: 1500
    };
    for (let key in keysThreshold) {
      const requestBodyKeyThreshold = keysThreshold[key];
      const requestBodyKeyLength = parseInt(req.query[key].length.toString());
      if (requestBodyKeyLength > requestBodyKeyThreshold)
        throw new Error(`Request body key ${key} surpassed the threshold`);
    }
    const name = req.query.name.toString();
    const dob = req.query.dob.toString();
    const age = req.query.age.toString();
    const gender = req.query.gender.toString();
    const version = req.query.version.toString();
    const answers = req.query.answers.toString();
    const dataToRender = {
      name,
      dob,
      age,
      gender,
      version,
      answers
    };
    console.log(dataToRender);
    res.render("dashboard", dataToRender);
  } catch (error) {
    failedRequest(error, res);
  }
});
app.post("/submission", function(req, res) {
  try {
    const keys = ["name", "dob", "age", "gender", "version", "answers"];
    const keysLength = keys.length;
    const bodyKeysLength = Object.keys(req.body).length;
    const reqHasAllkeys = hasAllKeys(req.body, keys) ? true : false;
    if (reqHasAllkeys === false)
      throw new Error("Doesnt have all keys");
    if (bodyKeysLength !== keysLength)
      throw new Error("Has a different amount of keys");
    const keysThreshold = {
      name: 200,
      dob: 50,
      age: 3,
      gender: 100,
      version: 20,
      answers: 1500
    };
    for (let key in keysThreshold) {
      const requestBodyKeyThreshold = keysThreshold[key];
      const requestBodyKeyLength = req.body[key].length;
      if (requestBodyKeyLength > requestBodyKeyThreshold)
        throw new Error(`Request body key ${key} surpassed the threshold`);
    }
    const name = req.body.name;
    const dob = req.body.dob;
    const age = req.body.age;
    const gender = req.body.gender;
    const version = req.body.version;
    const answers = req.body.answers;
    const mailOptions = getMailOptions({ name, dob, age, gender, version, answers });
    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        failedRequest(error, res);
      } else {
        console.log("Email sent:", info.response);
        res.status(200);
        res.json({ message: "Submitted with success" });
      }
    });
  } catch (error) {
    failedRequest(error, res);
  }
});
function failedRequest(message, res) {
  console.log(message);
  res.status(200);
  res.json({ message: "Failed request" });
}
function hasAllKeys(obj, keys) {
  return keys.every(function(key) {
    return obj.hasOwnProperty(key);
  });
}
function getMailOptions(keyObject) {
  const mailOptions = {
    from: "MMPI2 App <mmpi2-app@s--0.com>",
    to: "jms@s--0.com",
    subject: `${keyObject.name}, ${keyObject.age}`,
    html: setEmailTemplate(keyObject)
  };
  return mailOptions;
}
app.listen(port, function() {
  console.log(`Example app listening on port ${port}`);
});
function setEmailTemplate(keyObject) {
  let newEmail = emailTemplate.toString();
  for (let key in keyObject) {
    const keyToReplace = RegExp(`%${key.toUpperCase()}%`, "g");
    const value = keyObject[key];
    newEmail = newEmail.replace(keyToReplace, value);
  }
  return newEmail;
}
function getEmailTemplate() {
  console.log("Loading email template");
  const filePath = "./source/emailTemplate.html";
  let emailTemplate2 = fs.readFileSync(filePath, "utf-8").toString();
  return emailTemplate2;
}

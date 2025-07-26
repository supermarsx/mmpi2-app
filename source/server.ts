import express = require('express');
import bodyParser = require('body-parser');
import nodemailer = require('nodemailer');
import fs = require('fs');

require('dotenv').config();

const app = express();
const port: number = 3000;

const transport: object = {
    host: process.env.SMTP_SERVER,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    tls: {
        maxVersion: 'TLSv1.3',
        minVersion: 'TLSv1.2',
        ciphers: 'TLS_AES_256_GCM_SHA384'
    },
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
};

const staticFolder: string = 'dist';
const staticExtensions: Array<string> = ['html'];
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

const settingViewEngine: string = 'view engine';
const settingViewEngineValue: string = 'ejs';
app.set(settingViewEngine, settingViewEngineValue);

const transporter = nodemailer.createTransport(transport);

const emailTemplate = getEmailTemplate();

transporter.verify(function (error, success): void {
    if (error) {
        console.error(error)
    } else {
        console.log('Ready to send mail.', success)
    }
});

// @ts-ignore
app.get('/', function (req, res): void {
    res.redirect('/questionnaire');
});

app.get('/dashboard', function (req, res): void {
    try {
        const keys: Array<string> = ['name', 'dob', 'age', 'gender', 'version', 'answers'];
        const keysLength: number = keys.length;
        const bodyKeysLength: number = Object.keys(req.query).length;
        const reqHasAllkeys: boolean = hasAllKeys(req.query, keys) ? true : false;
        if (reqHasAllkeys === false) throw new Error('Doesn\'t have all keys.');
        if (bodyKeysLength !== keysLength) throw new Error('Has a different amount of keys.');
        const keysThreshold: object = {
            name: 200,
            dob: 50,
            age: 3,
            gender: 100,
            version: 20,
            answers: 1500
        };
        for (let key in keysThreshold) {
            const requestBodyKeyThreshold: number = keysThreshold[key];
            const requestBodyKeyLength: number = parseInt(req.query[key].length.toString());
            if (requestBodyKeyLength > requestBodyKeyThreshold) throw new Error(`Request body key ${key} surpassed the threshold.`);
        }

        const name: string = req.query.name.toString();
        const dob: string = req.query.dob.toString();
        const age: string = req.query.age.toString();
        const gender: string = req.query.gender.toString();
        const version: string = req.query.version.toString();
        const answers: string = req.query.answers.toString();
        const dataToRender: object = {
            name,
            dob,
            age,
            gender,
            version,
            answers
        };

        console.log(dataToRender);

        res.render('dashboard', dataToRender);
    } catch (error) {
        failedRequest(error, res);
    }
});

// @ts-ignore
app.post('/submission', function (req, res): void {
    try {
        const keys: Array<string> = ['name', 'dob', 'age', 'gender', 'version', 'answers'];
        const keysLength: number = keys.length;
        const bodyKeysLength: number = Object.keys(req.body).length;
        const reqHasAllkeys: boolean = hasAllKeys(req.body, keys) ? true : false;
        if (reqHasAllkeys === false) throw new Error('Doesn\'t have all keys.');
        if (bodyKeysLength !== keysLength) throw new Error('Has a different amount of keys.');
        const keysThreshold: object = {
            name: 200,
            dob: 50,
            age: 3,
            gender: 100,
            version: 20,
            answers: 1500
        };
        for (let key in keysThreshold) {
            const requestBodyKeyThreshold: number = keysThreshold[key];
            const requestBodyKeyLength: number = req.body[key].length;
            if (requestBodyKeyLength > requestBodyKeyThreshold) throw new Error(`Request body key ${key} surpassed the threshold.`);
        }

        const name: string = req.body.name;
        const dob: string = req.body.dob;
        const age: string = req.body.age;
        const gender: string = req.body.gender;
        const version: string = req.body.version;
        const answers: string = req.body.answers;

        const mailOptions: object = getMailOptions({ name, dob, age, gender, version, answers });

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                failedRequest(error, res);
            } else {
                console.log('Email sent:', info.response);
                res.status(200);
                res.json({ message: 'Submitted with success' });
            }
        });
    } catch (error) {
        failedRequest(error, res);
    }
});

// On failed request
function failedRequest(message, res): void {
    console.log(message);
    res.status(200);
    res.json({ message: 'Failed request' });
}

// Check all keys in an object
function hasAllKeys(obj, keys): boolean {
    return keys.every(function (key): boolean { return obj.hasOwnProperty(key) });
}

// Get mail options to send results
function getMailOptions(keyObject): object {
    const mailOptions: object = {
        from: process.env.NOTIFICATION_FROM,
        to: process.env.NOTIFICATION_RECIPIENT,
        subject: `${keyObject.name}, ${keyObject.age}`,
        html: setEmailTemplate(keyObject)
    };
    return mailOptions;
}

app.listen(port, function (): void {
    console.log(`Example app listening on port ${port}`);
});

// Set email template to send
function setEmailTemplate(keyObject): string {
    let newEmail = emailTemplate.toString();

    for (let key in keyObject) {
        const keyToReplace: RegExp = RegExp(`%${key.toUpperCase()}%`, 'g');
        const value: string = keyObject[key];
        newEmail = newEmail.replace(keyToReplace, value);
    }
    return newEmail;
}

// Get email template
function getEmailTemplate(): string {
    console.log('Loading email template');
    const filePath: string = './source/emailTemplate.html';
    let emailTemplate: string = fs.readFileSync(filePath, 'utf-8').toString();
    return emailTemplate;
}

import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import config from "../config";

export const SUPPORT_EMAIL = `Fin Tea Support <${config.zoho.user}>`;

const transporter = nodemailer.createTransport({
	service: "Zoho",
	auth: {
		user: config.zoho.user,
		pass: config.zoho.password
	}
});

 async function readTemplate(name) {
    const template = await fs.promises.readFile(path.join(__dirname, `../templates/${name}.html`), "utf8");
    return handlebars.compile(template);
}

export function sendMail({ from, to, subject, template, context, text }) {

    return new Promise(async(resolve, reject) => {
        const compiledTemplate = await readTemplate(template);
        const html = compiledTemplate(context);
        transporter.sendMail({ from, to, subject, html, text}, (err, info) => {
            if (err) {
                reject(err);
            } else {
                resolve(info);
            }
        })
    });

}


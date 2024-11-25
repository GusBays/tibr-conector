import * as fs from 'fs'
import Handlebars from 'handlebars'
import * as Nodemailer from 'nodemailer'
import { Transporter } from 'nodemailer'
import hbs, { NodemailerExpressHandlebarsOptions } from 'nodemailer-express-handlebars'
import { resolve } from 'path'

export interface NotificationData {
    to: string
    cc?: string
    subject: string
    templatePath: string
    context: Record<string, any>
}

export class Notification {
    static transporter: Transporter

    static async send(data: NotificationData): Promise<void> {
        if (!this.transporter) this.getTransporter()

        this.transporter.use('compile', hbs(this.getTemplateOptions(data)))

        await this.transporter.sendMail(this.getOptionsFrom(data))
    }

    static render(data: NotificationData): string {
        const helpers = this.getHelpers(data)

        const register = ({ name, helper }: { name: string; helper: (...args: any) => any }) =>
            Handlebars.registerHelper(name, helper)
        helpers.forEach(register)

        const templatePath = resolve('src', 'common', 'notification', 'infra', 'handlebars', `${data.templatePath}.hbs`)
        const templateSource = fs.readFileSync(templatePath, 'utf-8')

        const partialsPath = resolve('src', 'common', 'notification', 'infra', 'handlebars', 'partials')
        const partialFiles = fs.readdirSync(partialsPath)

        partialFiles.forEach(file => {
            if (file.endsWith('.hbs')) {
                const partialName = file.replace('.hbs', '')
                const partialSource = fs.readFileSync(resolve(partialsPath, file), 'utf-8')
                Handlebars.registerPartial(partialName, partialSource)
            }
        })

        const template = Handlebars.compile(templateSource)
        return template(data.context)
    }

    private static getTemplateOptions(data: NotificationData): NodemailerExpressHandlebarsOptions {
        return {
            viewEngine: {
                extname: '.hbs',
                partialsDir: resolve('src', 'common', 'notification', 'infra', 'handlebars', 'partials'),
                layoutsDir: resolve('src', 'common', 'notification', 'infra', 'handlebars'),
                defaultLayout: '',
                helpers: this.getHelpers(data).map(h => h.helper) as unknown as Record<string, unknown>
            },
            viewPath: resolve('src', 'common', 'notification', 'infra', 'handlebars', data.templatePath),
            extName: '.hbs'
        }
    }

    private static getOptionsFrom(data: NotificationData): Record<string, any> {
        return {
            from: {
                name: 'TI BR Connector',
                address: process.env.MAIL_FROM
            },
            to: data.to,
            cc: data.cc,
            subject: data.subject,
            template: data.templatePath,
            context: data.context
        }
    }

    private static getTransporter(): void {
        this.transporter = Nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASSWORD
            }
        })
    }

    private static getHelpers(data: NotificationData): Array<{ name: string; helper: (...args: any) => any }> {
        return [
            {
                name: 'capitalize',
                helper: (str: string) => str.charAt(0).toUpperCase() + str.slice(1)
            },
            {
                name: 'formatDate',
                helper: (date: string) => {
                    const dateInstance = new Date(date)
                    return `${dateInstance.getDate()}/${dateInstance.getMonth()}/${dateInstance.getFullYear()} ${dateInstance.getHours()}:${dateInstance.getMinutes()}:${dateInstance.getSeconds()}`
                }
            },
            {
                name: 'eq',
                helper: (a: any, b: any, options: Handlebars.HelperOptions) =>
                    a === b ? options.fn(data.context) : options.inverse(data.context)
            },
            {
                name: 'getAdminUrl',
                helper: () => process.env.ADMIN_URL
            }
        ]
    }
}

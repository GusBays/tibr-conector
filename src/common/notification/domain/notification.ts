import * as fs from 'fs'
import Handlebars from 'handlebars'
import { resolve } from 'path'

export interface NotificationData {
    to: string
    cc?: string[]
    subject: string
    templatePath: string
    context: Record<string, any>
}

export class Notification {
    static async send(data: NotificationData): Promise<void> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`
        }

        const body = JSON.stringify({
            from: process.env.MAIL_FROM,
            to: [data.to],
            subject: data.subject,
            html: this.render(data)
        })

        const res = await fetch(`${process.env.RESEND_API_BASE_URL}/emails`, {
            method: 'POST',
            headers,
            body
        })

        const json = await res.json()

        if (!res.ok) {
            console.error('Notification.send:error', JSON.stringify({ data, response: { json, status: res.status } }))
        }
    }

    static render(data: NotificationData): string {
        const register = ({ name, helper }) => Handlebars.registerHelper(name, helper)
        this.getHelpers(data).forEach(register)

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

    private static getHelpers(data: NotificationData): Array<{ name: string; helper: (...args: any) => any }> {
        return [
            {
                name: 'capitalize',
                helper: (str: string) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : '')
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

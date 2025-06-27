import fs, { createReadStream } from 'fs'
import { dirname, extname, join } from 'path'
import { AxiosRequest } from '../../http/domain/axios/axios-request'

export class FileSystem {
    static async save(data: string, path: string): Promise<string> {
        const appUrl = process.env.APP_URL

        if (data.includes(appUrl)) {
            const path = data.replace(`${appUrl}/`, '')
            return `media://${path}`
        } else if (data.includes('media://')) return data

        const { file, ext } = await this.getFileBy(data)

        const dir = join(process.cwd(), 'public', dirname(path))
        this.createDirIfNotExists(dir)

        const fullPath = join(process.cwd(), 'public', path + ext)

        if (this.exists(fullPath)) await this.delete(fullPath)

        await new Promise<void>((resolve, reject) => {
            const stream = fs.createWriteStream(fullPath)

            file.pipe(stream)

            stream.on('finish', () => resolve())
            stream.on('error', reject)
        })

        return `media://${path + ext}`
    }

    static async get(path: string): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            const fullPath = join(process.cwd(), 'public', path)

            fs.readFile(fullPath, (err, data) => {
                if (err) reject(err)
                resolve(data)
            })
        })
    }

    static delete(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const fullPath = join(process.cwd(), 'public', path)

            fs.unlink(fullPath, err => {
                if (err) reject(err)
                resolve()
            })
        })
    }

    private static createDirIfNotExists(dir: string): void {
        if (fs.existsSync(dir)) return

        fs.mkdirSync(dir, { recursive: true })
    }

    private static async getFileBy(data: string): Promise<{ file: NodeJS.ReadableStream; ext: string }> {
        const url = /^(https?:\/\/)?([a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+.*)$/

        let file: NodeJS.ReadableStream
        let ext: string

        if (url.test(data)) {
            const request = new AxiosRequest({})
            file = await request.get(data, { responseType: 'stream' })
            ext = extname(new URL(data).pathname)
        } else {
            file = createReadStream(data)
            ext = extname(data)
        }

        return { file, ext }
    }

    private static exists(path: string): boolean {
        return fs.existsSync(path)
    }
}

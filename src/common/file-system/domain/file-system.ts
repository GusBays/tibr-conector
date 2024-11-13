import fs from 'fs'
import { dirname, join } from 'path'

export class FileSystem {
    static async save(data: NodeJS.ArrayBufferView, path: string): Promise<void> {
        const dir = join(process.cwd(), 'public', dirname(path))
        this.createDirIfNotExists(dir)

        const fullPath = join(process.cwd(), 'public', path)

        try {
            fs.writeFileSync(fullPath, data)
        } catch (e) {}
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

    private static createDirIfNotExists(dir: string): void {
        if (fs.existsSync(dir)) return

        fs.mkdirSync(dir, { recursive: true })
    }
}

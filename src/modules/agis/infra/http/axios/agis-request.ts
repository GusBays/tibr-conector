import { AxiosRequest } from '../../../../../common/http/domain/axios/axios-request'

export class AgisRequest extends AxiosRequest {
    constructor(token: string) {
        super({
            baseURL: process.env.AGIS_API_URL,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
    }
}

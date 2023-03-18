import { IntegrationBase } from "@budibase/types";
import fetch from "node-fetch";
import {Md5} from 'ts-md5/dist/md5';

interface Query {
    method: string
    body?: string
    headers?: { [key: string]: string }
}

class CustomIntegration implements IntegrationBase {
    private readonly host: string;
    private readonly token: string;
    private readonly tokenExpire: number;
    private readonly projectGuid: string;
    private readonly appKey: string;
    private readonly appSecret: string;

    constructor(config: { token: string, tokenExpire: number, projectGuid: string, appKey: string, appSecret: string}) {
        this.host = 'https://wo-api.uni-ubi.com';
        this.token = config.token;
        this.tokenExpire = config.tokenExpire;
        this.projectGuid = config.projectGuid;
        this.appKey = config.appKey;
        this.appSecret = config.appSecret;
    }

    async request(url: string, opts: Query) {
        // const token = { "X-N8N-API-KEY": this.token }
        // opts.headers = opts.headers ? { ...opts.headers, ...token } : token
        const response = await fetch(url, opts)
        if (response.status <= 300) {
            try {
                const contentType = response.headers.get("content-type")
                if (contentType?.includes("json")) {
                    return await response.json()
                } else {
                    return await response.text()
                }
            } catch (err) {
                return await response.text()
            }
        } else {
            const err = await response.text()
            throw new Error(err)
        }
    }

    async RequestToken() {
        const timestamp = new Date().getTime()
        const opts = {
            method: "POST",
            body: JSON.stringify({
                appKey: this.appKey,
                timestamp,
                sign: Md5.hashStr(this.appKey + timestamp + this.appSecret).toUpperCase()

            }),
            headers: {
                "Content-Type": "application/json",
            },
        }
        return this.request(`${this.host}/v1/${this.projectGuid}`, opts)

    }

    // async CreatePerson(query: { json: object }) {
    //     const opts = {
    //         method: "POST",
    //         body: JSON.stringify(query.json),
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //     }
    //     return this.request(`${this.host}/api/v1/workflows`, opts)
    // }

    // async read(query: { id: number, active: string, tags: string, limit: number, cursor: string }) {
    //     const opts = {
    //         method: "GET",
    //     }
    //     if (query.id > -1) {
    //         return this.request(`${this.host}/api/v1/workflows/${query.id}`, opts)
    //     }
    //     let queryParams = ""
    //     if (query.active) {
    //         queryParams += `&active=${query.active}`
    //     }
    //     if (query.tags) {
    //         queryParams += `&tags=${query.tags}`
    //     }
    //     if (query.limit) {
    //         queryParams += `&limit=${query.limit}`
    //     }
    //     if (query.cursor) {
    //         queryParams += `&cursor=${query.cursor}`
    //     }
    //     return this.request(`${this.host}/api/v1/workflows?${queryParams}`, opts)
    // }

    // async read(query: { page: number, pageSize: number, tags: string, limit: number, cursor: string }) {
    //     const { page, pageSize } = query;
    //     const opts = {
    //         method: "POST",
    //         body: JSON.stringify({
    //             index: page,
    //             length: pageSize,
    //         }),
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //     }
    //     return this.request(`${this.host}/v2/admit/page`, opts)
    // }

    // async update(query: { id: string, body: string }) {
    //     const opts = {
    //         method: "PUT",
    //         body: query.body,
    //         headers: {
    //             "Content-Type": "application/json",
    //         },
    //     }
    //     return this.request(`${this.host}/api/v1/workflows/${query.id}`, opts)
    // }

    // async delete(query: { id: string }) {
    //     const opts = {
    //         method: "DELETE",
    //     }
    //     return this.request(`${this.host}/api/v1/workflows/${query.id}`, opts)
    // }

    // async activate(query: { id: string, active: string }) {
    //     const opts = {
    //         method: "POST",
    //     }
    //     if (query.active === "true") {
    //         return this.request(`${this.host}/api/v1/workflows/${query.id}/activate`, opts)
    //     }
    //     if (query.active === "false") {
    //         return this.request(`${this.host}/api/v1/workflows/${query.id}/deactivate`, opts)
    //     }
    //     throw new Error("Active must be 'true' or 'false'")
    // }
}

export default CustomIntegration

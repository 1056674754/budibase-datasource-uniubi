import { IntegrationBase } from "@budibase/types";
import fetch from "node-fetch";
import {Md5} from 'ts-md5/dist/md5';

interface Query {
    method: string
    body?: string
    headers?: { [key: string]: string }
}

class CustomIntegration implements IntegrationBase {
    private token: string | undefined;
    private tokenExpire: number | undefined;
    private readonly host: string;
    private readonly projectGuid: string;
    private readonly appKey: string;
    private readonly appSecret: string;

    constructor(config: { projectGuid: string, appKey: string, appSecret: string}) {
        this.host = 'https://wo-api.uni-ubi.com';
        this.token = undefined;
        this.tokenExpire = undefined;
        this.projectGuid = config.projectGuid;
        this.appKey = config.appKey;
        this.appSecret = config.appSecret;
    }

    async request(url: string, opts: Query) {
        if (!this.token || !this.tokenExpire || this.tokenExpire! <= new Date().getTime()) {
            this.tokenExpire = new Date().getTime() + 1800 * 1000;
            const response = await this.requestToken();
            const res = await response.json();
            this.token = res.data;
        }

        const token = { 
            token: this.token as string,
            projectGuid: this.projectGuid,
        };

        opts.headers = opts.headers ? { ...opts.headers, ...token } : token;

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

    async requestToken() {
        const timestamp = new Date().getTime()
        const opts = {
            method: "GET",
            // body: JSON.stringify({

            // }),
            headers: {
                appKey: this.appKey,
                timestamp,
                sign: Md5.hashStr(this.appKey + timestamp + this.appSecret),//.toUpperCase()
            },
        }
        let resp = fetch(`${this.host}/v1/${this.projectGuid}/auth`, opts as any);

        return resp
    }

    async accessToken() {
        let resp = await this.requestToken();
        return await resp.json();
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

    async read(query: { page: number, pageSize: number }) {
        const { page, pageSize } = query;
        const opts = {
            method: "POST",
            body: JSON.stringify({
                index: page,
                length: pageSize,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }
        return this.request(`${this.host}/v2/admit/page`, opts)
    }

    async getAll() {
        let page = 1;
        let pageSize = 100;
        let tries = 100;

        const opts = {
            method: "POST",
            body: JSON.stringify({
                index: page,
                length: pageSize,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        }
        let result: any[] = [];
        let realPageSize = 0;
        while (tries > 0 && (realPageSize == 0 || realPageSize == pageSize) ) {
            tries -= 1;
            let resp = await this.request(`${this.host}/v2/admit/page`, opts);
            let content = resp.data.content;
            realPageSize = resp.data.length;
            result.push(content);
        }

        return result;
    }

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

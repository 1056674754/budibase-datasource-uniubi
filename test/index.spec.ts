import { default as HTTP } from "../src"
import { describe, it, beforeAll, expect } from "@jest/globals"

describe("test the query types", () => {
    let integration: any
    beforeAll(() => {
        integration = new HTTP.integration({ 
            appKey: '8A6409264DF94309966A69EABFF861AC',
            appSecret: '606FDD8389AA4277A0DA18FCBF4B730D',
            projectGuid: 'E1D72AE22B2C4C089384C492C6B8295C',
        })
    })

    async function catchError(cb: any) {
        let error: any
        try {
            await cb()
        } catch (err: any) {
            error = err.message
        }
        expect(error).not.toBeNull()
    }

    it("should run the create query", async () => {
        await catchError(() => {
            return integration.create({
                json: { a: 1 }
            })
        })
    })


    it("should run the create query", async () => {
        await catchError(() => {
            return integration.create({
                json: { a: 1 }
            })
        })
    })

    it("should run the read query", async () => {
        const response = await integration.read({
            queryString: "a=1"
        })
        expect(typeof response).toBe("string")
    })

    it("should run the update query", async () => {
        await catchError(() => {
            return integration.update({
                json: { a: 1 }
            })
        })
    })

    it("should run the delete query", async () => {
        await catchError(() => {
            return integration.delete({
                id: 1
            })
        })
    })
})
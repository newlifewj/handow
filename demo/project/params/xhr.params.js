'use strict';

/**
 * Global parameters for URLs
 */

module.exports = {
    HTTP200: 200,
    HTTP201: 201,
    HTTP400: 400,
    HTTP401: 401,
    HTTP403: 403,
    HTTP404: 404,
    // It is a axios config object, consumed by axios.request(config) API
    // https://github.com/axios/axios
    GetVersionAPI: {
        method: "GET",
        url: "/info",
        baseURL: "https://localhost:8080/api",
        params: {
            page: 1,
            size: 25
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    },

    GetVersionData: {
        data: {
            session: {
                profile: "Admain User111"
            }
        },
        status: {
            statusCode: 200000
        }
    },

    WrongURLAPI: {
        method: "GET",
        url: "/notexisted",
        baseURL: "https://localhost:8080/api",
        params: {
            page: 1,
            size: 25
        },
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    },

    WrongURLResponse: {
        status: {
            statusCode: 404000
        }
    },

    UpdateProfileAPI: {
        method: "PUT",
        url: "/profile",
        data: {
            username: "Mark"
        }
    }
};
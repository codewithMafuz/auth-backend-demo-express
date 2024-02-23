export const httpStatusCodes = {
    GET: {
        OK: 200,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },
    POST: {
        CREATED: 201,
        NO_CONTENT: 204,
        INTERNAL_SERVER_ERROR: 500,
    },
    PUT: {
        OK: 200,
        NO_CONTENT: 204,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },
    PATCH: {
        OK: 200,
        NO_CONTENT: 204,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },
    DELETE: {
        NO_CONTENT: 204,
        OK: 200,
        NOT_FOUND: 404,
        INTERNAL_SERVER_ERROR: 500,
    },
};
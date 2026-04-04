/**
 * A collection of standard HTTP status codes used across the application.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Status | MDN HTTP Status Codes}
 *
 * @example
 * if (response.status === HttpStatusCode.NOT_FOUND) {
 *   console.error('Resource not found');
 * }
 */
export const HttpStatusCode = {
	/** The request was successful. */
	OK: 200,
	/** The request was successful and a new resource was created. */
	CREATED: 201,
	/** The request was successful but there is no content to return. */
	NO_CONTENT: 204,
	/** The requested resource has been permanently moved to a new URL. */
	MOVED: 301,
	/** The requested resource has been temporarily moved to a different URL. */
	FOUND: 302,
	/** The resource has not been modified since the last request. */
	NOT_MODIFIED: 304,
	/** The server could not understand the request due to invalid syntax. */
	BAD_REQUEST: 400,
	/** Authentication is required and has failed or has not been provided. */
	UNAUTHORIZED: 401,
	/** The client does not have permission to access the requested resource. */
	FORBIDDEN: 403,
	/** The requested resource could not be found on the server. */
	NOT_FOUND: 404,
	/** The HTTP method used is not allowed for the requested resource. */
	NOT_ALLOWED: 405,
	/** The server timed out waiting for the request. */
	REQUEST_TIMEOUT: 408,
	/** The client has sent too many requests in a given amount of time. */
	TOO_MANY_REQUESTS: 429,
	/** The server encountered an unexpected error and could not complete the request. */
	INTERNAL_SERVER_ERROR: 500,
	/** The server does not support the functionality required to fulfill the request. */
	NOT_IMPLEMENTED: 501,
	/** The server received an invalid response from an upstream server. */
	BAD_GATEWAY: 502,
} as const

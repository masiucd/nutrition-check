import {jwtVerify, SignJWT} from "jose"

// TODO:
const secret = new TextEncoder().encode("super-secret")

export function createToken(userId: number, expireTime = "1h") {
	return new SignJWT({userId})
		.setProtectedHeader({alg: "HS256"})
		.setExpirationTime(expireTime)
		.sign(secret)
}

export function verifyToken(token: string) {
	return jwtVerify(token, secret)
}

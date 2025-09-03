export interface TokenPayload {
  uid: number,
  name: string,
  email: string,
  iat?: number,
  exp?: number,
}
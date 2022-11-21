import { Buffer } from 'buffer'

/*
taken from
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent
to address special characters
*/
export function fixedEncodeURIComponent (str: string) {
  return encodeURIComponent(str).replace(
    /[~!'()*_%]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  )
}
export function decodeFixedURIComponent (str: string) {
  return decodeURIComponent(str)
}
export function encodeURIComponentAndCovertToBase64 (str: string) {
  return Buffer.from(encodeURIComponent(str)).toString('base64')
}
export function decodeBase64String (str: string) {
  return decodeFixedURIComponent(Buffer.from(str, 'base64').toString('ascii'))

}
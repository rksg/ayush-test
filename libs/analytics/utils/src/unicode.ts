export function decodeUnicode (str:string){
  return JSON.parse(`"${str}"`)
}
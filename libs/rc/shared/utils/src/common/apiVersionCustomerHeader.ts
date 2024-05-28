export const enum ApiVersionEnum {
  v1 = 'v1',
  v1_1 = 'v1.1',
  v2 = 'v2'
}


export function GetApiVersionHeader (version: ApiVersionEnum | undefined) {
  if (!version) return undefined

  const contentType = `application/vnd.ruckus.${version}+json`
  const apiCustomHeader = {
    'Content-Type': contentType,
    'Accept': contentType
  }

  return apiCustomHeader
}
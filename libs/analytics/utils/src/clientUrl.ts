
export const getClientUrlWithHostname = (
  rawMac: string | string[],
  rawHostname?: string | string[],
  period?: string,
  tab='overview'
) => {
  let mac: string, hostname: string
  if (Array.isArray(rawMac)) {
    mac = rawMac?.[0]?.toLocaleLowerCase()
  } else {
    mac = rawMac
  }

  if (Array.isArray(rawHostname)) {
    hostname = `hostname=${rawHostname.filter(h => h !== mac).join(', ')}`
  } else if (rawHostname) {
    hostname = rawHostname
  } else {
    hostname = ''
  }

  const baseLink = `users/wifi/clients/${mac}/details/${tab}`
  const searchParams = [hostname]

  if (period) {
    searchParams.filter(Boolean).push(`period=${period}`)
  }

  return baseLink + '?' + searchParams.join('&')
}

export const getClientUrlWithHostname = (
  rawMac: string | string[],
  rawHostname?: string | string[],
  period?: string,
  tab='overview'
) => {
  let mac: string
  const searchParams: string[] = []

  if (Array.isArray(rawMac)) {
    mac = rawMac?.[0]?.toLocaleLowerCase()
  } else {
    mac = rawMac.toLocaleLowerCase()
  }

  if (Array.isArray(rawHostname)) {
    searchParams.push(`hostname=${rawHostname
      .filter(h => h.toLocaleLowerCase() !== mac)
      .join(', ')}`)
  } else if (typeof rawHostname === 'string') {
    searchParams.push(`hostname=${rawHostname}`)
  }

  let baseLink = `users/wifi/clients/${mac}/details/${tab}`

  if (period) {
    searchParams.push(`period=${period}`)
  }

  return searchParams.length > 0
    ? baseLink + '?' + searchParams.join('&')
    : baseLink
}
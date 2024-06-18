import { useEffect, useState } from 'react'

import { useLocation } from '@acx-ui/react-router-dom'

export const DOCS_HOME_URL = 'https://docs.cloud.ruckuswireless.com'

//for Local test, use '/docs/ruckusone/userguide/mapfile/doc-mapper.json'
export const getDocsMappingURL = (isMspUser:boolean) =>
  process.env['NODE_ENV'] === 'development'
    // eslint-disable-next-line max-len
    ? isMspUser ? '/docs/ruckusone/mspguide/mapfile/doc-mapper.json':'/docs/ruckusone/userguide/mapfile/doc-mapper.json'
    // eslint-disable-next-line max-len
    : isMspUser ? 'https://docs.cloud.ruckuswireless.com/ruckusone/mspguide/mapfile/doc-mapper.json' : 'https://docs.cloud.ruckuswireless.com/ruckusone/userguide/mapfile/doc-mapper.json'

// for local test, use '/docs/ruckusone/userguide/'
export const getDocsURL = (isMspUser:boolean) =>
  process.env['NODE_ENV'] === 'development'
    ? isMspUser ? '/docs/ruckusone/mspguide/':'/docs/ruckusone/userguide/'
    // eslint-disable-next-line max-len
    : isMspUser ? 'https://docs.cloud.ruckuswireless.com/ruckusone/mspguide/':'https://docs.cloud.ruckuswireless.com/ruckusone/userguide/'

export const fetchDocsURLMapping = async (
  basePath: string,
  showError: () => void,
  isMspUser:boolean
) => {
  let result = await fetch(getDocsMappingURL(isMspUser), {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    }
  })

  if(!result.ok){
    showError()
    return
  }

  result = await result.json()
  const mapKey = Object.keys(result).find(item => basePath === item)
  return result[mapKey as keyof typeof result]
}

export const useHelpPageLink = () => {
  const location = useLocation()
  const [helpUrl, setHelpUrl] = useState<string|undefined>(undefined)
  const [, tenantType, pathname] = location.pathname.match(/^\/[a-f0-9]{32}\/(v|t)\/(.+)$/) || []
  const isMspPage = tenantType === 'v'
  const basePath = pathname?.replaceAll(/([A-Z0-9]{11,})|([0-9a-fA-F]{1,2}[:]){5}([0-9a-fA-F]{1,2})|([a-f-\d]{32,36}|[A-F-\d]{32,36})|([a-zA-Z0-9+\=]{84})|\d+/g, '*') // eslint-disable-line max-len

  useEffect(() => {
    (async () => {
      const indexPageUrl = isMspPage
        ? `${DOCS_HOME_URL}/ruckusone/mspguide/index.html`
        : `${DOCS_HOME_URL}/ruckusone/userguide/index.html`

      const mappingRs = await fetchDocsURLMapping(basePath, () => {}, isMspPage)
      setHelpUrl(mappingRs ? getDocsURL(isMspPage)+mappingRs : indexPageUrl)
    })()
  }, [basePath, isMspPage])

  return helpUrl
}
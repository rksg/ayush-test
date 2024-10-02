import { useEffect, useState } from 'react'

import { useLocation } from '@acx-ui/react-router-dom'

export const DOCS_HOME_URL = 'https://docs.cloud.ruckuswireless.com'

//for Local test, use '/docs/ruckusone/userguide/mapfile/doc-mapper.json'
export const getDocsMappingURL = (isMspUser:boolean, isRAI:boolean = false) =>
  process.env['NODE_ENV'] === 'development'
    ? isRAI ? '/docs/RUCKUS-AI/userguide/mapfile/doc-mapper.json'
      : isMspUser ? '/docs/ruckusone/mspguide/mapfile/doc-mapper.json'
        : '/docs/ruckusone/userguide/mapfile/doc-mapper.json'
    : isRAI ? 'https://docs.cloud.ruckuswireless.com/RUCKUS-AI/userguide/mapfile/doc-mapper.json'
      : isMspUser ? 'https://docs.cloud.ruckuswireless.com/ruckusone/mspguide/mapfile/doc-mapper.json'  //eslint-disable-line max-len
        : 'https://docs.cloud.ruckuswireless.com/ruckusone/userguide/mapfile/doc-mapper.json'

// for local test, use '/docs/ruckusone/userguide/'
export const getDocsURL = (isMspUser:boolean, isRAI:boolean = false) =>
  process.env['NODE_ENV'] === 'development'
    ? isRAI ? '/docs/RUCKUS-AI/userguide/'
      : isMspUser ? '/docs/ruckusone/mspguide/'
        : '/docs/ruckusone/userguide/'
    : isRAI ? 'https://docs.cloud.ruckuswireless.com/RUCKUS-AI/userguide/'
      : isMspUser ? 'https://docs.cloud.ruckuswireless.com/ruckusone/mspguide/'
        : 'https://docs.cloud.ruckuswireless.com/ruckusone/userguide/'

export const fetchDocsURLMapping = async (
  basePath: string,
  showError: () => void,
  isMspUser: boolean,
  isRAI: boolean = false
) => {
  let result = await fetch(getDocsMappingURL(isMspUser, isRAI), {
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

export const useHelpPageLinkBasePath = (targetPathname?: string) => {
  const location = useLocation()
  const [, tenantType, pathname] = location.pathname.match(/^\/[a-f0-9]{32}\/(v|t)\/(.+)$/) || []
  const basePath = (targetPathname || pathname)?.replaceAll(/([A-Z0-9]{11,})|([0-9a-fA-F]{1,2}[:]){5}([0-9a-fA-F]{1,2})|([a-f-\d]{32,36}|[A-F-\d]{32,36})|([a-zA-Z0-9+\=]{84})|\d+/g, '*') // eslint-disable-line max-len
  const isMspUser = tenantType === 'v'

  return {
    isMspUser,
    basePath
  }
}

export const useHelpPageLink = (targetPathname?: string, isRAI:boolean = false) => {
  const { isMspUser, basePath } = useHelpPageLinkBasePath(targetPathname)
  const [helpUrl, setHelpUrl] = useState<string|undefined>(undefined)

  useEffect(() => {
    (async () => {
      const indexPageUrl = isRAI ? `${DOCS_HOME_URL}/RUCKUS-AI/userguide/index.html`
        : isMspUser
          ? `${DOCS_HOME_URL}/ruckusone/mspguide/index.html`
          : `${DOCS_HOME_URL}/ruckusone/userguide/index.html`

      const mappingRs = await fetchDocsURLMapping(basePath, () => {}, isMspUser, isRAI)
      setHelpUrl(mappingRs ? getDocsURL(isMspUser, isRAI)+mappingRs : indexPageUrl)
    })()
  }, [basePath, isMspUser, isRAI])

  return helpUrl
}
import { useEffect, useState } from 'react'

import { get }         from '@acx-ui/config'
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

export const getRaiDocsMappingURL = () =>
  process.env['NODE_ENV'] === 'development'
    ? '/docs/RUCKUS-AI/userguide/mapfile/doc-mapper.json'
    : 'https://docs.cloud.ruckuswireless.com/RUCKUS-AI/userguide/mapfile/doc-mapper.json'

export const getRaiDocsURL = () =>
  process.env['NODE_ENV'] === 'development'
    ? '/docs/RUCKUS-AI/userguide/'
    : 'https://docs.cloud.ruckuswireless.com/RUCKUS-AI/userguide/'

export const fetchDocsURLMapping = async (
  targetPath: string,
  docMappingURL: string,
  showError: () => void
) => {
  let result = await fetch(docMappingURL, {
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
  const mapKey = Object.keys(result).find(item => targetPath === item)
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

export const useRaiHelpPageLinkBasePath = (targetPathname?: string) => {
  const location = useLocation()
  const [, pathname] = location.pathname.match(/^\/(.+)$/) || []
  // enhance here if we need to replace path with * (and UT)
  const basePath = (targetPathname || pathname)
  return basePath
}

export const useHelpPageLink = (targetPathname?: string) => {
  const { isMspUser, basePath } = useHelpPageLinkBasePath(targetPathname)
  const [helpUrl, setHelpUrl] = useState<string|undefined>(undefined)

  useEffect(() => {
    (async () => {
      const indexPageUrl = isMspUser
        ? `${DOCS_HOME_URL}/ruckusone/mspguide/index.html`
        : `${DOCS_HOME_URL}/ruckusone/userguide/index.html`

      const mappingRs = await fetchDocsURLMapping(basePath,
        getDocsMappingURL(isMspUser), () => { })
      setHelpUrl(mappingRs ? getDocsURL(isMspUser)+mappingRs : indexPageUrl)
    })()
  }, [basePath, isMspUser])

  return helpUrl
}

const useRaiHelpPageLink = (targetPathname?: string) => {
  const basePath = useRaiHelpPageLinkBasePath(targetPathname)
  const [helpUrl, setHelpUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    (async () => {
      const indexPageUrl = `${DOCS_HOME_URL}/RUCKUS-AI/userguide/index.html`

      const mappingRs = await fetchDocsURLMapping(basePath, getRaiDocsMappingURL(), () => {})
      setHelpUrl(mappingRs ? getRaiDocsURL() + mappingRs : indexPageUrl)
    })()
  }, [basePath])

  return helpUrl
}

export const useRaiR1HelpPageLink = (targetPathname?: string) => {
  const raiHelpPageLink = useRaiHelpPageLink(targetPathname)
  const r1HelpPageLink = useHelpPageLink(targetPathname)
  return get('IS_MLISA_SA') ? raiHelpPageLink : r1HelpPageLink
}
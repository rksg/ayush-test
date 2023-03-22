import { useState, useEffect, useCallback } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {  Drawer }     from '@acx-ui/components'
import { Button }      from '@acx-ui/components'
import { useLocation } from '@acx-ui/react-router-dom'


import { EmptyDescription } from './styledComponents'


//for Local test, use '/docs/ruckusone/userguide/mapfile/doc-mapper.json'
export const getMappingURL = (isMspUser:boolean) => {
  return process.env['NODE_ENV'] === 'development'
    // eslint-disable-next-line max-len
    ? isMspUser ? '/docs/ruckusone/mspguide/mapfile/doc-mapper.json':'/docs/ruckusone/userguide/mapfile/doc-mapper.json'
    // eslint-disable-next-line max-len
    : isMspUser ? 'https://docs.cloud.ruckuswireless.com/ruckusone/mspguide/mapfile/doc-mapper.json' : 'https://docs.cloud.ruckuswireless.com/ruckusone/userguide/mapfile/doc-mapper.json'
}

// for local test, use '/docs/ruckusone/userguide/'
export const getDocsURL = (isMspUser:boolean) => process.env['NODE_ENV'] === 'development'
  ? isMspUser ? '/docs/ruckusone/mspguide/':'/docs/ruckusone/userguide/'
  // eslint-disable-next-line max-len
  : isMspUser ? 'https://docs.cloud.ruckuswireless.com/ruckusone/mspguide/':'https://docs.cloud.ruckuswireless.com/ruckusone/userguide/'

export const DOCS_HOME_URL = 'https://docs.cloud.ruckuswireless.com'

// eslint-disable-next-line max-len
const reg = /([A-Z0-9]{11,})|([0-9a-fA-F]{1,2}[:]){5}([0-9a-fA-F]{1,2})|([a-f-\d]{32,36}|[A-F-\d]{32,36})|\d+\/?/g

const useBasePath = () => {
  const location = useLocation()
  const basePath = location.pathname.replace(new URL(document.baseURI).pathname,'')
  return _.replace(basePath, reg, (matchStr)=>{
    // eslint-disable-next-line max-len
    const paramReg = /([A-Z0-9]{11,})|([0-9a-fA-F]{1,2}[:]){5}([0-9a-fA-F]{1,2})|([a-f-\d]{32,36}|[A-F-\d]{32,36})|\d+/g
    return matchStr.replaceAll(paramReg,'*')
  })
}

const getMapping = async (basePath: string, showError: () => void, isMspUser:boolean) => {
  let result = await fetch(getMappingURL(isMspUser), {
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

const updateDesc = async (
  destFile: string,
  onComplete: (content: string) => void,
  onError: () => void,
  isMspUser:boolean
) => {
  const result = await fetch(getDocsURL(isMspUser) + destFile)
  if(!result.ok){
    onError()
    return
  }
  const htmlResult = await result.text()
  const targetDesc = new DOMParser()
    .parseFromString(htmlResult, 'text/html')
    .querySelector('.shortdesc')

  if (targetDesc) {
    onComplete(targetDesc?.innerHTML.trim().replace(/\<.*?\>|\n/g, '') || '')
  } else { onError() }
}

export default function HelpPage (props: {
  modalState: boolean,
  setIsModalOpen: (isModalOpen: boolean) => void
}) {
  const { $t } = useIntl()
  const [helpDesc, setHelpDesc] = useState<string>()
  const [helpUrl, setHelpUrl] = useState<string|null>()
  const [isMSPUserType, setIsMSPUserType] = useState<boolean>(false)
  const basePath = useBasePath()

  const showError = useCallback(() => {
    setHelpDesc($t({ defaultMessage: 'The content is not available.' }))
    setHelpUrl(null)
  }, [$t])

  useEffect(() => {
    if (!props.modalState) return
    (async ()=> {
      let isMspUser = false
      if(basePath.startsWith('v/*') || basePath.startsWith('*/v')){
        setIsMSPUserType(true)
        isMspUser=true
      }else{
        setIsMSPUserType(false)
        isMspUser=false
      }
      const mappingRs = await getMapping(basePath, showError, isMspUser)
      if (!mappingRs) {
        return showError()
      }
      await updateDesc(
        mappingRs as string,
        (content) => {
          setHelpDesc(content)
          setHelpUrl(getDocsURL(isMspUser) + mappingRs)
        },
        showError,
        isMspUser
      )
    })()
  }, [props.modalState, showError, basePath])

  return <Drawer
    title={$t({ defaultMessage: 'Help for this page' })}
    visible={props.modalState}
    onClose={() => props.setIsModalOpen(false)}
    children={<div>
      <p>
        {helpUrl ? helpDesc :
          <EmptyDescription>
            {helpDesc}
          </EmptyDescription>}
      </p>
      {!helpUrl && <p>
        {$t({ defaultMessage: 'More details:' })}
        {' '}
        <Button
          onClick={()=>{
            isMSPUserType ?
              window.open(DOCS_HOME_URL+'/ruckusone/mspguide/index.html', '_blank')
              :
              window.open(DOCS_HOME_URL+'/ruckusone/userguide/index.html', '_blank')
          }}
          type='link'
          size='small'>
          {$t({ defaultMessage: 'RUCKUS One User Guide' })}
        </Button>
      </p>}

      {helpUrl && <p>
        <Button
          onClick={()=>{
            window.open(helpUrl, '_blank')
          }}
          type='link'
          size='small'>
          {$t({ defaultMessage: 'Continue Reading' })}
        </Button>
      </p>}
    </div>
    }
    destroyOnClose={true}
    width={420}
  />
}

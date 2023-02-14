import { useState, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {  Drawer }     from '@acx-ui/components'
import { Button }      from '@acx-ui/components'
import { useLocation } from '@acx-ui/react-router-dom'


import { EmptyDescription } from './styledComponents'


//for Local test, use '/docs/ruckusone/userguide/mapfile/doc-mapper.json'
// TODO: change to use '/docs/ruckusone/userguide/mapfile/doc-mapper.json' for local and prod after gateway adds route
export const getMappingURL = () => process.env['NODE_ENV'] === 'development'
  ? '/docs/ruckusone/userguide/mapfile/doc-mapper.json'
  : 'https://docs.cloud.ruckuswireless.com/ruckusone/userguide/mapfile/doc-mapper.json'

// for local test, use '/docs/ruckusone/userguide/'
// TODO: change to use '/docs/alto/latest/' for local and prod after gateway adds route
export const getDocsURL = () => process.env['NODE_ENV'] === 'development'
  ? '/docs/ruckusone/userguide/'
  : 'https://docs.cloud.ruckuswireless.com/ruckusone/userguide/'

export const DOCS_HOME_URL = 'https://docs.cloud.ruckuswireless.com'

const reg = /([a-f-\d]{32,36}|[A-F-\d]{32,36})|\d+\/?/g
const useBasePath = () => {
  const location = useLocation()
  const basePath = location.pathname.replace(new URL(document.baseURI).pathname,'')
  return _.replace(basePath, reg, (matchStr)=>{
    const paramReg = /([a-f-\d]{32,36}|[A-F-\d]{32,36})|\d+/g
    return matchStr.replaceAll(paramReg,'*')
  })
}

const getMapping = async (basePath: string, showError: () => void) => {
  let result = await fetch(getMappingURL(), {
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
  onError: () => void
) => {
  const result = await fetch(getDocsURL() + destFile)
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
  const location = useLocation()
  const basePath = useBasePath()

  const showError = ()=>{
    setHelpDesc($t({ defaultMessage: 'The content is not available.' }))
    setHelpUrl(null)
  }

  useEffect(() => {
    (async ()=> {
      const mappingRs = await getMapping(basePath, showError)
      if (!mappingRs) {
        return showError()
      }
      await updateDesc(
        mappingRs as string,
        (content) => {
          setHelpDesc(content)
          setHelpUrl(getDocsURL() + mappingRs)
        },
        showError
      )
    })()
  }, [location])

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

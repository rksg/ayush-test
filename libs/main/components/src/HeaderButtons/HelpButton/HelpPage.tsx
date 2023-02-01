import { useState, useEffect } from 'react'

import _           from 'lodash'
import { useIntl } from 'react-intl'

import {  Drawer }     from '@acx-ui/components'
import { Button }      from '@acx-ui/components'
import { useLocation } from '@acx-ui/react-router-dom'


import { EmptyDescription } from './styledComponents'

//for Local test, use '/docs/r1/mapfile/doc-mapper.json'
// TODO: change to use '/docs/r1/mapfile/doc-mapper.json' for local and prod after gateway adds route
export const MAPPING_URL = 'https://docs.cloud.ruckuswireless.com/r1/mapfile/doc-mapper.json'

// for local test, use '/docs/alto/latest/'
// TODO: change to use '/docs/alto/latest/' for local and prod after gateway adds route
export const DOCS_URL = 'https://docs.cloud.ruckuswireless.com/alto/latest/'

export const DOCS_HOME_URL = 'https://docs.cloud.ruckuswireless.com'


export default function HelpPage (props: {
  modalState: boolean,
  setIsModalOpen: (isModalOpen: boolean) => void
}) {
  const { $t } = useIntl()
  const [helpDesc, setHelpDesc] = useState<string>()
  const [helpUrl, setHelpUrl] = useState<string|null>()
  const location = useLocation()
  const useBasePath = () => {
    const reg = /([a-f-\d]{32,36}|[A-F-\d]{32,36})|\d+\/?/g
    return _.replace(location.pathname, reg, (matchStr)=>{
      const paramReg = /([a-f-\d]{32,36}|[A-F-\d]{32,36})|\d+/g
      return matchStr.replaceAll(paramReg,'*')
    })
  }
  const basePath = useBasePath()
  const getMapping = async () => {

    let result = await fetch(MAPPING_URL, {
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
  const updateDesc = async (destFile: string) => {
    const result = await fetch(DOCS_URL + destFile)
    if(!result.ok){
      showError()
      return
    }
    const htmlResult = await result.text()
    const targetDesc = new DOMParser()
      .parseFromString(htmlResult, 'text/html')
      .querySelector('.shortdesc')

    if(targetDesc){
      setHelpDesc(targetDesc?.innerHTML.trim().replace(/\<.*?\>|\n/g, '') || '')
      setHelpUrl(DOCS_URL + destFile)
    }else{
      showError()
    }
  }

  const showError = ()=>{
    setHelpDesc($t({ defaultMessage: 'The content is not available.' }))
    setHelpUrl(null)
  }

  useEffect(() => {
    (async ()=> {
      const mappingRs = await getMapping()
      mappingRs ? updateDesc(mappingRs as string) : showError()
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
            window.open(DOCS_HOME_URL+'/alto/latest/index.html', '_blank')
          }}
          type='link'
          size='small'>
          {$t({ defaultMessage: 'Ruckus ONE User Guide' })}
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

import { useState, useEffect } from 'react'

import { Divider } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {  Drawer }     from '@acx-ui/components'
import { useLocation } from '@acx-ui/react-router-dom'

import mapping                                                 from './mapping'
import { EmptyDescription, DocLink, Paragraph, TextContainer } from './styledComponents'

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


  const getMapping = async () => {

    let result = await fetch(MAPPING_URL, {
      method: 'GET',
      headers: {
        Accept: 'application/json'
      }
    })
    const mapKey = Object.keys(mapping).find(item => location.pathname.indexOf(item) !== -1)

    if(!result.ok || _.isEmpty(mapKey)){
      showError()
      return
    }

    result = await result.json()
    const key = mapping[mapKey as keyof typeof mapping]
    return result[key as keyof typeof result]
  }
  const updateDesc = async (destFile: string) => {
    const result = await fetch(DOCS_URL + destFile)
    if(!result.ok){
      showError()
      return
    }
    const htmlResult = await result.text()
    setHelpDesc(new DOMParser().parseFromString(htmlResult, 'text/html')
      .querySelector('.shortdesc')?.innerHTML.trim().replace(/\<.*?\>|\n/g, '') || '')
    setHelpUrl(DOCS_URL + destFile)
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
      <Paragraph>
        {helpUrl ? helpDesc :
          <EmptyDescription>
            {helpDesc}
          </EmptyDescription>}
      </Paragraph>
      {!helpUrl && <Paragraph>
        <TextContainer>
        More details:
        </TextContainer>
        <DocLink
          onClick={()=>{
            window.open(DOCS_HOME_URL+'/alto/latest/index.html', '_blank')
          }}
          type='link'
          block>
          {$t({ defaultMessage: 'Ruckus ONE User Guide' })}
        </DocLink>
      </Paragraph>}

      {helpUrl && <p>
        <DocLink
          onClick={()=>{
            window.open(helpUrl, '_blank')
          }}
          type='link'
          block>
          {$t({ defaultMessage: 'Continue Reading' })}
        </DocLink>
      </p>}
      <Divider />
    </div>
    }
    destroyOnClose={true}
    width={420}
  />
}

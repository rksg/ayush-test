import { useState, useEffect } from 'react'

import { Divider } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {  Drawer }     from '@acx-ui/components'
import { useLocation } from '@acx-ui/react-router-dom'

import mapping                                            from './mapping'
import { Description, DocLink, Paragraph, TextContainer } from './styledComponents'

const MAPPING_URL = '/docs/r1/mapfile/doc-mapper.json'
const DOCS_URL = '/docs/alto/latest/'
const DOCS_HOME_URL = 'https://docs.cloud.ruckuswireless.com'


export default function HelpPage (props: {
  modalState: boolean,
  setIsModalOpen: (isModalOpen: boolean) => void
}) {
  const { $t } = useIntl()
  const [helpDesc, setHelpDesc] = useState<string>()
  const [helpUrl, setHelpUrl] = useState<string|null>()

  const location = useLocation()


  const getMapping = async () => {
    try {
      // eslint-disable-next-line max-len
      const re = await (await fetch(MAPPING_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      })).json()

      const mapKey = Object.keys(mapping).find(item => location.pathname.indexOf(item) !== -1)
      if (_.isEmpty(mapKey)) {
        showError()
        return
      }
      return re[mapping[mapKey as keyof typeof mapping] as typeof re]
    }catch (e) {
      showError()
    }
  }
  const updateDesc = async (destFile: string) => {
    try {
      const re = await (await fetch(DOCS_URL + destFile)).text()
      setHelpDesc(new DOMParser().parseFromString(re, 'text/html')
        .querySelector('.shortdesc')?.innerHTML.trim().replace(/\<.*?\>|\n/g, '') || '')
      setHelpUrl(DOCS_URL + destFile)
    } catch (e) {
      showError()
    }
  }

  const showError = ()=>{
    setHelpDesc($t({ defaultMessage: 'The content is not available.' }))
    setHelpUrl(null)
  }

  useEffect(() => {
    (async ()=> {
      const mapping = await getMapping()
      mapping && updateDesc(mapping)
    })()
  }, [location])

  return <Drawer
    title={$t({ defaultMessage: 'Help for this page' })}
    visible={props.modalState}
    onClose={() => props.setIsModalOpen(false)}
    mask={true}
    children={<div>
      <Paragraph>
        <Description>
          {helpDesc}
        </Description>
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

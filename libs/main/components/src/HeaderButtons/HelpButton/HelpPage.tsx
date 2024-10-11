import { useState, useEffect, useCallback } from 'react'

import { useIntl } from 'react-intl'

import { Button, Drawer }                                                                             from '@acx-ui/components'
import { DOCS_HOME_URL, fetchDocsURLMapping, getDocsMappingURL, getDocsURL, useHelpPageLinkBasePath } from '@acx-ui/rc/utils'

import { EmptyDescription } from './styledComponents'

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
  const { isMspUser, basePath } = useHelpPageLinkBasePath()
  const [helpDesc, setHelpDesc] = useState<string>()
  const [helpUrl, setHelpUrl] = useState<string|null>()

  const showError = useCallback(() => {
    setHelpDesc($t({ defaultMessage: 'The content is not available.' }))
    setHelpUrl(null)
  }, [$t])

  useEffect(() => {
    if (!props.modalState) return
    (async ()=> {
      const mappingRs = await fetchDocsURLMapping(basePath,
        getDocsMappingURL(isMspUser), showError)
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
  }, [props.modalState, showError, basePath, isMspUser])

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
            isMspUser ?
              window.open(DOCS_HOME_URL+'/ruckusone/mspguide/index.html', '_blank')
              :
              window.open(DOCS_HOME_URL+'/ruckusone/userguide/index.html', '_blank')
          }}
          type='link'
          size='small'>
          { isMspUser ?
            $t({ defaultMessage: 'RUCKUS One MSP Guide' })
            :
            $t({ defaultMessage: 'RUCKUS One User Guide' })
          }
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
import { useState, useEffect } from 'react'

import { Divider } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {  Drawer }     from '@acx-ui/components'
import { useLocation } from '@acx-ui/react-router-dom'

import mapping         from './mapping'
import { Description } from './styledComponents'

export default function HelpPage (props: {
  modalState: boolean,
  setIsModalOpen: (isModalOpen: boolean) => void
}) {
  const { $t } = useIntl()
  const [helpDesc, setHelpDesc] = useState<string>()

  const location = useLocation()


  const getMapping = async () => {
    try {
      // eslint-disable-next-line max-len
      const re = await (await fetch('https://docs.cloud.ruckuswireless.com/r1/mapfile/doc-mapper.json', {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      })).json()

      const mapKey = Object.keys(mapping).find(item => location.pathname.indexOf(item) !== -1)
      const key = mapping[mapKey as keyof typeof mapping]
      if (!_.isEmpty(mapKey)) return re[key as typeof re]
    }catch (e) {
      setHelpDesc($t({ defaultMessage: 'The content is not available.' }))
    }
  }
  const updateDesc = async (destFile: string) => {
    try {
    // eslint-disable-next-line max-len
      const re = await (await fetch('https://docs.cloud.ruckuswireless.com/alto/latest/' + destFile)).text()
      setHelpDesc(new DOMParser().parseFromString(re, 'text/html')
        .querySelector('.shortdesc')?.innerHTML.trim().replace(/\<.*?\>|\n/g, '') || '')
    } catch (e) {
      setHelpDesc($t({ defaultMessage: 'The content is not available.' }))
    }
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
      <p>
        <Description>
          {helpDesc}
        </Description>
        <Divider />
      </p>
    </div>
    }
    destroyOnClose={true}
    width={420}
  />
}

import { useState, useEffect } from 'react'


import _           from 'lodash'
import { useIntl } from 'react-intl'

import { GridRow, GridCol, Drawer } from '@acx-ui/components'
import { useLocation }              from '@acx-ui/react-router-dom'

import { Description } from '../styledComponents'

import mappingTable from './mappingTable'

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

      const mapKey = _.find(_.keys(mappingTable), item => location.pathname.indexOf(item) !== -1)
      const key = mappingTable[mapKey as keyof typeof mappingTable]
      if (!_.isEmpty(mapKey)) return re[key as typeof re]
    }catch (e) {
      setHelpDesc($t({ defaultMessage: 'The content is not available.' }))
    }
  }

  const getDesc = async (destFile: string) => {
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
    getMapping().then((dest) => {
      dest && getDesc(dest)
    })
  }, [location])

  return <Drawer
    title={$t({ defaultMessage: 'Help For This Page' })}
    visible={props.modalState}
    onClose={() => props.setIsModalOpen(false)}
    mask={true}
    children={<div data-testid={'drawer-firewall-id'}>
      <GridRow style={{ paddingBottom: 5 }}>
        <GridCol col={{ span: 24 }}>
          <Description>
            {helpDesc}
          </Description>
        </GridCol>
      </GridRow>
    </div>
    }
    destroyOnClose={true}
    width={420}
  />
}

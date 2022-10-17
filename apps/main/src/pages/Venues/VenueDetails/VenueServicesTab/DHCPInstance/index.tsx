import React, { useState } from 'react'

import { Radio, RadioChangeEvent } from 'antd'
import { useIntl }                 from 'react-intl'

import BasicInfo        from './BasicInfo'
import LeaseTable       from './LeaseTable'
import PoolTable        from './PoolTable'
import { DivContainer } from './styledComponents'



type TabPosition = 'pools' | 'lease'


const DHCPInstance = () => {
  const { $t } = useIntl()

  const [tabPosition, setTabPosition] = useState<TabPosition>('pools')

  const changeTabPosition = (e: RadioChangeEvent) => {
    setTabPosition(e.target.value)
  }

  return <>
    <BasicInfo />
    <DivContainer>
      <Radio.Group value={tabPosition} onChange={changeTabPosition}>
        <Radio.Button value='pools'>{$t({ defaultMessage: 'Pools' })+` (${6})`} </Radio.Button>
        <Radio.Button value='lease'>
          {$t({ defaultMessage: 'Lease Table' }) +
          ` (${34} ` + $t({ defaultMessage: 'Online' }) + ')' }
        </Radio.Button>
      </Radio.Group>
    </DivContainer>
    { tabPosition === 'pools' && <PoolTable/>}
    { tabPosition === 'lease' && <LeaseTable/>}
  </>
}

export default DHCPInstance

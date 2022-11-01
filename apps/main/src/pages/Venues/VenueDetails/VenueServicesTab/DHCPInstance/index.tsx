import React, { useState } from 'react'


import { Radio, RadioChangeEvent } from 'antd'
import { useIntl }                 from 'react-intl'
import { useParams }               from 'react-router-dom'

import { useVenuesLeasesListQuery, useGetDHCPProfileQuery, useVenueDHCPProfileQuery } from '@acx-ui/rc/services'

import BasicInfo  from './BasicInfo'
import LeaseTable from './LeaseTable'
import PoolTable  from './PoolTable'


type TabPosition = 'pools' | 'lease'

const DHCPInstance = () => {
  const { $t } = useIntl()
  const params = useParams()
  const [tabPosition, setTabPosition] = useState<TabPosition>('pools')

  const changeTabPosition = (e: RadioChangeEvent) => {
    setTabPosition(e.target.value)
  }

  const { data: leasesList } = useVenuesLeasesListQuery({
    params: { venueId: params.venueId }
  })

  const { data: venueDHCPProfile } = useVenueDHCPProfileQuery({
    params
  })
  const { data: dhcpProfile } = useGetDHCPProfileQuery({
    params: { ...params, serviceId: venueDHCPProfile?.serviceProfileId }
  })

  return <>
    <BasicInfo/>
    <Radio.Group style={{ margin: '10px 0px 10px 0px' }}
      value={tabPosition}
      onChange={changeTabPosition}>
      <Radio.Button value='pools'>
        {$t({ defaultMessage: 'Pools' })+` (${dhcpProfile?.dhcpPools.length || 0})`}
      </Radio.Button>
      <Radio.Button value='lease'>
        {$t({ defaultMessage: 'Lease Table' }) +
        ` (${leasesList?.length || 0} ` + $t({ defaultMessage: 'Online' }) + ')' }
      </Radio.Button>
    </Radio.Group>
    { tabPosition === 'pools' && <PoolTable />}
    { tabPosition === 'lease' && <LeaseTable />}
  </>
}

export default DHCPInstance

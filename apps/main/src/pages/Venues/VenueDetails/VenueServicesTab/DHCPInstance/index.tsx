import React, { useState } from 'react'


import { RadioChangeEvent } from 'antd'
import { useIntl }          from 'react-intl'
import { useParams }        from 'react-router-dom'

import { GridRow, GridCol, SelectionControl }                                         from '@acx-ui/components'
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
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <BasicInfo/>
      </GridCol>
    </GridRow>
    <GridRow style={{ paddingTop: 20, paddingBottom: 10 }}>
      <GridCol col={{ span: 24 }}>
        <SelectionControl
          defaultValue={'pools'}
          onChange={changeTabPosition}
          options={[{
            label: $t({ defaultMessage: 'Pools ({count})' },
              { count: dhcpProfile?.dhcpPools.length || 0 }),
            value: 'pools'
          }, {
            label: $t({ defaultMessage: 'Lease Table ({count} Online)' },
              { count: leasesList?.length || 0 }),
            value: 'lease'
          }]}
        />
      </GridCol>
    </GridRow>
    <GridRow>
      <GridCol col={{ span: 24 }}>
        { tabPosition === 'pools' && <PoolTable />}
        { tabPosition === 'lease' && <LeaseTable />}
      </GridCol>
    </GridRow>
  </>
}

export default DHCPInstance

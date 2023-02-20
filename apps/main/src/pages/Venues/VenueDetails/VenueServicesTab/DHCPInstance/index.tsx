import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  GridRow,
  GridCol,
  ContentSwitcherProps,
  ContentSwitcher
} from '@acx-ui/components'
import { useVenuesLeasesListQuery, useGetDHCPProfileQuery, useVenueDHCPProfileQuery } from '@acx-ui/rc/services'

import BasicInfo  from './BasicInfo'
import LeaseTable from './LeaseTable'
import PoolTable  from './PoolTable'

const DHCPInstance = () => {
  const { $t } = useIntl()
  const params = useParams()

  const { data: leasesList } = useVenuesLeasesListQuery({ params })

  const { data: venueDHCPProfile } = useVenueDHCPProfileQuery({
    params
  })
  const { data: dhcpProfile } = useGetDHCPProfileQuery({
    params: { ...params, serviceId: venueDHCPProfile?.serviceProfileId }
  }, { skip: !venueDHCPProfile?.serviceProfileId })

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Pools ({count})' },
        { count: dhcpProfile?.dhcpPools.length || 0 }),
      value: 'pools',
      children: <GridCol col={{ span: 24 }}><PoolTable /></GridCol>
    },
    {
      label: $t({ defaultMessage: 'Lease Table ({count} Online)' },
        { count: leasesList?.length || 0 }),
      value: 'lease',
      children: <GridCol col={{ span: 24 }}><LeaseTable /></GridCol>
    }
  ]

  return (
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <BasicInfo/>
      </GridCol>
      {venueDHCPProfile?.enabled && <ContentSwitcher tabDetails={tabDetails} size='large' />}
    </GridRow>
  )
}

export default DHCPInstance

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, GridRow, GridCol } from '@acx-ui/components'
import { useGetDHCPProfileQuery }       from '@acx-ui/rc/services'

import DHCPInstancesTable from './DHCPInstancesTable'
import DHCPOverview       from './DHCPOverview'


export default function DHCPServiceDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const { data } = useGetDHCPProfileQuery({ params })

  return (
    <>
      <PageHeader
        title={data?.serviceName}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <DHCPOverview poolNumber={data?.dhcpPools.length} />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <DHCPInstancesTable />
        </GridCol>
      </GridRow>
    </>
  )
}


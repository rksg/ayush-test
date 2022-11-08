import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader, DisabledButton, GridRow, GridCol }             from '@acx-ui/components'
import { ClockOutlined }                                            from '@acx-ui/icons'
import { useDhcpVenueInstancesQuery, useGetDHCPProfileDetailQuery } from '@acx-ui/rc/services'
import { useTableQuery }                                            from '@acx-ui/rc/utils'

import DHCPInstancesTable from './DHCPInstancesTable'
import DHCPOverview       from './DHCPOverview'


const defaultPayload = {
  searchString: '',
  fields: [
    'name',
    'id'
  ]
}

export default function DHCPServiceDetail () {
  const { $t } = useIntl()
  const params = useParams()

  const tableQuery = useTableQuery({
    useQuery: useDhcpVenueInstancesQuery,
    defaultPayload
  })

  const { data } = useGetDHCPProfileDetailQuery({ params })


  return (
    <>
      <PageHeader
        title={data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
        extra={[
          <DisabledButton key={'last24'} icon={<ClockOutlined />}>
            {$t({ defaultMessage: 'Last 24 hours' })}
          </DisabledButton>,
          <DisabledButton key={'configure'} type={'primary'}>
            {$t({ defaultMessage: 'Configure' })}
          </DisabledButton>
        ]}
      />
      <GridRow>
        <GridCol col={{ span: 24 }}>
          <DHCPOverview poolNumber={data?.dhcpPools.length} />
        </GridCol>
        <GridCol col={{ span: 24 }}>
          <DHCPInstancesTable
            dataSource={tableQuery.data?.data}
            pagination={tableQuery.pagination}
            onChange={tableQuery.handleTableChange}
          />
        </GridCol>
      </GridRow>
    </>
  )
}


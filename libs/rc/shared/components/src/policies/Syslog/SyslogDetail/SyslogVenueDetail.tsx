import { CheckOutlined } from '@ant-design/icons'
import { useIntl }       from 'react-intl'
import { useParams }     from 'react-router-dom'

import { Card, Table, TableProps } from '@acx-ui/components'
import {
  useVenueSyslogPolicyQuery ,
  useGetSyslogPolicyQuery
} from '@acx-ui/rc/services'
import { useTableQuery, VenueSyslogPolicyType } from '@acx-ui/rc/utils'
import { TenantLink }                           from '@acx-ui/react-router-dom'

const defaultPayload = {
  url: '/api/viewmodel/tenant/{tenantId}/venue',
  fields: [
    'id',
    'name',
    'city',
    'country',
    'switches',
    'rogueAps',
    'rogueDetection',
    'status'
  ],
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25
}

const SyslogVenueDetail = () => {
  const { $t } = useIntl()
  const basicColumns: TableProps<VenueSyslogPolicyType>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        return <TenantLink to={`/venues/${row.id}/venue-details/overview`}>{row.name}</TenantLink>
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'city',
      sorter: true,
      key: 'city'
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi' }),
      dataIndex: 'syslogEnable',
      key: 'syslogEnable',
      sorter: true,
      render: () => {
        return <CheckOutlined />
      }
    }
  ]

  const tableQuery = useTableQuery({
    useQuery: useVenueSyslogPolicyQuery,
    defaultPayload: {
      ...defaultPayload
    }
  })

  const { data } = useGetSyslogPolicyQuery({
    params: useParams()
  })

  const basicData = tableQuery.data?.data
  let detailData = [] as VenueSyslogPolicyType[] | undefined
  if (data?.venues && basicData) {
    const venueIdList = data.venues?.map(venue => venue.id) ?? ['UNDEFINED']
    detailData = basicData?.filter(policy => venueIdList.includes(policy.id as string))
  }

  return (
    <Card title={
      $t(
        { defaultMessage: 'Instance ({count})' },
        { count: detailData ? detailData.length : '' }
      )
    }>
      <Table
        columns={basicColumns}
        dataSource={detailData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowKey='id'
      />
    </Card>
  )
}

export default SyslogVenueDetail

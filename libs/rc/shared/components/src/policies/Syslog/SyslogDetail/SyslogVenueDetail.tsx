import { useEffect } from 'react'

import { CheckOutlined } from '@ant-design/icons'
import { useIntl }       from 'react-intl'

import { Card, Table, TableProps }   from '@acx-ui/components'
import {
  useVenueSyslogPolicyQuery ,
  useGetSyslogPolicyQuery,
  useGetVenueTemplateForSyslogPolicyQuery,
  useGetSyslogPolicyTemplateQuery
} from '@acx-ui/rc/services'
import { SyslogPolicyDetailType, SyslogVenue, useConfigTemplate, useConfigTemplateQueryFnSwitcher, useTableQuery, VenueSyslogPolicyType } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                     from '@acx-ui/react-router-dom'

const defaultPayload = {
  fields: [
    'id',
    'name',
    'city',
    'country',
    'status'
  ],
  filters: {},
  sortField: 'name',
  sortOrder: 'ASC',
  page: 1,
  pageSize: 25
}

const SyslogVenueDetail = () => {
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
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

  const { data: syslogPolicy } = useConfigTemplateQueryFnSwitcher<SyslogPolicyDetailType>(
    useGetSyslogPolicyQuery,
    useGetSyslogPolicyTemplateQuery
  )

  const tableQuery = useTableQuery({
    useQuery: isTemplate ? useGetVenueTemplateForSyslogPolicyQuery : useVenueSyslogPolicyQuery,
    defaultPayload,
    option: {
      skip: !syslogPolicy || (syslogPolicy.venues ?? []).length === 0
    }
  })

  useEffect(() => {
    if (!syslogPolicy || (syslogPolicy.venues ?? []).length === 0) return

    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        id: syslogPolicy.venues.map((venue: SyslogVenue) => venue.id)
      }
    })
  },[syslogPolicy])

  const basicData = tableQuery.data?.data
  let detailData = [] as VenueSyslogPolicyType[] | undefined
  if (syslogPolicy?.venues && basicData) {
    const venueIdList = syslogPolicy.venues?.map(venue => venue.id) ?? ['UNDEFINED']
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

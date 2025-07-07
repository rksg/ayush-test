import { useEffect } from 'react'

import { CheckOutlined } from '@ant-design/icons'
import { useIntl }       from 'react-intl'

import { Card, Loader, Table, TableProps } from '@acx-ui/components'
import { Features, useIsSplitOn }          from '@acx-ui/feature-toggle'
import {
  useGetSyslogPolicyQuery,
  useGetVenueTemplateForSyslogPolicyQuery,
  useGetSyslogPolicyTemplateQuery,
  useGetVenueSyslogListQuery
} from '@acx-ui/rc/services'
import { ConfigTemplateType, SyslogPolicyDetailType, SyslogVenue, useConfigTemplate, useConfigTemplateQueryFnSwitcher, VenueSyslogPolicyType } from '@acx-ui/rc/utils'
import { TenantLink }                                                                                                                          from '@acx-ui/react-router-dom'
import { useTableQuery }                                                                                                                       from '@acx-ui/utils'

import { renderConfigTemplateDetailsComponent } from '../../../configTemplates'

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
  const enableRbac = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const enableTemplateRbac = useIsSplitOn(Features.RBAC_CONFIG_TEMPLATE_TOGGLE)
  const resolvedEnableRbac = isTemplate ? enableTemplateRbac : enableRbac
  const basicColumns: TableProps<VenueSyslogPolicyType>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular> Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      fixed: 'left',
      render: (_, row) => {
        return isTemplate
          ? renderConfigTemplateDetailsComponent(ConfigTemplateType.VENUE, row.id!, row.name)
          : <TenantLink to={`/venues/${row.id}/venue-details/overview`}>{row.name}</TenantLink>
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

  const { data: syslogPolicy } = useConfigTemplateQueryFnSwitcher<SyslogPolicyDetailType>({
    useQueryFn: useGetSyslogPolicyQuery,
    useTemplateQueryFn: useGetSyslogPolicyTemplateQuery,
    enableRbac
  })

  const tableQuery = useTableQuery({
    useQuery: isTemplate ? useGetVenueTemplateForSyslogPolicyQuery : useGetVenueSyslogListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters: { id: (syslogPolicy?.venues ?? []).map(v => v.id) }
    },
    option: {
      skip: (syslogPolicy?.venues ?? []).length === 0
    },
    enableRbac: resolvedEnableRbac
  })

  useEffect(() => {
    if (!syslogPolicy || (syslogPolicy.venues ?? []).length === 0) return

    tableQuery.setPayload({
      ...tableQuery.payload,
      filters: {
        id: syslogPolicy.venues!.map((venue: SyslogVenue) => venue.id)
      }
    })
  },[syslogPolicy])

  return (
    <Card title={
      $t(
        { defaultMessage: 'Instance ({count})' },
        { count: tableQuery.data?.totalCount || 0 }
      )
    }>
      <Loader states={[tableQuery]}>
        <Table
          columns={basicColumns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
        />
      </Loader>
    </Card>
  )
}

export default SyslogVenueDetail

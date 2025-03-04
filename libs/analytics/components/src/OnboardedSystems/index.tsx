import { forwardRef, useState } from 'react'

import { Badge }                  from 'antd'
import { get, isEmpty }           from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { getUserProfile }                                                 from '@acx-ui/analytics/utils'
import { Loader, Table, TableProps, showActionModal, showToast, Tooltip } from '@acx-ui/components'
import { useTableQuery }                                                  from '@acx-ui/rc/utils'
import { getIntl }                                                        from '@acx-ui/utils'

import { useDeleteSmartZone, useGetSmartZoneListQuery, useGetDistinctSmartZoneStatusQuery } from './services'
import { Errors }                                                                           from './styledComponents'

import type { FormattedOnboardedSystem } from './services'

const statusTypeColorMap = {
  onboarded: {
    text: defineMessage({ defaultMessage: 'Onboarded' }),
    color: '--acx-semantics-green-50'
  },
  ongoing: {
    text: defineMessage({ defaultMessage: 'Ongoing' }),
    color: '--acx-semantics-yellow-40'
  },
  error: {
    text: defineMessage({ defaultMessage: 'Error' }),
    color: '--acx-semantics-red-50'
  },
  offboarded: {
    text: defineMessage({ defaultMessage: 'Offboarded' }),
    color: '--acx-neutrals-30'
  }
}

const errorMsgMap = {
  CANNOT_DELETE: defineMessage({ defaultMessage: 'Offboard this system to enable deletion' }),
  SZ_NOT_FOUND: defineMessage({ defaultMessage: 'System does not exist' })
}

const formatDeleteError = ({ device_name: name }: FormattedOnboardedSystem, response: Object) => {
  const { $t } = getIntl()
  const error = errorMsgMap[get(response, 'data.error', null) as keyof typeof errorMsgMap]
  const message = error ? $t(error) : get(response, 'message')
  return $t({
    defaultMessage: 'Failed to delete {name}{hasMessage, select, true {: {message}} other {}}'
  }, { name, hasMessage: Boolean(message), message })
}

const SmartZoneBadge = forwardRef<HTMLDivElement, {
    status: string
    statusType: keyof typeof statusTypeColorMap
  }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ status, statusType, ...props }, _) => {
  const { text, color } = statusTypeColorMap[statusType]
  return <Badge {...props} text={useIntl().$t(text)} color={`var(${color})`} />
})

export const TooltipContent = (value: FormattedOnboardedSystem) =>
  (): JSX.Element => (isEmpty(value.errors))
    ? <div>{value.status}</div>
    : <>
      <div>{value.status}</div><br />
      {getIntl().$t({ defaultMessage: 'Errors:' })}
      <Errors>{value.errors.map(error => <li key={error}>{error}</li>)}</Errors>
    </>

export const useOnboardedSystems = () => {
  const { $t } = useIntl()
  const tenant = getUserProfile()
  const tenantId = tenant.selectedTenant.id
  const { deleteSmartZone } = useDeleteSmartZone()
  const [ selected, setSelected ] = useState<FormattedOnboardedSystem>()
  const tenantIds = tenant.tenants
    .filter(t => Boolean(t.permissions['READ_ONBOARDED_SYSTEMS']))
    .map(t => t.id)

  const defaultPayload = {
    fields: [],  // select all
    filters: { tenantIds },
    currentTenantId: tenantIds.find(v => v === tenantId)
  }
  const settingsId = 'onboarded-system-table'
  const tableQuery = useTableQuery<FormattedOnboardedSystem>({
    // Use the default sortField by the component
    useQuery: useGetSmartZoneListQuery,
    pagination: { settingsId },
    defaultPayload,
    search: {
      searchTargetFields: ['account_name', 'device_name']
    },
    option: { skip: tenantIds.length === 0 }
  })

  const emptyValues: { key: string, value: string }[] = []
  const statusDisplayConfig = {
    onboarded: $t({ defaultMessage: 'Onboarded' }),
    ongoing: $t({ defaultMessage: 'Ongoing' }),
    error: $t({ defaultMessage: 'Error' }),
    offboarded: $t({ defaultMessage: 'Offboarded' })
  }

  const { statusDisplayMap } = useGetDistinctSmartZoneStatusQuery({
    payload: {
      filters: defaultPayload.filters
    }
  }, {
    skip: tenantIds.length === 0,
    selectFromResult: ({ data }) => {
      return {
        statusDisplayMap: data?.data?.map(status =>
          ({ key: status, value: statusDisplayConfig[status] })) ?? emptyValues
      }
    }
  })

  const title = defineMessage({
    defaultMessage: 'Onboarded Systems {count, select, null {} other {({count})}}',
    description: 'Translation string - Onboarded Systems'
  })

  const ColumnHeaders: TableProps<FormattedOnboardedSystem>['columns'] = [
    {
      key: 'status_type',
      title: $t({ defaultMessage: 'Status' }),
      sorter: true,
      dataIndex: 'status_type',
      render: (_, value, index) =>
        <span>
          <Tooltip
            arrowPointAtCenter
            dottedUnderline
            key={`tooltip-${index}`}
            title={TooltipContent(value)}
            children={<SmartZoneBadge
              status={value.status}
              statusType={value.status_type as keyof typeof statusTypeColorMap}
            />} />
        </span>,
      width: 50,
      fixed: 'left',
      filterable: statusDisplayMap
    },
    {
      key: 'account_name',
      title: $t({ defaultMessage: 'Account' }),
      dataIndex: 'account_name',
      sorter: true,
      searchable: true
    },
    {
      key: 'device_name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'device_name',
      sorter: true,
      searchable: true
    },
    {
      key: 'created_at',
      title: $t({ defaultMessage: 'Added Time' }),
      dataIndex: 'created_at',
      sorter: true
    }
  ]

  const component = <Loader states={[tableQuery]}>
    <Table
      rowKey='id'
      settingsId={settingsId}
      columns={ColumnHeaders}
      dataSource={tableQuery.data?.data}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      rowSelection={{
        type: 'radio',
        selectedRowKeys: selected ? [ selected.id ] : [],
        onChange: (
          _, selectedRows: FormattedOnboardedSystem[]
        ) => setSelected(selectedRows[0])
      }}
      rowActions={[{
        label: 'Delete',
        onClick: () => {
          showActionModal({
            type: 'confirm',
            title: $t({ defaultMessage: 'Delete "{name}"?' }, { name: selected?.device_name }),
            content: $t({ defaultMessage:
                'Historical data for this system will not be viewable anymore if you confirm.' }),
            onOk: async () => {
              await deleteSmartZone({ id: selected?.id! })
                .unwrap()
                .then(()=> {
                  showToast({
                    type: 'success',
                    content: $t({
                      defaultMessage: '{name} was deleted' }, { name: selected!.device_name }) })
                  setSelected(undefined)
                })
                .catch(response => {
                  showToast({ type: 'error', content: formatDeleteError(selected!, response) })
                })
            }
          })
        },
        disabled: !(selected?.canDelete),
        tooltip: !(selected?.canDelete)
          ? $t(errorMsgMap.CANNOT_DELETE) : $t({ defaultMessage: 'Delete' })
      }]}
    />
  </Loader>

  return { title: $t(title, { count: tableQuery.data?.totalCount ?? 0 }), component }
}

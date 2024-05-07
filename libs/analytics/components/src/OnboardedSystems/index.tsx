import { forwardRef, useEffect, useState, useCallback } from 'react'

import { Badge }                  from 'antd'
import { get, isEmpty }           from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { defaultSort, getUserProfile, sortProp, permissions }             from '@acx-ui/analytics/utils'
import { Loader, Table, TableProps, showActionModal, showToast, Tooltip } from '@acx-ui/components'
import { getIntl }                                                        from '@acx-ui/utils'

import { useFetchSmartZoneListQuery, useDeleteSmartZone } from './services'
import { Errors }                                         from './styledComponents'

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

const formatDeleteError = ({ name }: FormattedOnboardedSystem, response: Object) => {
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

  const queryResults = useFetchSmartZoneListQuery({
    tenantId,
    tenants: tenant.tenants.filter(t => Boolean(t.permissions[permissions.READ_ONBOARDED_SYSTEMS]))
  })

  const [count, setCount] = useState(queryResults.data?.length || 0)
  useEffect(() => { setCount(queryResults.data?.length || 0) }, [queryResults.data?.length])

  const title = defineMessage({
    defaultMessage: 'Onboarded Systems {count, select, null {} other {({count})}}',
    description: 'Translation string - Onboarded Systems'
  })

  const ColumnHeaders: TableProps<FormattedOnboardedSystem>['columns'] = [
    {
      key: 'statusType',
      title: $t({ defaultMessage: 'Status' }),
      sorter: { compare: sortProp('status', defaultSort) },
      dataIndex: 'statusType',
      render: (_, value, index) =>
        <span>
          <Tooltip
            arrowPointAtCenter
            dottedUnderline
            key={`tooltip-${index}`}
            title={TooltipContent(value)}
            children={<SmartZoneBadge
              status={value.status}
              statusType={value.statusType as keyof typeof statusTypeColorMap}
            />} />
        </span>,
      width: 50,
      fixed: 'left',
      filterable: [
        { key: 'onboarded', value: $t({ defaultMessage: 'Onboarded' }) },
        { key: 'ongoing', value: $t({ defaultMessage: 'Ongoing' }) },
        { key: 'error', value: $t({ defaultMessage: 'Error' }) },
        { key: 'offboarded', value: $t({ defaultMessage: 'Offboarded' }) }
      ]
    },
    {
      key: 'accountName',
      title: $t({ defaultMessage: 'Account' }),
      dataIndex: 'accountName',
      sorter: { compare: sortProp('accountName', defaultSort) },
      searchable: true
    },
    {
      key: 'name',
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      searchable: true
    },
    {
      key: 'formattedAddedTime',
      title: $t({ defaultMessage: 'Added Time' }),
      dataIndex: 'formattedAddedTime',
      sorter: { compare: sortProp('addedTime', defaultSort) }
    }
  ]

  const component = <Loader states={[queryResults]}>
    <Table
      rowKey='id'
      columns={ColumnHeaders}
      dataSource={queryResults.data}
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
            title: $t({ defaultMessage: 'Delete "{name}"?' }, { name: selected?.name }),
            content: $t({ defaultMessage:
                'Historical data for this system will not be viewable anymore if you confirm.' }),
            onOk: async () => {
              await deleteSmartZone({ tenants: tenant.tenants.map(t => t.id), id: selected?.id! })
                .unwrap()
                .then(()=> {
                  showToast({
                    type: 'success',
                    content: $t({
                      defaultMessage: '{name} was deleted' }, { name: selected!.name }) })
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
      onDisplayRowChange={
        useCallback((dataSource: FormattedOnboardedSystem[]) => setCount(dataSource.length), [])
      }
    />
  </Loader>

  return { title: $t(title, { count }), component }
}

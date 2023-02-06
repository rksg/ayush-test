import { useMemo } from 'react'

import _                          from 'lodash'
import { useIntl, defineMessage } from 'react-intl'
import { useNavigate }            from 'react-router-dom'

import { useGetUserProfileQuery }              from '@acx-ui/rc/services'
import { noDataSymbol, sortProp, defaultSort }        from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, showActionModal } from '@acx-ui/components'
import { TenantLink, useTenantLink, useParams }                  from '@acx-ui/react-router-dom'
import { convertDateTimeToSqlFormat, formatter }                                  from '@acx-ui/utils'

import { ServiceGuardSpec, useNetworkHealthDeleteMutation, useNetworkHealthQuery } from './services'

const networkHealthMapping = {
  'virtual-client': 'Virtual Client',
  'virtual-wireless-client': 'Virtual Wireless Client',
  'on-demand': 'On Demand',
  'scheduled': 'Scheduled'
}

export function NetworkHealthTable () {
  const intl = useIntl()
  const { $t } = intl
  const queryResults = useNetworkHealthQuery({})
  const navigate = useNavigate()
  const linkToEditTest = useTenantLink('/serviceValidation/networkHealth/')
  const params = useParams()
  const { data } = useGetUserProfileQuery({ params })
  const [deleteMutation] = useNetworkHealthDeleteMutation()

  const rowActions: TableProps<ServiceGuardSpec>['rowActions'] = [
    {
      label: $t(defineMessage({ defaultMessage: 'Run now' })),
      onClick: () => console.log('run'),
      disabled: (selectedRow) => (selectedRow[0]?.apsCount > 0) ? false : true // TODO: handle for apsPendingCount
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Edit' })),
      onClick: (selectedRows) => {
        navigate(`${linkToEditTest.pathname}/${selectedRows[0].id}/edit`, { replace: false })
      },
      disabled: (selectedRow) => selectedRow[0]?.id === data?.externalId ? false : true
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Clone' })),
      onClick: () => {},
      disabled: true
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Delete' })),
      onClick: ([{ name, id }]) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t(defineMessage({ defaultMessage: 'test' })),
            entityValue: name
          },
          onOk: async () => {
            await deleteMutation({params: {id}})
          }
        })
      }
    }
  ]

  const ColumnHeaders: TableProps<ServiceGuardSpec>['columns'] = useMemo(() => [
    {
      key: 'name',
      title: $t(defineMessage({ defaultMessage: 'Test Name' })),
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      searchable: true,
      render: (value, row) => 
        <TenantLink
          to={`/serviceValidation/networkHealth/${row.id}/tests/${row?.tests.items[0].id}`}
        >
          {value}
        </TenantLink>
    },
    {
      key: 'clientType',
      title: $t(defineMessage({ defaultMessage: 'Client Type' })),
      dataIndex: 'clientType',
      sorter: { compare: sortProp('clientType', defaultSort) },
      filterable: true,
      render: (value) => networkHealthMapping[value as keyof typeof networkHealthMapping]
    },
    {
      key: 'type',
      title: $t(defineMessage({ defaultMessage: 'Test Type' })),
      dataIndex: 'type',
      sorter: { compare: sortProp('type', defaultSort) },
      filterable: true,
      render: (value) => networkHealthMapping[value as keyof typeof networkHealthMapping]
    },
    {
      key: 'apsCount',
      title: $t(defineMessage({ defaultMessage: 'APs' })),
      dataIndex: 'apsCount',
      render: (value) => <TenantLink to={'/serviceValidation/networkHealth'}>{value}</TenantLink>, // TODO: handle link
      sorter: { compare: sortProp('apsCount', defaultSort) }
    },
    {
      key: 'lastRun',
      title: $t(defineMessage({ defaultMessage: 'Last Run' })),
      dataIndex: ['tests', 'items'],
      render: (value) => {
        const result = _.get(value, '[0].createdAt')
        if (result) {
          return convertDateTimeToSqlFormat(result)
        } else {
          return noDataSymbol
        }
      }
    },
    {
      key: 'apsUnderTest',
      title: $t(defineMessage({ defaultMessage: 'APs Under Test' })),
      dataIndex: ['tests', 'items'],
      render: (value) => {
        const result = _.get(value, '[0].summary.apsPendingCount')
        if (result) {
          return <TenantLink to={'/serviceValidation/networkHealth'}>{result}</TenantLink> // TODO: handle link
        } else {
          return noDataSymbol
        }
      }
    },
    {
      key: 'lastResult',
      title: $t(defineMessage({ defaultMessage: 'Last Result' })),
      dataIndex: ['tests', 'items'],
      render: (value) => {
        const total = _.get(value, '[0].summary.apsTestedCount')
        const success = _.get(value, '[0].summary.apsSuccessCount')
        if (total) {
          return `${formatter('percentFormatRound')(success/total)} pass`
        } else {
          return noDataSymbol
        }
      }
    }
  ], [])

  return (
    <Loader states={[queryResults]}>
      <Table
        type='tall'
        columns={ColumnHeaders}
        dataSource={queryResults.data}
        rowSelection={{ type: 'radio' }}
        rowActions={rowActions}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataSymbol}
      />
    </Loader>
  )
}

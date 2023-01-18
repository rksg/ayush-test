import { useMemo } from 'react'

import { useIntl, defineMessage } from 'react-intl'
import { useNavigate }            from 'react-router-dom'

import { noDataSymbol, sortProp, defaultSort }        from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, showActionModal } from '@acx-ui/components'
import { TenantLink, useTenantLink }                  from '@acx-ui/react-router-dom'

import { ServiceGuardSpec, useNetworkHealthQuery } from './services'

export function NetworkHealthTable () {
  const intl = useIntl()
  const { $t } = intl
  const queryResults = useNetworkHealthQuery({})
  const navigate = useNavigate()
  const linkToEditTest = useTenantLink('/serviceValidation/networkHealth/')

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
      }
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Clone' })),
      onClick: () => console.log('clone')
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Delete' })),
      onClick: ([{ name }]) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t(defineMessage({ defaultMessage: 'test' })),
            entityValue: name
          },
          onOk: () => console.log('delete') // TODO: handle delete
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
        <TenantLink to={`/serviceValidation/networkHealth/${row.id}`}>{value}</TenantLink>
    },
    {
      key: 'clientType',
      title: $t(defineMessage({ defaultMessage: 'Client Type' })),
      dataIndex: 'clientType',
      sorter: { compare: sortProp('clientType', defaultSort) }
    },
    {
      key: 'type',
      title: $t(defineMessage({ defaultMessage: 'Test Type' })),
      dataIndex: 'type',
      sorter: { compare: sortProp('type', defaultSort) }
    },
    {
      key: 'apsCount',
      title: $t(defineMessage({ defaultMessage: 'APs' })),
      dataIndex: 'apsCount',
      render: (value) => <TenantLink to={'/serviceValidation/networkHealth'}>{value}</TenantLink>,
      sorter: { compare: sortProp('apsCount', defaultSort) }
    },
    {
      key: 'lastRun',
      title: $t(defineMessage({ defaultMessage: 'Last Run' })),
      dataIndex: 'tests.items.createdAt' // TODO: handle render table data
    },
    {
      key: 'apsUnderTest',
      title: $t(defineMessage({ defaultMessage: 'APs Under Test' })),
      dataIndex: 'tests.items.summary.apsTestedCount' // TODO: handle render table data
    },
    {
      key: 'lastResult',
      title: $t(defineMessage({ defaultMessage: 'Last Result' })),
      dataIndex: 'lastResult' // TODO: handle render table data
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

import React, { useCallback, useMemo } from 'react'

import _                          from 'lodash'
import { useIntl, defineMessage } from 'react-intl'
import { useNavigate }            from 'react-router-dom'

import { noDataSymbol, sortProp, defaultSort }                   from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, showActionModal, showToast } from '@acx-ui/components'
import { useUserProfileContext }                                 from '@acx-ui/rc/components'
import { TenantLink, useTenantLink }                             from '@acx-ui/react-router-dom'
import { formatter }                                             from '@acx-ui/utils'

import * as contents                                                                from '../contents'
import { useMutationResponseEffect }                                                from '../services'
import { ClientType, NetworkHealthTest, TestType }                                  from '../types'
import { formatApsUnderTest, formatLastResult, StatsFromSummary, statsFromSummary } from '../utils'

import { ServiceGuardSpec, useNetworkHealthDeleteMutation, useNetworkHealthQuery, useNetworkHealthRunMutation } from './services'

export function NetworkHealthTable () {
  const { $t } = useIntl()
  const queryResults = useNetworkHealthQuery()
  const navigate = useNavigate()
  const networkHealthPath = useTenantLink('/serviceValidation/networkHealth/')
  const { data: userProfile } = useUserProfileContext()
  const [deleteMutation, deleteResponse] = useNetworkHealthDeleteMutation()
  const [runMutation, runResponse] = useNetworkHealthRunMutation()

  useMutationResponseEffect(deleteResponse, useCallback(() => {
    showToast({
      type: 'success',
      content: $t(contents.messageMapping.TEST_DELETED)
    })
  }, [$t]))

  useMutationResponseEffect(runResponse, useCallback(() => {
    showToast({
      type: 'success',
      content: $t(contents.messageMapping.RUN_TEST_SUCCESS)
    })
  }, [$t]))

  const getTableData = (details: ServiceGuardSpec) => {
    const summary = details.tests?.items[0]?.summary || {}
    const { isOngoing, apsUnderTest, apsFinishedTest, lastResult
    } = statsFromSummary(summary as NetworkHealthTest['summary'])
    return { ...details,
      ...(isOngoing && { isOngoing }),
      ...(apsUnderTest !== undefined && { apsUnderTest }),
      ...(apsFinishedTest !== undefined && { apsFinishedTest }),
      ...(lastResult !== undefined && { lastResult })
    }
  }

  const getLastRun = (result: string) =>
    result ? formatter('dateTimeFormatWithSeconds')(result)
      : noDataSymbol

  const rowActions: TableProps<ServiceGuardSpec>['rowActions'] = [
    {
      label: $t(defineMessage({ defaultMessage: 'Run now' })),
      onClick: ([{ id }], clearSelection) => {
        runMutation({ id })
        clearSelection()
      },
      disabled: (selectedRow) => selectedRow[0]?.apsCount === 0
        || selectedRow[0]?.tests.items[0]?.summary.apsPendingCount > 0
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Edit' })),
      onClick: (selectedRows) => {
        navigate(`${networkHealthPath.pathname}/${selectedRows[0].id}/edit`)
      },
      disabled: (selectedRow) => selectedRow[0]?.userId === userProfile?.externalId ? false : true
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Clone' })),
      onClick: /* istanbul ignore next */ () => {},
      disabled: true
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Delete' })),
      onClick: ([{ name, id }], clearSelection) => {
        showActionModal({
          type: 'confirm',
          customContent: {
            action: 'DELETE',
            entityName: $t(defineMessage({ defaultMessage: 'test' })),
            entityValue: name
          },
          onOk: () => {
            deleteMutation({ id })
            clearSelection()
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
      render: (value, row) => row.tests.items[0]?.summary.apsTestedCount ?
        <TenantLink to={
          `/serviceValidation/networkHealth/${row.id}/tests/${row.tests.items[0]?.id}`
        }>
          {value}
        </TenantLink> : value
    },
    {
      key: 'clientType',
      title: $t(defineMessage({ defaultMessage: 'Client Type' })),
      dataIndex: 'clientType',
      sorter: { compare: sortProp('clientType', defaultSort) },
      filterable: Object.entries(contents.clientTypes).map(
        ([key, value])=>({ key, value: $t(value) })),
      render: (value) => $t(contents.clientTypes[value as ClientType])
    },
    {
      key: 'type',
      title: $t(defineMessage({ defaultMessage: 'Test Type' })),
      dataIndex: 'type',
      sorter: { compare: sortProp('type', defaultSort) },
      filterable: Object.entries(contents.testTypes).map(
        ([key, value])=>({ key, value: $t(value) })),
      render: (value) => $t(contents.testTypes[value as TestType])
    },
    {
      key: 'apsCount',
      title: $t(defineMessage({ defaultMessage: 'APs' })),
      dataIndex: 'apsCount',
      render: (value) => value,
      sorter: { compare: sortProp('apsCount', defaultSort) }
    },
    {
      key: 'lastRun',
      title: $t(defineMessage({ defaultMessage: 'Last Run' })),
      dataIndex: ['tests', 'items'],
      render: (value: React.ReactNode) => {
        const result = _.get(value, '[0].createdAt')
        return getLastRun(result)
      }
    },
    {
      key: 'apsUnderTest',
      title: $t(defineMessage({ defaultMessage: 'APs Under Test' })),
      dataIndex: ['tests', 'items'],
      render: (_, row) => {
        const tableData = row
          ? getTableData(row) : {} as StatsFromSummary
        return formatApsUnderTest(tableData, $t)
      }
    },
    {
      key: 'lastResult',
      title: $t(defineMessage({ defaultMessage: 'Last Result' })),
      dataIndex: ['tests', 'items'],
      render: (_, row) => {
        const tableData = row
          ? getTableData(row) : {} as StatsFromSummary
        return formatLastResult(tableData, $t)
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

import React, { useMemo, useEffect } from 'react'

import _                          from 'lodash'
import { useIntl, defineMessage } from 'react-intl'
import { useNavigate }            from 'react-router-dom'

import { noDataSymbol, sortProp, defaultSort }                   from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, showActionModal, showToast } from '@acx-ui/components'
import { useUserProfileContext }                                 from '@acx-ui/rc/components'
import { TenantLink, useTenantLink }                             from '@acx-ui/react-router-dom'
import { formatter }                                             from '@acx-ui/utils'

import * as contents                                              from '../contents'
import { ClientType as ClientTypeEnum, TestType as TestTypeEnum } from '../types'

import { ServiceGuardSpec, useNetworkHealthDeleteMutation, useNetworkHealthQuery, useNetworkHealthRunMutation } from './services'

export const getLastRun = (result: string) => {
  if (result) {
    return formatter('dateTimeFormatWithSeconds')(result)
  } else {
    return noDataSymbol
  }
}

export const getAPsUnderTest = (result: number) => {
  if (result) {
    return result
  } else {
    return noDataSymbol
  }
}

export const getLastResult = (total: number, success: number) => {
  if (total) {
    return `${formatter('percentFormatRound')(success/total)} pass`
  } else {
    return noDataSymbol
  }
}

export function NetworkHealthTable () {
  const intl = useIntl()
  const { $t } = intl
  const queryResults = useNetworkHealthQuery({})
  const navigate = useNavigate()
  const navigateToList = useTenantLink('/serviceValidation/networkHealth/')
  const { data: userProfile } = useUserProfileContext()
  const [deleteMutation, deleteResponse] = useNetworkHealthDeleteMutation()
  const [runMutation, runResponse] = useNetworkHealthRunMutation()

  useEffect(() => {
    if (!deleteResponse.data) return

    if (!deleteResponse.data.userErrors) {
      showToast({
        type: 'success',
        content: $t(contents.messageMapping.TEST_DELETED)
      })
    } else {
      showToast({
        type: 'error',
        content: $t(contents.messageMapping.SPEC_NOT_FOUND)
      })
    }
  }, [$t, deleteResponse])

  useEffect(() => {
    if (!runResponse.data) return

    if (!runResponse.data.userErrors) {
      showToast({
        type: 'success',
        content: $t(contents.messageMapping.RUN_TEST_SUCCESS)
      })
    } else {
      const key = runResponse.data.userErrors[0].message as keyof typeof contents.messageMapping
      const errorMessage = $t(contents.messageMapping[key])
      showToast({ type: 'error', content: errorMessage })
    }
  }, [$t, runResponse])

  const rowActions: TableProps<ServiceGuardSpec>['rowActions'] = [
    {
      label: $t(defineMessage({ defaultMessage: 'Run now' })),
      onClick: async ([{ id }], clearSelection) => {
        await runMutation({ params: { id } })
        clearSelection()
      },
      disabled: (selectedRow) => (
        selectedRow[0]?.apsCount == 0 || selectedRow[0]?.tests.items[0].summary.apsPendingCount > 0
      )
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Edit' })),
      onClick: (selectedRows) => {
        navigate(`${navigateToList.pathname}/${selectedRows[0].id}/edit`)
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
          onOk: async () => {
            await deleteMutation({ params: { id } })
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
      render: (value, row) =>
        <TenantLink to={
          `/serviceValidation/networkHealth/${row.tests.items[0]?.id}`
        }>
          {value}
        </TenantLink>
    },
    {
      key: 'clientType',
      title: $t(defineMessage({ defaultMessage: 'Client Type' })),
      dataIndex: 'clientType',
      sorter: { compare: sortProp('clientType', defaultSort) },
      filterable: Object.entries(contents.clientTypes).map(
        ([key, value])=>({ key, value: $t(value) })),
      render: (value) => $t(contents.clientTypes[value as ClientTypeEnum])
    },
    {
      key: 'type',
      title: $t(defineMessage({ defaultMessage: 'Test Type' })),
      dataIndex: 'type',
      sorter: { compare: sortProp('type', defaultSort) },
      filterable: Object.entries(contents.testTypes).map(
        ([key, value])=>({ key, value: $t(value) })),
      render: (value) => $t(contents.testTypes[value as TestTypeEnum])
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
      render: (value: React.ReactNode) => {
        const result = _.get(value, '[0].summary.apsTestedCount')
        return getAPsUnderTest(result)
      }
    },
    {
      key: 'lastResult',
      title: $t(defineMessage({ defaultMessage: 'Last Result' })),
      dataIndex: ['tests', 'items'],
      render: (value: React.ReactNode) => {
        const total = _.get(value, '[0].summary.apsTestedCount')
        const success = _.get(value, '[0].summary.apsSuccessCount')
        return getLastResult(total, success)
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

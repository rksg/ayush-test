import { useCallback, useState } from 'react'

import { Form }                   from 'antd'
import { useIntl, defineMessage } from 'react-intl'
import { useNavigate }            from 'react-router-dom'

import { noDataSymbol, sortProp, defaultSort, dateSort }                from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, showActionModal, showToast, Modal } from '@acx-ui/components'
import { TenantLink, useTenantLink }                                    from '@acx-ui/react-router-dom'
import { useUserProfileContext }                                        from '@acx-ui/user'
import { formatter }                                                    from '@acx-ui/utils'

import * as contents      from '../contents'
import { TestName }       from '../NetworkHealthForm/FormItems'
import {
  useMutationResponseEffect,
  useAllNetworkHealthSpecsQuery,
  useDeleteNetworkHealthTestMutation,
  useRunNetworkHealthTestMutation,
  useCloneNetworkHealthTestMutation,
  NetworkHealthTableRow
} from '../services'
import {
  ClientType,
  NetworkHealthSpec,
  TestType
} from '../types'
import {
  statsFromSummary,
  formatApsUnderTest,
  formatLastResult,
  formatTestType
} from '../utils'

export function lastResultSort (a: NetworkHealthTableRow, b: NetworkHealthTableRow) {
  return defaultSort(
    statsFromSummary(a.latestTest?.summary).lastResult ?? -1,
    statsFromSummary(b.latestTest?.summary).lastResult ?? -1
  )
}

export function NetworkHealthTable () {
  const { $t } = useIntl()
  const queryResults = useAllNetworkHealthSpecsQuery()
  const navigate = useNavigate()
  const networkHealthPath = useTenantLink('/serviceValidation/networkHealth/')
  const { data: userProfile } = useUserProfileContext()
  const { deleteTest, response: deleteResponse } = useDeleteNetworkHealthTestMutation()
  const { runTest, response: runResponse } = useRunNetworkHealthTestMutation()
  const { cloneTest, response: cloneResponse } = useCloneNetworkHealthTestMutation()

  const [form] = Form.useForm()
  const [clone, setClone] = useState<NetworkHealthSpec['id']|null>(null)

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

  useMutationResponseEffect(cloneResponse, useCallback(() => {
    showToast({
      type: 'success',
      content: $t(contents.messageMapping.TEST_CLONED)
    })
  }, [$t]))

  const rowActions: TableProps<NetworkHealthTableRow>['rowActions'] = [
    {
      label: $t(defineMessage({ defaultMessage: 'Run now' })),
      onClick: ([{ id }], clearSelection) => {
        runTest({ id })
        clearSelection()
      },
      disabled: ([selectedRow]) =>
        selectedRow?.apsCount === 0 ||
        statsFromSummary(selectedRow?.latestTest?.summary).isOngoing,
      tooltip: ([selectedRow]) => {
        if (selectedRow?.apsCount === 0)
          return $t(contents.messageMapping.RUN_TEST_NO_APS)
        if (statsFromSummary(selectedRow?.latestTest?.summary).isOngoing)
          return $t(contents.messageMapping.TEST_IN_PROGRESS)
        return undefined
      }
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Edit' })),
      onClick: (selectedRows) => {
        navigate(`${networkHealthPath.pathname}/${selectedRows[0].id}/edit`)
      },
      disabled: ([selectedRow]) => {
        return selectedRow?.userId === userProfile?.externalId
          ? false
          : true
      },
      tooltip: ([selectedRow]) => selectedRow?.userId === userProfile?.externalId
        ? undefined
        : $t(contents.messageMapping.EDIT_NOT_ALLOWED)
    },
    {
      label: $t(defineMessage({ defaultMessage: 'Clone' })),
      onClick: ([{ id }]) => setClone(id)
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
            deleteTest({ id })
            clearSelection()
          }
        })
      }
    }
  ]

  const handleCleanUp = () => {
    setClone(null)
    form.resetFields()
    const clearButton = document?.querySelector('button[data-id="table-clear-btn"]')
    if (clearButton) {
      // @ts-ignore
      clearButton.click()
    }
  }

  const handleFinish = ({ name }: Pick<NetworkHealthSpec, 'name'>) => {
    cloneTest({ id: clone!, name })
    handleCleanUp()
  }

  const cloneModal = <Modal
    title={$t({ defaultMessage: 'Clone test' })}
    visible={!!clone}
    onCancel={handleCleanUp}
    okText={$t({ defaultMessage: 'Save' })}
    onOk={() => form.submit()}
    destroyOnClose={true}
  >
    <Form
      form={form}
      validateTrigger='onBlur'
      onFinish={handleFinish}
    >
      <TestName />
    </Form>
  </Modal>

  const ColumnHeaders: TableProps<NetworkHealthTableRow>['columns'] = [
    {
      key: 'name',
      title: $t(defineMessage({ defaultMessage: 'Test Name' })),
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      searchable: true,
      render: (value, row, _, highlightFn) => {
        const highlightedValue = highlightFn(String(value))
        return row.latestTest?.summary.apsTestedCount
          ? <TenantLink
            to={`/serviceValidation/networkHealth/${row.id}/tests/${row.latestTest?.id}`}
          >
            {highlightedValue}
          </TenantLink>
          : highlightedValue
      }
    },
    {
      key: 'clientType',
      title: $t(defineMessage({ defaultMessage: 'Client Type' })),
      dataIndex: 'clientType',
      sorter: { compare: sortProp('clientType', defaultSort) },
      render: (value) => $t(contents.clientTypes[value as ClientType])
    },
    {
      key: 'type',
      title: $t(defineMessage({ defaultMessage: 'Test Type' })),
      dataIndex: 'type',
      sorter: { compare: sortProp('type', defaultSort) },
      render: (value, row) => formatTestType(value as TestType, row.schedule)
    },
    {
      key: 'apsCount',
      title: $t(defineMessage({ defaultMessage: 'APs' })),
      dataIndex: 'apsCount',
      render: (value) => value,
      sorter: { compare: sortProp('apsCount', defaultSort) },
      align: 'center'
    },
    {
      key: 'lastRun',
      title: $t(defineMessage({ defaultMessage: 'Last Run' })),
      dataIndex: ['latestTest', 'createdAt'],
      render: (_, row) => row.latestTest?.createdAt
        ? formatter('dateTimeFormatWithSeconds')(row.latestTest?.createdAt)
        : noDataSymbol,
      sorter: { compare: sortProp('latestTest.createdAt', dateSort) }
    },
    {
      key: 'apsUnderTest',
      title: $t(defineMessage({ defaultMessage: 'APs Under Test' })),
      dataIndex: ['latestTest', 'summary', 'apsTestedCount'],
      render: (_, row) => formatApsUnderTest(row.latestTest?.summary),
      sorter: { compare: sortProp('latestTest.summary.apsTestedCount', defaultSort) },
      align: 'center'
    },
    {
      key: 'lastResult',
      title: $t(defineMessage({ defaultMessage: 'Last Result' })),
      dataIndex: ['latestTest', 'summary', 'apsSuccessCount'],
      render: (_, row) => formatLastResult(row.latestTest?.summary),
      sorter: { compare: lastResultSort }
    }
  ]

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
      {cloneModal}
    </Loader>
  )
}

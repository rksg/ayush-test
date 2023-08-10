import { useCallback, useContext, useState } from 'react'

import { Form }                   from 'antd'
import { useIntl, defineMessage } from 'react-intl'
import { useNavigate }            from 'react-router-dom'

import { sortProp, defaultSort, dateSort }                              from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, showActionModal, showToast, Modal } from '@acx-ui/components'
import { DateFormatEnum, formatter }                                    from '@acx-ui/formatter'
import { TenantLink, useTenantLink }                                    from '@acx-ui/react-router-dom'
import { useUserProfileContext }                                        from '@acx-ui/user'
import { noDataDisplay }                                                from '@acx-ui/utils'

import { CountContext }  from '..'
import * as contents     from '../contents'
import { TestName }      from '../ServiceGuardForm/FormItems'
import {
  useMutationResponseEffect,
  useAllServiceGuardSpecsQuery,
  useDeleteServiceGuardTestMutation,
  useRunServiceGuardTestMutation,
  useCloneServiceGuardTestMutation,
  ServiceGuardTableRow
} from '../services'
import { ServiceGuardSpec } from '../types'
import {
  statsFromSummary,
  formatApsUnderTest,
  formatLastResult,
  formatTestType
} from '../utils'

export function lastResultSort (a: ServiceGuardTableRow, b: ServiceGuardTableRow) {
  return defaultSort(
    statsFromSummary(a.latestTest?.summary).lastResult ?? -1,
    statsFromSummary(b.latestTest?.summary).lastResult ?? -1
  )
}

export function ServiceGuardTable () {
  const { $t } = useIntl()
  const queryResults = useAllServiceGuardSpecsQuery()
  const navigate = useNavigate()
  const { setCount } = useContext(CountContext)
  const serviceGuardPath = useTenantLink('/analytics/serviceValidation/')
  const { data: userProfile } = useUserProfileContext()
  const { deleteTest, response: deleteResponse } = useDeleteServiceGuardTestMutation()
  const { runTest, response: runResponse } = useRunServiceGuardTestMutation()
  const { cloneTest, response: cloneResponse } = useCloneServiceGuardTestMutation()

  const [form] = Form.useForm()
  const [clone, setClone] = useState<ServiceGuardSpec['id']|null>(null)

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

  const rowActions: TableProps<ServiceGuardTableRow>['rowActions'] = [
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
        navigate(`${serviceGuardPath.pathname}/${selectedRows[0].id}/edit`)
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

  const handleFinish = ({ name }: Pick<ServiceGuardSpec, 'name'>) => {
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

  const ColumnHeaders: TableProps<ServiceGuardTableRow>['columns'] = [
    {
      key: 'name',
      title: $t(defineMessage({ defaultMessage: 'Test Name' })),
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      searchable: true,
      fixed: 'left',
      render: (_, row, __, highlightFn) => {
        const highlightedValue = highlightFn(row.name)
        return row.latestTest
          ? <TenantLink
            to={`/analytics/serviceValidation/${row.id}/tests/${row.latestTest?.id}`}
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
      render: (_, { clientType }) => $t(contents.clientTypes[clientType])
    },
    {
      key: 'type',
      title: $t(defineMessage({ defaultMessage: 'Test Type' })),
      dataIndex: 'type',
      sorter: { compare: sortProp('type', defaultSort) },
      render: (_, row) => formatTestType(row.type, row.schedule)
    },
    {
      key: 'apsCount',
      title: $t(defineMessage({ defaultMessage: 'APs' })),
      dataIndex: 'apsCount',
      sorter: { compare: sortProp('apsCount', defaultSort) },
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center'
    },
    {
      key: 'lastRun',
      title: $t(defineMessage({ defaultMessage: 'Last Run' })),
      dataIndex: ['latestTest', 'createdAt'],
      render: (_, row) => row.latestTest?.createdAt
        ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.latestTest?.createdAt)
        : noDataDisplay,
      sorter: { compare: sortProp('latestTest.createdAt', dateSort) }
    },
    {
      key: 'apsUnderTest',
      title: $t(defineMessage({ defaultMessage: 'APs Under Test' })),
      dataIndex: ['latestTest', 'summary', 'apsTestedCount'],
      render: (_, row) => formatApsUnderTest(row.latestTest?.summary),
      sorter: { compare: sortProp('latestTest.summary.apsTestedCount', defaultSort) },
      sortDirections: ['descend', 'ascend', 'descend'],
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
        settingsId='network-health-table'
        type='tall'
        columns={ColumnHeaders}
        dataSource={queryResults.data}
        rowSelection={{ type: 'radio' }}
        rowActions={rowActions}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
        onDisplayRowChange={(dataSource) => setCount?.(dataSource.length)}
      />
      {cloneModal}
    </Loader>
  )
}

/* eslint-disable max-len */
import { useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, cssStr, Loader, Modal, Table, TableProps, Descriptions, StackedBarChart } from '@acx-ui/components'
import {
  useGetSwitchConfigHistoryQuery,
  useGetVenueConfigHistoryQuery,
  useLazyGetVenueConfigHistoryDetailQuery
} from '@acx-ui/rc/services'
import { ConfigTypeEnum, ConfigurationHistory, DispatchFailedReason, FILTER, transformConfigType, useTableQuery } from '@acx-ui/rc/utils'
import { useParams }                                                                                              from '@acx-ui/react-router-dom'
import { getIntl }                                                                                                from '@acx-ui/utils'

import { CodeMirrorWidget } from '../CodeMirrorWidget'

import { ErrorsTable }              from './ErrorsTable'
import * as UI                      from './styledComponents'
import { SwitchConfigDetailsTable } from './SwitchConfigDetailsTable'

import type { RadioChangeEvent } from 'antd'

export function SwitchConfigHistoryTable (props: {
  isVenueLevel?: boolean
}) {
  const { $t } = useIntl()
  const { isVenueLevel } = props
  const codeMirrorEl = useRef(null as unknown as { highlightLine: Function, removeHighlightLine: Function })
  const { tenantId, venueId } = useParams()
  const [visible, setVisible] = useState(false)
  const [showError, setShowError] = useState(true)
  const [showClis, setShowClis] = useState(true)
  const [collapseActive, setCollapseActive] = useState(false)
  const [dispatchFailedReason, setDispatchFailedReason] = useState([] as DispatchFailedReason[])
  const [selectedRow, setSelectedRow] = useState(null as unknown as ConfigurationHistory)
  const [selectedConfigRow, setSelectedConfigRow] = useState(null as unknown as ConfigurationHistory)

  const [getVenueConfigHistoryDetail] = useLazyGetVenueConfigHistoryDetailQuery()
  const [configDetails, setConfigDetails] = useState([] as unknown as ConfigurationHistory[])
  const [filterType, setFilterType] = useState('ALL')

  const getConfigHistoryDetail = async (transactionId: string, filterByStatus: string) => {
    const payload = {
      filterByStatus: filterByStatus,
      sortInfo: { sortColumn: 'startTime', dir: 'DESC' },
      limit: 10
    }
    return (await getVenueConfigHistoryDetail({
      params: { tenantId, venueId, transactionId: transactionId }, payload }, true)
    )?.data?.response?.list?.map((config, index: number) => ({ ...config, id: `${index}` })) ?? []
  }

  const showModal = async (selectedRow: ConfigurationHistory) => {
    const configHistoryDetail = isVenueLevel
      ? await getConfigHistoryDetail(selectedRow.transactionId, 'ALL') : null
    const row = (isVenueLevel ? configHistoryDetail?.[0] : selectedRow) as ConfigurationHistory

    setConfigDetails(configHistoryDetail as ConfigurationHistory[])
    setSelectedRow(selectedRow)
    setSelectedConfigRow(row)
    setDispatchFailedReason(row?.dispatchFailedReason as DispatchFailedReason[] || [])
    setCollapseActive(!row?.dispatchFailedReason?.length)
    setShowClis(!!row?.clis)
    setShowError(!!row?.clis || !!row?.dispatchFailedReason?.length)
    setVisible(true)
  }

  const handleCancel = () => {
    setDispatchFailedReason([])
    setVisible(false)
    setFilterType('ALL')
  }

  const tableQuery = useTableQuery({
    useQuery: isVenueLevel ? useGetVenueConfigHistoryQuery : useGetSwitchConfigHistoryQuery,
    defaultPayload: {
    },
    sorter: {
      sortField: 'startTime',
      sortOrder: 'DESC'
    }
  })

  const configTypeFilterOptions = Object.values(ConfigTypeEnum).map(ctype=>({
    key: ctype, value: transformConfigType(ctype)
  }))

  const getCols = () => {
    const columns: TableProps<ConfigurationHistory>['columns'] = [{
      key: 'startTime',
      title: $t({ defaultMessage: 'Time' }),
      dataIndex: 'startTime',
      sorter: true,
      defaultSortOrder: 'descend',
      disable: true,
      render: function (_, row) {
        return <Button type='link' size='small' onClick={() => {showModal(row)}}>
          {row.startTime}
        </Button>
      }
    }, {
      key: 'configType',
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'configType',
      filterable: configTypeFilterOptions,
      filterMultiple: false,
      sorter: !isVenueLevel
    }, {
      key: 'numberOfSwitches',
      title: $t({ defaultMessage: '# of Switches' }),
      dataIndex: 'numberOfSwitches',
      sorter: false
    }, {
      key: 'dispatchStatus',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'dispatchStatus',
      sorter: !isVenueLevel,
      render: (_, row) => isVenueLevel ? getStatusBar(row) : row.dispatchStatus
    }]

    return columns.filter(c => isVenueLevel || !c.key.includes('numberOfSwitches'))
  }

  const onSelectConfigChange = (row: ConfigurationHistory) => {
    setSelectedConfigRow(row)
    setDispatchFailedReason(row.dispatchFailedReason as DispatchFailedReason[] || [])
    setCollapseActive(!row?.dispatchFailedReason?.length)
    setShowClis(!!row?.clis)
    setShowError(!!row?.clis || !!row?.dispatchFailedReason?.length)
  }

  const onFilterConfigDetails = async (e: RadioChangeEvent) => {
    const filterType = e.target.value
    const configHistoryDetail = await getConfigHistoryDetail(selectedRow.transactionId, filterType)
    const row = configHistoryDetail?.[0]

    setFilterType(filterType)
    setConfigDetails(configHistoryDetail)
    setSelectedConfigRow(row)
    setDispatchFailedReason(row?.dispatchFailedReason as DispatchFailedReason[] || [])
    setCollapseActive(!row?.dispatchFailedReason?.length)
    setShowClis(!!row?.clis)
    setShowError(!!row?.clis || !!row?.dispatchFailedReason?.length)
  }

  const togglePanel = () => {
    setCollapseActive(!collapseActive)
  }

  const handleHighLightLine = (line: number) => {
    if (codeMirrorEl) {
      if (!Number.isNaN(line)) {
        codeMirrorEl.current?.highlightLine(line - 1)
      } else {
        codeMirrorEl.current?.removeHighlightLine()
      }
    }
  }

  const errorsTitle = $t({ defaultMessage: 'Errors ({dispatchFailedReasonCount})' }
    , { dispatchFailedReasonCount: dispatchFailedReason.length })

  useEffect(() => {
    if (dispatchFailedReason.length && codeMirrorEl.current) {
      setTimeout(() => {
        handleHighLightLine(Number(dispatchFailedReason[0].lineNumber))
      })
    }
  }, [dispatchFailedReason, codeMirrorEl])

  const handleFilterChange = (customFilters: FILTER) => {
    const payload = {
      ...tableQuery.payload,
      filterByConfigType: Array.isArray(customFilters?.configType) ? customFilters?.configType[0] : undefined
    }

    tableQuery.setPayload(payload)
  }

  return <>
    <Loader states={[tableQuery]}>
      <Table
        settingsId='switch-config-history-table'
        rowKey={(record) => record.transactionId + record.configType}
        columns={getCols()}
        dataSource={tableQuery.data?.data ?? []}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={handleFilterChange}
        enableApiFilter={true}
      />
    </Loader>
    { visible &&
    <Modal
      title={$t({ defaultMessage: 'Configuration Details' })}
      visible={visible}
      onCancel={handleCancel}
      destroyOnClose={true}
      width={1000}
      footer={<Button key='back' type='primary' onClick={handleCancel}>
        {$t({ defaultMessage: 'Close' })}
      </Button>
      }
    >
      {
        selectedRow &&
        <>
          <Descriptions labelWidthPercent={15}>
            <Descriptions.Item
              label={$t({ defaultMessage: 'Time' })}
              children={selectedRow.startTime} />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Type' })}
              children={selectedRow.configType} />
            <Descriptions.Item
              label={$t({ defaultMessage: 'Status' })}
              children={isVenueLevel ? getStatusBar(selectedRow) : selectedRow.dispatchStatus} />
          </Descriptions>
          {
            isVenueLevel && configDetails && <SwitchConfigDetailsTable
              configDetails={configDetails}
              filterType={filterType}
              onSelectConfingChange={onSelectConfigChange}
              onFilterConfigDetails={onFilterConfigDetails}
            />
          }
          <UI.ConfigDetail>
            {
              selectedConfigRow?.clis &&
              <div className='code-mirror-container'>
                <div className='header'>
                  {$t({ defaultMessage: 'Configuration Applied' })}
                </div>
                <CodeMirrorWidget ref={codeMirrorEl} type='single' data={selectedConfigRow} />
              </div>
            }
            {
              showError &&
              <div className='errors-table'
                style={{
                  width: collapseActive ? '30px' : '100%',
                  backgroundColor: collapseActive ? 'var(--acx-neutrals-20)' : 'transparent'
                }}>
                {
                  !collapseActive ?
                    <>
                      <div className='expanded header' >
                        {errorsTitle}
                        {
                          showClis &&
                        <UI.ArrowCollapsed data-testid='ArrowCollapsed' onClick={togglePanel}/>
                        }
                      </div>
                      <ErrorsTable errors={dispatchFailedReason} selectionChanged={handleHighLightLine}/>
                    </>
                    :
                    <div onClick={togglePanel}>
                      <div className='header'>
                        <UI.ArrowExpand />
                      </div>
                      <div className='vertical-text'>{errorsTitle}</div>
                    </div>
                }
              </div>
            }
          </UI.ConfigDetail>
        </>
      }
    </Modal>
    }
  </>
}

function getStatusBar (data: ConfigurationHistory) {
  const { $t } = getIntl()
  const numberOfFailed = Number(data?.numberOfFailed ?? 0)
  const numberOfNotifySuccess = Number(data?.numberOfNotifySuccess ?? 0)
  const numberOfSuccess = Number(data?.numberOfSuccess ?? 0)

  const totalCount = numberOfFailed + numberOfNotifySuccess + numberOfSuccess
  const successPercent = (Math.round((numberOfSuccess / totalCount) * 100 * 10) / 10) ?? 0
  const failedPercent = (Math.round((numberOfFailed / totalCount) * 100 * 10) / 10) ?? 0
  const notifySuccessPercent = (Math.round((numberOfNotifySuccess / totalCount) * 100 * 10) / 10) ?? 0

  return totalCount ? <StackedBarChart
    style={{ height: 10, width: 200 }}
    data={[{
      category: 'dispatchStatus',
      series: [{
        name: $t({ defaultMessage: 'Failed ({count} / {percent}%)' },
          { count: numberOfFailed, percent: failedPercent }),
        value: numberOfFailed
      }, {
        name: $t({ defaultMessage: 'NotifySuccess ({count} / {percent}%)' },
          { count: numberOfNotifySuccess, percent: notifySuccessPercent }),
        value: numberOfNotifySuccess
      }, {
        name: $t({ defaultMessage: 'Success ({count} / {percent}%)' },
          { count: numberOfSuccess, percent: successPercent }),
        value: numberOfSuccess
      }]
    }]}
    showLabels={false}
    showTotal={false}
    barColors={[
      cssStr('--acx-semantics-green-50'),
      cssStr('--acx-semantics-green-50'),
      cssStr('--acx-semantics-red-50')
    ]}
  /> : $t({ defaultMessage: 'Not applied yet' })
}

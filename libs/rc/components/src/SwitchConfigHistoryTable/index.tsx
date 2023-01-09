/* eslint-disable max-len */
import { useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Loader, Modal, Table, TableProps, Descriptions }    from '@acx-ui/components'
import { useGetSwitchConfigHistoryQuery }                            from '@acx-ui/rc/services'
import { ConfigurationHistory, DispatchFailedReason, useTableQuery } from '@acx-ui/rc/utils'

import { CodeMirrorWidget } from '../CodeMirrorWidget'

import { ErrorsTable } from './ErrorsTable'
import * as UI         from './styledComponents'

export function SwitchConfigHistoryTable () {
  const { $t } = useIntl()
  const codeMirrorEl = useRef(null as unknown as { highlightLine: Function, removeHighlightLine: Function })
  const [visible, setVisible] = useState(false)
  const [showError, setShowError] = useState(true)
  const [showClis, setShowClis] = useState(true)
  const [collapseActive, setCollapseActive] = useState(false)
  const [dispatchFailedReason, setDispatchFailedReason] = useState([] as DispatchFailedReason[])
  const [selectedRow, setSelectedRow] = useState(null as unknown as ConfigurationHistory)

  const showModal = (row: ConfigurationHistory) => {
    setSelectedRow(row)
    setDispatchFailedReason(row.dispatchFailedReason as DispatchFailedReason[] || [])
    setCollapseActive(!row?.dispatchFailedReason?.length)
    setShowClis(!!row?.clis)
    setShowError(!!row?.clis || !!row?.dispatchFailedReason?.length)
    setVisible(true)
  }

  const handleCancel = () => {
    setDispatchFailedReason([])
    setVisible(false)
  }

  const tableQuery = useTableQuery({
    useQuery: useGetSwitchConfigHistoryQuery,
    defaultPayload: {
      filterByConfigType: '',
      sortInfo: { sortColumn: 'startTime', dir: 'DESC' },
      limit: 10
    }
  })

  const tableData = tableQuery.data?.data ?? []

  const columns: TableProps<ConfigurationHistory>['columns'] = [{
    key: 'startTime',
    title: $t({ defaultMessage: 'Time' }),
    dataIndex: 'startTime',
    sorter: true,
    defaultSortOrder: 'ascend',
    disable: true,
    render: function (data, row) {
      return <Button type='link' size='small' onClick={() => {showModal(row)}}>
        {data}
      </Button>
    }
  }, {
    key: 'configType',
    title: $t({ defaultMessage: 'Type' }),
    dataIndex: 'configType',
    sorter: true
  }, {
    key: 'dispatchStatus',
    title: $t({ defaultMessage: 'Status' }),
    dataIndex: 'dispatchStatus',
    sorter: true
  }
  ]

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

  // TODO: add search string and filter to retrieve data
  // const retrieveData () => {}

  return <>
    <Loader states={[tableQuery]}>
      <Table
        rowKey='startTime'
        columns={columns}
        dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
    <Modal
      title={$t({ defaultMessage: 'Configuration Details' })}
      visible={visible}
      onCancel={handleCancel}
      width={1000}
      footer={<Button key='back' type='secondary' onClick={handleCancel}>
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
              children={selectedRow.dispatchStatus} />
          </Descriptions>
          <UI.ConfigDetail>
            {
              selectedRow?.clis &&
              <div className='code-mirror-container'>
                <div className='header'>
                  {$t({ defaultMessage: 'Commands Applied' })}
                </div>
                <CodeMirrorWidget ref={codeMirrorEl} type='single' data={selectedRow} />
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
  </>
}
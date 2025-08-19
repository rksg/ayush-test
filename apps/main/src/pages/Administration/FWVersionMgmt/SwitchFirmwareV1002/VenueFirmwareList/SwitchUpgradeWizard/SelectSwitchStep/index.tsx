import { ChangeEvent, Key, useEffect, useState } from 'react'

import { Input, Tooltip } from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  cssStr,
  useStepFormContext
} from '@acx-ui/components'
import { ArrowExpand, SearchOutlined, ChevronRight } from '@acx-ui/icons'
import {
  getNextScheduleTplV1002
} from '@acx-ui/rc/components'
import {
  useLazyGetSwitchFirmwareListV1001Query
} from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenueV1002,
  SwitchFirmwareV1002
} from '@acx-ui/rc/utils'
import { useParams }              from '@acx-ui/react-router-dom'
import { useSwitchFirmwareUtils } from '@acx-ui/switch/components'
import { RequestPayload }         from '@acx-ui/types'
import { noDataDisplay }          from '@acx-ui/utils'

import { SwitchFirmwareWizardType } from '..'
import * as UI                      from '../../styledComponents'
import {
  getHightlightSearch,
  getSwitchNextScheduleTpl
} from '../../switch.upgrade.util'

const getTooltipText = function (value: string, customDisplayValue?: string | React.ReactNode) {
  return <Tooltip
    title={value}
    placement='bottom'>
    <UI.WithTooltip>{customDisplayValue || value}</UI.WithTooltip>
  </Tooltip>
}

function useColumns () {
  const intl = useIntl()
  const {
    getSwitchNextScheduleTplTooltipV1002,
    getCurrentFirmwareDisplay
  } = useSwitchFirmwareUtils()

  const columns: TableProps<FirmwareSwitchVenueV1002>['columns'] = [
    {
      title: intl.$t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueName',
      dataIndex: 'venueName',
      width: 100,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const venueName = row.venueName
        const customDisplayValue =
          <div style={{
            fontWeight: cssStr('--acx-subtitle-4-font-weight'),
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }} >
            {venueName}
          </div >
        return getTooltipText(venueName, customDisplayValue)

      }
    }, {
      title: intl.$t({ defaultMessage: 'Model' }),
      key: 'Model',
      width: 60,
      dataIndex: 'Model'
    }, {
      title: intl.$t({ defaultMessage: 'Current Firmware' }),
      key: 'version',
      dataIndex: 'version',
      width: 180,
      onCell: () => ({
        style: { padding: '5px',
          overflow: 'hidden' }
      }),
      render: (_, row) => getCurrentFirmwareDisplay(intl, row)
    }, {
      title: intl.$t({ defaultMessage: 'Scheduling' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      width: 100,
      onCell: () => ({
        style: {
          zIndex: 3,
          overflow: 'visible'
        }
      }),
      render: (_, row) => {
        return <Tooltip
          title={getSwitchNextScheduleTplTooltipV1002(intl,
            row, getNextScheduleTplV1002(intl, row)) ||
            intl.$t({ defaultMessage: 'Not scheduled' })}
          placement='bottom' >
          <UI.WithTooltip>{getNextScheduleTplV1002(intl, row)}</UI.WithTooltip>
        </Tooltip >

      }
    }
  ]
  return columns
}

export const useDefaultVenuePayload = (): RequestPayload => {
  return {
    firmwareType: '',
    firmwareVersion: '',
    search: '',
    updateAvailable: ''
  }
}

type SelectSwitchStepProps = {
  data: FirmwareSwitchVenueV1002[],
  wizardtype?: SwitchFirmwareWizardType,
  setShowSubTitle: (visible: boolean) => void
}

export const SelectSwitchStep = (
  { data, setShowSubTitle }: SelectSwitchStepProps) => {

  const columns = useColumns()
  const intl = useIntl()

  const { form, current } = useStepFormContext()
  const { tenantId } = useParams()
  const { parseSwitchVersion, getSwitchScheduleTplV1002 } = useSwitchFirmwareUtils()

  const [ getSwitchFirmwareList ] = useLazyGetSwitchFirmwareListV1001Query()

  const [searchText, setSearchText] = useState('' as string)
  const [selectedVenueRowKeys, setSelectedVenueRowKeys] = useState([] as Key[])
  const [searchSwitchList, setSearchSwitchList] = useState([] as SwitchFirmwareV1002[])
  const [selectedSwitchRowKeys, setSelectedSwitchRowKeys] = useState({} as {
    [key: string]: Key[]
  })
  const [nestedData, setNestedData] = useState({} as {
    [key: string]: {
      initialData: SwitchFirmwareV1002[],
      selectedData: SwitchFirmwareV1002[]
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const totalSwitchCount = data.reduce((total, venue) => {
    if (venue.switchCounts) {
      const venueSwitchCount = venue.switchCounts.reduce((sum, switchCount) => {
        return sum + switchCount.count
      }, 0)
      return total + venueSwitchCount
    }
    return total
  }, 0)


  useEffect(()=>{
    setShowSubTitle(true)
  }, [current])

  const switchColumns: TableProps<SwitchFirmwareV1002>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Switch' }),
      key: 'switchName',
      dataIndex: 'switchName',
      width: 100,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const stackLabel = row.isStack ? intl.$t({ defaultMessage: '(Stack)' }) : ''
        return getTooltipText(`${row.switchName} ${stackLabel}`,
          getHightlightSearch(`${row.switchName} ${stackLabel}`, searchText))
      }
    }, {
      title: intl.$t({ defaultMessage: 'Model' }),
      key: 'model',
      dataIndex: 'model',
      width: 60,
      render: function (_, row) {
        return getHightlightSearch(row.model, searchText)
      }
    }, {
      title: intl.$t({ defaultMessage: 'Current Firmware' }),
      key: 'currentFirmware',
      dataIndex: 'currentFirmware',
      width: 180,
      filterMultiple: false,
      onCell: () => ({
        style: {
          padding: '10px 0 5px 5px'
        }
      }),
      render: (_, row) => {
        const version = row.currentFirmware ?
          parseSwitchVersion(row.currentFirmware) : noDataDisplay
        return getTooltipText(version)
      }
    }, {
      title: intl.$t({ defaultMessage: 'Scheduling' }),
      key: 'switchNextSchedule',
      dataIndex: 'switchNextSchedule',
      width: 100,
      onCell: () => ({
        style: {
          overflow: 'visible',
          zIndex: 3
        }
      }),
      render: (_, row) => {
        const tooltip = getSwitchScheduleTplV1002(row) ||
          intl.$t({ defaultMessage: 'Not scheduled' })
        const customDisplayValue = getSwitchNextScheduleTpl(intl, row)
        return getTooltipText(tooltip, customDisplayValue)
      }
    }
  ]

  const handleExpand = async (_expanded: unknown, record: FirmwareSwitchVenueV1002) => {
    const count = record.switchCounts.reduce((sum, switchCount) => sum + switchCount.count, 0)
    if (_.isEmpty(nestedData[record.venueId]?.initialData) ||
      (count)
      !== nestedData[record.venueId]?.initialData.length) {
      setIsLoading(true)
      const switchList = record.venueId
        ? (await getSwitchFirmwareList({
          params: { venueId: record.venueId },
          payload: { venueIdList: [record.venueId] }
        }, false)).data?.data
        : []

      const hasSelectedVenue = selectedVenueRowKeys.includes(record.venueId)
      const result = {
        ...nestedData, [record.venueId]: {
          initialData: switchList,
          selectedData: hasSelectedVenue ? switchList :
            (nestedData[record.venueId]?.selectedData || [])
        }
      }

      setNestedData(result as {
        [key: string]: {
          initialData: SwitchFirmwareV1002[],
          selectedData: SwitchFirmwareV1002[]
        }
      })
      setIsLoading(false)

      if (hasSelectedVenue && Array.isArray(switchList)) {
        setSelectedSwitchRowKeys({
          ...selectedSwitchRowKeys,
          [record.venueId]: switchList.map(s => s.switchId) as Key[]
        })
      }
    }
  }

  if ((_.isEmpty(nestedData)) && (!_.isEmpty(form.getFieldValue('nestedData')))) {
    setNestedData(form.getFieldValue('nestedData'))
    setSelectedSwitchRowKeys(form.getFieldValue('selectedSwitchRowKeys'))
    setSelectedVenueRowKeys(form.getFieldValue('selectedVenueRowKeys'))
  }

  useEffect(() => {
    form.setFieldsValue({ selectedSwitchRowKeys, selectedVenueRowKeys, nestedData })
  }, [selectedSwitchRowKeys, selectedVenueRowKeys, nestedData])

  const expandedRowRenderFunc = (record: FirmwareSwitchVenueV1002) => {
    return <Table<SwitchFirmwareV1002>
      columns={switchColumns}
      enableResizableColumn={false}
      className='switchTable'
      data-testid='switch-table'
      loading={false}
      locale={{
        emptyText: ' '
      }}
      style={{ paddingLeft: '0px !important' }}
      dataSource={nestedData[record.venueId]?.initialData ?? [] as SwitchFirmwareV1002[]}
      sticky={false}
      tableAlertRender={false}
      showHeader={false}
      expandable={{
        // columnWidth: '60px',
        expandedRowRender: () => { return <></> },
        rowExpandable: () => false
      }}
      rowKey='switchId'
      rowSelection={{
        type: 'checkbox',
        // columnWidth: '30px',
        selectedRowKeys: selectedSwitchRowKeys[record.venueId],
        onChange: (selectedKeys) => {
          const currentSwitchList = nestedData[record.venueId]?.initialData
          const result = {
            ...nestedData,
            [record.venueId]: {
              initialData: currentSwitchList,
              selectedData: currentSwitchList.filter(c => selectedKeys.includes(c.switchId))
            }
          }
          setNestedData(result as {
            [key: string]: {
              initialData: SwitchFirmwareV1002[],
              selectedData: SwitchFirmwareV1002[]
            }
          })

          if (currentSwitchList.length === selectedKeys.length) {
            setSelectedVenueRowKeys([...selectedVenueRowKeys, record.venueId])
          } else {
            setSelectedVenueRowKeys(selectedVenueRowKeys.filter(
              venueId => { return venueId !== record.venueId }))
          }

          setSelectedSwitchRowKeys({
            ...selectedSwitchRowKeys,
            [record.venueId]: selectedKeys
          })

          form.validateFields()

        }
      }}
    />
  }

  useEffect(() => {
    if(!_.isEmpty(searchText)){
      setSearchResultData(searchText)
    }
  }, [searchText])

  const setSearchResultData = async function (searchText: string) {
    let selectedKey = [] as Key[]
    const switchListPayload = {
      venueIdList: data.map(d => d.venueId),
      searchFilter: searchText
    }
    const searchSwitchList = (await getSwitchFirmwareList({
      params: { tenantId: tenantId },
      payload: switchListPayload,
      enableRbac: true
    }, true)).data?.data || []
    setSearchSwitchList(searchSwitchList)

    searchSwitchList?.forEach(s => {
      if (selectedVenueRowKeys.includes(s.venueId as Key) ||
        selectedSwitchRowKeys[s.venueId]?.includes(s.switchId as Key)) {
        if (s.switchId) {
          selectedKey.push(s.switchId)
        }
      }
      setSelectedSearchSwitchRowKeys(selectedKey)

    })
  }
  const [selectedSearchSwitchRowKeys, setSelectedSearchSwitchRowKeys] = useState([] as Key[])
  const isIndeterminate = (record: FirmwareSwitchVenueV1002) => {
    const venueId = record.venueId
    if (selectedVenueRowKeys.includes(record.venueId)) {
      return false
    }

    if (Array.isArray(selectedSwitchRowKeys[venueId])
      && selectedSwitchRowKeys[venueId].length > 0) {
      return true
    }

    return false
  }


  return (
    <>
      <UI.ValidateField
        style={totalSwitchCount > 0 ?
          { position: 'absolute', marginTop: '43px' } :
          { position: 'absolute', marginTop: '5px' }}

        name='selectSwitchStep'
        rules={[
          {
            validator: ( ) => {
              const selectedSwitches = form.getFieldValue('selectedSwitchRowKeys')
              const selectedVenues = form.getFieldValue('selectedVenueRowKeys')

              const keys = Object.keys(selectedSwitches)
              const selectedSwitchesAreEmpty = keys.every(key => selectedSwitches[key].length === 0)

              if(_.isEmpty(selectedVenues) && selectedSwitchesAreEmpty){
                return Promise.reject(intl.$t({ defaultMessage: 'Please select at least 1 item' }))
              }
              return Promise.resolve()
            }
          }
        ]}
        validateFirst
        children={<> </>}
      />
      { totalSwitchCount > 0 && <Input
        allowClear
        size='middle'
        placeholder={intl.$t({ defaultMessage: 'Search Switch, Model' })}
        prefix={<SearchOutlined />}
        style={{ width: '220px', maxHeight: '180px', marginBottom: '5px' }}
        data-testid='search-input'
        onChange={(ev: ChangeEvent) => {
          const text = (ev.target as HTMLInputElement).value
          setSearchText(text)
        }}
      />}
      {!_.isEmpty(searchText) && <div
        style={{
          minHeight: '50vh',
          marginBottom: '30px',
          overflowX: 'auto'
        }}><Table<SwitchFirmwareV1002>
          columns={switchColumns}
          className='switchTable'
          data-testid='switch-search-table'
          loading={false}
          style={{ paddingLeft: '0px !important', minWidth: '900px' }}
          dataSource={searchSwitchList}
          sticky={false}
          rowKey='switchId'
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedSearchSwitchRowKeys,
            onChange: (selectedKeys, selectedRows) => {
              const addedSwitch = _.difference(selectedKeys, selectedSearchSwitchRowKeys)
              const deletedSwitch = _.difference(selectedSearchSwitchRowKeys, selectedKeys)

              if (addedSwitch.length > 0) {
                let newSelectedSwitchRowKeys = selectedSwitchRowKeys
                let newNestedData = nestedData
                let newSelectedVenueRowKeys = selectedVenueRowKeys

                addedSwitch.forEach((a: Key) => {
                  const currentRow = selectedRows.filter(s => s.switchId === a)[0]
                  const selectedRow =
                    selectedSwitchRowKeys[currentRow.venueId]?.concat(a)
                    ?? [a]

                  newSelectedSwitchRowKeys = ({
                    ...newSelectedSwitchRowKeys,
                    [currentRow.venueId]:
                      newSelectedSwitchRowKeys[currentRow.venueId]?.concat(a)
                      || selectedRow
                  })

                  const currentVenue = data.filter(d => d.venueId === currentRow.venueId)[0]
                  const currentVenueCount = currentVenue?.switchCounts?.reduce(
                    (sum, switchCount) => sum + switchCount.count, 0) || 0
                  if ((currentVenueCount)
                    === newSelectedSwitchRowKeys[currentRow.venueId].length) {
                    newSelectedVenueRowKeys = [...newSelectedVenueRowKeys, currentVenue.venueId]
                  }

                  newNestedData = {
                    ...newNestedData,
                    [currentRow.venueId]: {
                      initialData: newNestedData[currentRow.venueId]?.initialData || [],
                      selectedData:
                        newNestedData[currentRow.venueId]?.selectedData.concat(currentRow)
                        || [currentRow]
                    }
                  }
                })

                setSelectedSwitchRowKeys(newSelectedSwitchRowKeys)
                setSelectedVenueRowKeys(newSelectedVenueRowKeys)
                setNestedData(newNestedData)

              } else if (deletedSwitch.length > 0) {
                let newSelectedSwitchRowKeys = selectedSwitchRowKeys
                let newNestedData = nestedData
                let newSelectedVenueRowKeys = selectedVenueRowKeys

                deletedSwitch.forEach((a: Key) => {
                  const deleteRowId = a
                  const deleteRow = searchSwitchList.filter(s => s.switchId === deleteRowId)[0]

                  newSelectedSwitchRowKeys = {
                    ...newSelectedSwitchRowKeys,
                    [deleteRow.venueId]: newSelectedSwitchRowKeys[deleteRow.venueId].filter(
                      s => s !== deleteRowId)
                  }
                  const currentVenue = data.filter(d => d.venueId === deleteRow.venueId)[0]
                  if (newSelectedVenueRowKeys.includes(currentVenue.venueId)) {
                    newSelectedVenueRowKeys =
                      newSelectedVenueRowKeys.filter(v => currentVenue.venueId !== v)
                  }


                  newNestedData = {
                    ...newNestedData,
                    [deleteRow.venueId]: {
                      initialData: newNestedData[deleteRow.venueId]?.initialData || [],
                      selectedData: newNestedData[deleteRow.venueId].selectedData.filter(
                        s => s.switchId !== deleteRowId)
                    }
                  }
                })

                setSelectedSwitchRowKeys(newSelectedSwitchRowKeys)
                setSelectedVenueRowKeys(newSelectedVenueRowKeys)
                setNestedData(newNestedData)

              }
              setSelectedSearchSwitchRowKeys(selectedKeys)
              form.validateFields()
            }
          }}
        /></div>}

      {
        _.isEmpty(searchText) && <Loader states={[{ isFetching: isLoading, isLoading: false }]}>
          <UI.ExpanderTableWrapper>
            <Table
              columns={columns}
              style={{ minWidth: '900px' }}
              enableResizableColumn={false}
              type={'tall'}
              dataSource={data}
              expandable={{
                // columnWidth: '30px',
                onExpand: handleExpand,
                expandIcon: ({ expanded, onExpand, record }) => {
                  const count = record.switchCounts?.reduce(
                    (sum, switchCount) => sum + switchCount.count, 0) || 0
                  if ((count > 0)) {
                    return expanded ? (
                      <ArrowExpand
                        style={{ verticalAlign: 'bottom' }}
                        data-testid='arrow-expand'
                        onClick={
                          (e) => {
                            e.stopPropagation()
                            onExpand(record, e as unknown as React.MouseEvent<HTMLElement>)
                          }} />
                    ) : (
                      <ChevronRight
                        style={{ verticalAlign: 'bottom', height: '16px' }}
                        data-testid='arrow-right'
                        onClick={
                          (e) => {
                            e.stopPropagation()
                            onExpand(record, e as unknown as React.MouseEvent<HTMLElement>)
                          }} />
                    )
                  } else {
                    return <></>
                  }
                },
                expandedRowRender: expandedRowRenderFunc,
                rowExpandable: record => {
                  const count = record.switchCounts?.reduce(
                    (sum, switchCount) => sum + switchCount.count, 0) || 0
                  return count > 0
                }
              }}
              enableApiFilter={true}
              rowKey='venueId'
              rowSelection={{
                type: 'checkbox',
                // columnWidth: '30px',
                selectedRowKeys: selectedVenueRowKeys,
                getCheckboxProps: (record) => {
                  return {
                    indeterminate: isIndeterminate(record),
                    name: record.venueName
                  }
                },
                onChange: (selectedKeys) => {
                  const addedVenue = _.difference(selectedKeys, selectedVenueRowKeys)
                  const deletedVenue = _.difference(selectedVenueRowKeys, selectedKeys)
                  if (addedVenue.length > 0) {
                    let newNestedData = nestedData
                    let newSelectedSwitchRowKeys = selectedSwitchRowKeys

                    addedVenue.forEach(async (venue) => {

                      let initialData = nestedData[venue]?.initialData ?? []
                      const row = data.filter(v => v.venueId === venue)
                      const rowCount = row[0]?.switchCounts?.reduce(
                        (sum, switchCount) => sum + switchCount.count, 0) || 0
                      if (_.isEmpty(initialData) &&
                      rowCount > 0) {
                        const switchListPayload = {
                          venueIdList: [venue]
                        }
                        const switchList = (await getSwitchFirmwareList({
                          params: { tenantId: tenantId },
                          payload: switchListPayload,
                          enableRbac: true
                        }, false)).data?.data
                        if (switchList) {
                          initialData = switchList
                        }
                      }

                      const selectedAllSwitchList = initialData
                      const selectedAllSwitchIds =
                        selectedAllSwitchList.map(s => s.switchId) as Key[]
                      newNestedData[venue] = {
                        initialData: selectedAllSwitchList,
                        selectedData: selectedAllSwitchList
                      }

                      newSelectedSwitchRowKeys[venue] = selectedAllSwitchIds
                    })

                    setNestedData(newNestedData)
                    setSelectedSwitchRowKeys(newSelectedSwitchRowKeys)

                  } else if (deletedVenue.length > 0) {
                    let newNestedData = nestedData
                    let newSelectedSwitchRowKeys = selectedSwitchRowKeys

                    deletedVenue.forEach((venue) => {
                      newNestedData[venue] = {
                        initialData: nestedData[venue]?.initialData || [],
                        selectedData: []
                      }
                      newSelectedSwitchRowKeys[venue] = []
                    })
                    setNestedData(newNestedData)
                    setSelectedSwitchRowKeys(newSelectedSwitchRowKeys)
                  }

                  setSelectedVenueRowKeys(selectedKeys)
                  form.validateFields()
                }
              }}
            /></UI.ExpanderTableWrapper>
        </Loader>}
    </>
  )
}

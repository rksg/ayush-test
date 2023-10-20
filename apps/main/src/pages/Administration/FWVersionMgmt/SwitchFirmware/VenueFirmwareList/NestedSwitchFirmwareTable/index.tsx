import { ChangeEvent, Key, useEffect, useState } from 'react'

import { Input, Tooltip } from 'antd'
import _                  from 'lodash'
import { useIntl }        from 'react-intl'

import {
  Table,
  TableProps,
  useStepFormContext
} from '@acx-ui/components'
import { SearchOutlined }             from '@acx-ui/icons'
import {
  useLazyGetSwitchFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
  SwitchFirmware
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { RequestPayload } from '@acx-ui/types'

import {
  getNextScheduleTpl,
  getSwitchNextScheduleTplTooltip,
  isSwitchNextScheduleTooltipDisabled,
  parseSwitchVersion
} from '../../../FirmwareUtils'
import * as UI       from '../../../styledComponents'
import * as SwitchUI from '../styledComponents'

function useColumns () {
  const intl = useIntl()

  const columns: TableProps<FirmwareSwitchVenue>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      defaultSortOrder: 'ascend'
    }, {
      title: '',
      key: 'Model',
      dataIndex: 'Model'
    }, {
      title: intl.$t({ defaultMessage: 'Current Firmware' }),
      key: 'version',
      dataIndex: 'version',
      render: function (_, row) {
        let versionList = []
        if (row.switchFirmwareVersion?.id) {
          versionList.push(parseSwitchVersion(row.switchFirmwareVersion.id))
        }
        if (row.switchFirmwareVersionAboveTen?.id) {
          versionList.push(parseSwitchVersion(row.switchFirmwareVersionAboveTen.id))
        }
        return versionList.length > 0 ? versionList.join(', ') : '--'
      }
    }, {
      title: intl.$t({ defaultMessage: 'Available Firmware' }),
      key: 'availableVersions',
      dataIndex: 'availableVersions',
      render: function (_, row) {
        const availableVersions = row.availableVersions
        if (availableVersions.length === 0) {
          return '--'
        } else {
          return availableVersions.map(version => parseSwitchVersion(version.id)).join(',')
        }
      }
    }, {
      title: intl.$t({ defaultMessage: 'Scheduling' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      render: function (_, row) {
        // return getNextScheduleTpl(intl, row)
        return (!isSwitchNextScheduleTooltipDisabled(row)
          ? getNextScheduleTpl(intl, row)
          // eslint-disable-next-line max-len
          : <Tooltip title={<UI.ScheduleTooltipText>{getSwitchNextScheduleTplTooltip(row)}</UI.ScheduleTooltipText>} placement='bottom'>
            <UI.WithTooltip>{getNextScheduleTpl(intl, row)}</UI.WithTooltip>
          </Tooltip>
        )
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

type VenueTableProps = {
  data: FirmwareSwitchVenue[]
}

export const NestedSwitchFirmwareTable = (
  { data }: VenueTableProps) => {

  const { form } = useStepFormContext()
  const columns = useColumns()
  const intl = useIntl()
  const { tenantId } = useParams()

  const [ getSwitchList ] = useLazyGetSwitchFirmwareListQuery()

  const [searchText, setSearchText] = useState('' as string)
  const [selectedVenueRowKeys, setSelectedVenueRowKeys] = useState([] as Key[])
  const [searchSwitchList, setSearchSwitchList] = useState([] as SwitchFirmware[])
  const [selectedSwitchRowKeys, setSelectedSwitchRowKeys] = useState({} as {
    [key: string]: Key[]
  })
  const [nestedData, setNestedData] = useState({} as {
    [key: string]: {
      initialData: SwitchFirmware[],
      selectedData: SwitchFirmware[] //Need to removed
    }
  })

  const switchColumns: TableProps<SwitchFirmware>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Switch' }),
      key: 'switchName',
      dataIndex: 'switchName',
      defaultSortOrder: 'ascend'
    }, {
      title: 'Model',
      key: 'model',
      dataIndex: 'model'
    }, {
      title: intl.$t({ defaultMessage: 'Current Firmware' }),
      key: 'currentFirmware',
      dataIndex: 'currentFirmware',
      filterMultiple: false,
      render: function (_, row) {
        if (row.currentFirmware) {
          return parseSwitchVersion(row.currentFirmware)
        } else {
          return '--'
        }
      }
    }, {
      title: intl.$t({ defaultMessage: 'Available Firmware' }),
      key: 'availableVersion',
      dataIndex: 'availableVersion',
      render: function (_, row) {
        if (row.availableVersion?.id) {
          return parseSwitchVersion(row.availableVersion.id)
        } else {
          return '--'
        }
      }
    }, {
      title: intl.$t({ defaultMessage: 'Scheduling' }),
      key: 'switchNextSchedule',
      dataIndex: 'model',
      render: function (_, row) {
        // return getNextScheduleTpl(intl, row)

        return parseSwitchVersion(row.switchNextSchedule?.version?.id || 'Not scheduled')
        // <Tooltip title={<UI.ScheduleTooltipText>{
        //   parseSwitchVersion(row.switchNextSchedule?.version?.id)}</UI.ScheduleTooltipText>}
        //   placement='bottom'>
        //   <UI.WithTooltip>{getNextScheduleTpl(intl, row)}</UI.WithTooltip>
        // </Tooltip>

      }
    }
  ]

  const handleExpand = async (_expanded: unknown, record: { id: string, switchCount: number }) => {
    if (_.isEmpty(nestedData[record.id]?.initialData) ||
      record.switchCount !== nestedData[record.id]?.initialData.length) {
      const switchListPayload = {
        venueId: [record.id]
      }
      const switchList = record.id
        ? (await getSwitchList({
          params: { tenantId: tenantId }, payload: switchListPayload
        }, true)).data?.data//.filter((v) => v.venueId === record.id)
        : []

      const hasSelectedVenue = selectedVenueRowKeys.includes(record.id)
      const result = {
        ...nestedData, [record.id]: {
          initialData: switchList,
          selectedData: hasSelectedVenue ? switchList :
            (nestedData[record.id]?.selectedData || [])
        }
      }

      setNestedData(result as {
        [key: string]: {
          initialData: SwitchFirmware[],
          selectedData: SwitchFirmware[]
        }
      })

      if (hasSelectedVenue && Array.isArray(switchList)) {
        setSelectedSwitchRowKeys({
          ...selectedSwitchRowKeys,
          [record.id]: switchList.map(s => s.switchId) as Key[]
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const expandedRowRenderFunc = (record: FirmwareSwitchVenue) => {
    return <Table<SwitchFirmware>
      columns={switchColumns}
      className='switchTable'
      loading={false}
      locale={{
        emptyText: 'No data'
      }}
      style={{ paddingLeft: '0px !important' }}
      dataSource={nestedData[record.id]?.initialData ?? [] as SwitchFirmware[]}
      sticky={false}
      tableAlertRender={false}
      showHeader={false}
      expandIcon={
        () => <></>
      }
      expandable={{ expandedRowRender: () => { return <></> } }}
      // onChange={tableQuery.handleTableChange}
      rowKey='switchId'
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys: selectedSwitchRowKeys[record.id],
        onChange: (selectedKeys, selectedRows) => {
          const currentSwitchList = nestedData[record.id]?.initialData
          const result = { ...nestedData,
            [record.id]: { initialData: currentSwitchList, selectedData: selectedRows } }
          setNestedData(result as {
            [key: string]: {
              initialData: SwitchFirmware[],
              selectedData: SwitchFirmware[]
            }
          })

          if (currentSwitchList.length === selectedRows.length) {
            setSelectedVenueRowKeys([...selectedVenueRowKeys, record.id])
          } else {
            setSelectedVenueRowKeys(selectedVenueRowKeys.filter(
              venueId => { return venueId !== record.id }))
          }

          setSelectedSwitchRowKeys({
            ...selectedSwitchRowKeys,
            [record.id]: selectedKeys
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
      venueId: data.map(d => d.id),
      search: searchText
    }
    const searchSwitchList = (await getSwitchList({
      params: { tenantId: tenantId }, payload: switchListPayload
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

  return (
    <>
      <SwitchUI.ValidateField
        name='selectSwitchStep'
        rules={[
          {
            validator: ( ) => {
              const selectedSwitches = form.getFieldValue('selectedSwitchRowKeys')
              const selectedVenues = form.getFieldValue('selectedVenueRowKeys')
              if(_.isEmpty(selectedVenues) && _.isEmpty(selectedSwitches)){
                return Promise.reject('Please select at least 1 item.')
              }

              return Promise.resolve()
            }
          }
        ]}
        validateFirst
        children={<> </>}
      />
      <Input
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
      />
      {!_.isEmpty(searchText) && <div
        style={{
          minHeight: '50vh',
          marginBottom: '30px'
        }}><Table<SwitchFirmware>
          columns={switchColumns}
          className='switchTable'
          loading={false}
          style={{ paddingLeft: '0px !important' }}
          dataSource={searchSwitchList}
          sticky={false}
          rowKey='switchId'
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedSearchSwitchRowKeys,//selectedSwitchRowKeys[record.id],
            onChange: (selectedKeys, selectedRows) => {
              const addedSwitch = _.difference(selectedKeys, selectedSearchSwitchRowKeys)
              const deletedSwitch = _.difference(selectedSearchSwitchRowKeys, selectedKeys)

              if (addedSwitch.length === 1) {
                const currentRow = selectedRows.filter(s => s.id === selectedRows[0].id)[0]

                const selectedRow =
                  selectedSwitchRowKeys[currentRow.venueId]?.concat(addedSwitch[0])
                  ?? [addedSwitch[0]]

                setSelectedSwitchRowKeys({
                  ...selectedSwitchRowKeys,
                  [currentRow.venueId]: selectedRow
                })

                const currentVenue = data.filter(d => d.id === selectedRows[0].venueId)[0]
                if ((currentVenue.switchCount + currentVenue.aboveTenSwitchCount)
                  === selectedRow.length) {
                  setSelectedVenueRowKeys([...selectedVenueRowKeys, currentVenue.id])
                }

                setNestedData({
                  ...nestedData,
                  [currentRow.venueId]: {
                    initialData: nestedData[currentRow.venueId]?.initialData || [],
                    selectedData: nestedData[currentRow.venueId]?.selectedData.concat(currentRow)
                    || currentRow
                  }
                })

              } else if (addedSwitch.length > 1) {

              } else if (deletedSwitch.length === 1) {
                const deleteRowId = deletedSwitch[0]
                const deleteRow = searchSwitchList.filter(s => s.switchId === deleteRowId)[0]


                setSelectedSwitchRowKeys({
                  ...selectedSwitchRowKeys,
                  [deleteRow.venueId]: selectedSwitchRowKeys[deleteRow.venueId].filter(
                    s => s !== deleteRowId)
                })

                const currentVenue = data.filter(d => d.id === deleteRow.venueId)[0]
                if (selectedVenueRowKeys.includes(currentVenue.id)) {
                  setSelectedVenueRowKeys(selectedVenueRowKeys.filter(v => currentVenue.id !== v))
                }

                setNestedData({
                  ...nestedData,
                  [deleteRow.venueId]: {
                    initialData: nestedData[deleteRow.venueId]?.initialData || [],
                    selectedData: nestedData[deleteRow.venueId].selectedData.filter(
                      s => s.switchId !== deleteRowId)
                  }
                })


              } else if (deletedSwitch.length > 1) {

              }
              setSelectedSearchSwitchRowKeys(selectedKeys)
              form.validateFields()
            }
          }}
        /></div>}

      {_.isEmpty(searchText) &&<SwitchUI.ExpanderTableWrapper>
        <Table
          columns={columns}
          type={'tall'}
          dataSource={data}
          expandable={{
            onExpand: handleExpand,
            expandedRowRender: expandedRowRenderFunc,
            rowExpandable: record => record.switchCount ? record.switchCount > 0 : false
          }}
          // onChange={tableQuery.handleTableChange}
          // onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='id'
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedVenueRowKeys,
            onChange: (selectedKeys) => {
              const addedVenue = _.difference(selectedKeys, selectedVenueRowKeys)
              const deletedVenue = _.difference(selectedVenueRowKeys, selectedKeys)

              if (addedVenue.length == 1) {
                const selectedAllSwitchList = nestedData[addedVenue[0]]?.initialData || []
                const selectedAllSwitchIds = selectedAllSwitchList.map(s => s.switchId) as Key[]

                setNestedData({
                  ...nestedData,
                  [addedVenue[0]]: {
                    initialData: selectedAllSwitchList,
                    selectedData: selectedAllSwitchList
                  }
                })

                setSelectedSwitchRowKeys({
                  ...selectedSwitchRowKeys,
                  [addedVenue[0]]: selectedAllSwitchIds
                })


              } else if (addedVenue.length > 1) {
                let newNestedData = {} as {
                [key: string]: {
                  initialData: SwitchFirmware[],
                  selectedData: SwitchFirmware[]
                }
              }
                let newSelectedSwitchRowKeys = {} as {
                [key: string]: Key[]
              }
                addedVenue.forEach((venue) => {
                  const selectedAllSwitchList = nestedData[venue]?.initialData || []
                  const selectedAllSwitchIds = selectedAllSwitchList.map(s => s.switchId) as Key[]
                  newNestedData[venue] = {
                    initialData: selectedAllSwitchList,
                    selectedData: selectedAllSwitchList
                  }

                  newSelectedSwitchRowKeys[venue] = selectedAllSwitchIds
                })

                setNestedData(newNestedData)
                setSelectedSwitchRowKeys(newSelectedSwitchRowKeys)


              } else if (deletedVenue.length === 1) {
                const selectedAllSwitchList = nestedData[deletedVenue[0]]?.initialData || []
                setNestedData({
                  ...nestedData,
                  [deletedVenue[0]]: {
                    initialData: selectedAllSwitchList,
                    selectedData: []
                  }
                })

                setSelectedSwitchRowKeys({
                  ...selectedSwitchRowKeys,
                  [deletedVenue[0]]: []
                })

              } else if (deletedVenue.length > 1) {
                let newNestedData = {} as {
                [key: string]: {
                  initialData: SwitchFirmware[],
                  selectedData: SwitchFirmware[]
                }
              }
                let newSelectedSwitchRowKeys = {} as {
                [key: string]: Key[]
              }
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
        /></SwitchUI.ExpanderTableWrapper>}
    </>
  )
}

export function VenueFirmwareList (data: FirmwareSwitchVenue[]) {
  return (
    <NestedSwitchFirmwareTable
      data={data}
    />
  )
}

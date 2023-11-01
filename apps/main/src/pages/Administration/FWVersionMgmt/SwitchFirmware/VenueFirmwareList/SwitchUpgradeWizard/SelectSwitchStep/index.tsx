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

import { SwitchFirmwareWizardType } from '..'
import {
  getNextScheduleTpl,
  getSwitchNextScheduleTplTooltip,
  parseSwitchVersion
} from '../../../../FirmwareUtils'
import * as UI                                            from '../../styledComponents'
import { getSwitchNextScheduleTpl, getSwitchScheduleTpl } from '../../switch.upgrade.util'

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
        return <Tooltip
          title={getSwitchNextScheduleTplTooltip(row) ||
            intl.$t({ defaultMessage: 'Not scheduled' })}
          placement='bottom'>
          <UI.WithTooltip>{getNextScheduleTpl(intl, row)}</UI.WithTooltip>
        </Tooltip>
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
  data: FirmwareSwitchVenue[],
  wizardtype?: SwitchFirmwareWizardType
}

export const SelectSwitchStep = (
  { data }: SelectSwitchStepProps) => {

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
      selectedData: SwitchFirmware[]
    }
  })

  const switchColumns: TableProps<SwitchFirmware>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Switch' }),
      key: 'switchName',
      dataIndex: 'switchName',
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const stackLabel = row.isStack ? intl.$t({ defaultMessage: '(Stack)' }) : ''
        return `${row.switchName} ${stackLabel}`
      }
    }, {
      title: intl.$t({ defaultMessage: 'Model' }),
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
        return <Tooltip
          title={getSwitchScheduleTpl(row) ||
            intl.$t({ defaultMessage: 'Not scheduled' })}
          placement='bottom'>
          <UI.WithTooltip>{getSwitchNextScheduleTpl(intl, row)}</UI.WithTooltip>
        </Tooltip>
      }
    }
  ]

  const handleExpand = async (_expanded: unknown, record: {
    id: string, switchCount: number,
    aboveTenSwitchCount: number
  }) => {
    if (_.isEmpty(nestedData[record.id]?.initialData) ||
      (record.switchCount + record.aboveTenSwitchCount)
      !== nestedData[record.id]?.initialData.length) {
      const switchListPayload = {
        venueIdList: [record.id]
      }
      const switchList = record.id
        ? (await getSwitchList({
          params: { tenantId: tenantId }, payload: switchListPayload
        }, false)).data?.data
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

  const expandedRowRenderFunc = (record: FirmwareSwitchVenue) => {
    return <Table<SwitchFirmware>
      columns={switchColumns}
      enableResizableColumn={false}
      className='switchTable'
      data-testid='switch-table'
      loading={false}
      locale={{
        emptyText: ' '
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

          if (currentSwitchList.length === selectedKeys.length) {
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
      venueIdList: data.map(d => d.id),
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
  const isIndeterminate = (record: FirmwareSwitchVenue) => {
    const venueId = record.id
    if (selectedVenueRowKeys.includes(record.id)) {
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
        style={{ marginBottom: '5px' }}
        name='selectSwitchStep'
        rules={[
          {
            validator: ( ) => {
              const selectedSwitches = form.getFieldValue('selectedSwitchRowKeys')
              const selectedVenues = form.getFieldValue('selectedVenueRowKeys')
              if(_.isEmpty(selectedVenues) && _.isEmpty(selectedSwitches)){
                return Promise.reject(intl.$t({ defaultMessage: 'Please select at least 1 item' }))
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

                  const currentVenue = data.filter(d => d.id === currentRow.venueId)[0]
                  if ((currentVenue.switchCount + currentVenue.aboveTenSwitchCount)
                    === newSelectedSwitchRowKeys[currentRow.venueId].length) {
                    newSelectedVenueRowKeys = [...newSelectedVenueRowKeys, currentVenue.id]
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
                  const currentVenue = data.filter(d => d.id === deleteRow.venueId)[0]
                  if (newSelectedVenueRowKeys.includes(currentVenue.id)) {
                    newSelectedVenueRowKeys =
                      newSelectedVenueRowKeys.filter(v => currentVenue.id !== v)
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
        _.isEmpty(searchText) && <UI.ExpanderTableWrapper>
          <Table
            columns={columns}
            enableResizableColumn={false}
            type={'tall'}
            dataSource={data}
            expandable={{
              onExpand: handleExpand,
              expandedRowRender: expandedRowRenderFunc,
              rowExpandable: record =>
                (record?.switchCount + record?.aboveTenSwitchCount > 0) ?? false
            }}
            enableApiFilter={true}
            rowKey='id'
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedVenueRowKeys,
              getCheckboxProps: (record) => {
                return {
                  indeterminate: isIndeterminate(record),
                  name: record.name
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
                    const row = data.filter(v => v.id === venue)
                    if (_.isEmpty(initialData) &&
                      (row[0]?.switchCount > 0 || row[0]?.aboveTenSwitchCount > 0)) {
                      const switchListPayload = {
                        venueIdList: [venue]
                      }
                      const switchList = (await getSwitchList({
                        params: { tenantId: tenantId }, payload: switchListPayload
                      }, false)).data?.data
                      if (switchList) {
                        initialData = switchList
                      }
                    }

                    const selectedAllSwitchList = initialData
                    const selectedAllSwitchIds = selectedAllSwitchList.map(s => s.switchId) as Key[]
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
          /></UI.ExpanderTableWrapper>}
    </>
  )
}

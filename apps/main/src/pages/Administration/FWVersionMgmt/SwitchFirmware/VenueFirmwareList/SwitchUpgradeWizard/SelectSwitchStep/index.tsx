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
import { useIsSplitOn, Features }                    from '@acx-ui/feature-toggle'
import { ArrowExpand, SearchOutlined, ChevronRight } from '@acx-ui/icons'
import { useSwitchFirmwareUtils }                    from '@acx-ui/rc/components'
import {
  useLazyGetSwitchFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
  SwitchFirmware
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { RequestPayload } from '@acx-ui/types'
import { noDataDisplay }  from '@acx-ui/utils'

import { SwitchFirmwareWizardType } from '..'
import {
  getNextScheduleTpl
} from '../../../../FirmwareUtils'
import * as UI               from '../../styledComponents'
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
  const { getSwitchNextScheduleTplTooltip,
    getSwitchFirmwareList,
    getSwitchVenueAvailableVersions } = useSwitchFirmwareUtils()

  const columns: TableProps<FirmwareSwitchVenue>['columns'] = [
    {
      title: intl.$t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'name',
      dataIndex: 'name',
      width: 150,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const customDisplayValue =
          <div style={{ fontWeight: cssStr('--acx-subtitle-4-font-weight') }} > {row.name}</div >
        return getTooltipText(row.name, customDisplayValue)

      }
    }, {
      title: intl.$t({ defaultMessage: 'Model' }),
      key: 'Model',
      width: 100,
      dataIndex: 'Model'
    }, {
      title: intl.$t({ defaultMessage: 'Current Firmware' }),
      key: 'version',
      dataIndex: 'version',
      width: 150,
      render: function (_, row) {
        let versionList = getSwitchFirmwareList(row)
        const version = versionList.length > 0 ? versionList.join(', ') : noDataDisplay
        return getTooltipText(version)
      }
    }, {
      title: intl.$t({ defaultMessage: 'Available Firmware' }),
      key: 'availableVersions',
      dataIndex: 'availableVersions',
      width: 150,
      render: function (_, row) {
        const version = getSwitchVenueAvailableVersions(row)
        return getTooltipText(version)
      }
    }, {
      title: intl.$t({ defaultMessage: 'Scheduling' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      width: 200,
      render: function (_, row) {
        const tooltip = getSwitchNextScheduleTplTooltip(row) ||
          intl.$t({ defaultMessage: 'Not scheduled' })
        const customDisplayValue = getNextScheduleTpl(intl, row)
        return getTooltipText(tooltip, customDisplayValue)
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
  wizardtype?: SwitchFirmwareWizardType,
  setShowSubTitle: (visible: boolean) => void
}

export const SelectSwitchStep = (
  { data, setShowSubTitle }: SelectSwitchStepProps) => {

  const columns = useColumns()
  const intl = useIntl()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const { form, current } = useStepFormContext()
  const { tenantId } = useParams()
  const { parseSwitchVersion, getSwitchScheduleTpl } = useSwitchFirmwareUtils()

  const [ getSwitchFirmwareList ] = useLazyGetSwitchFirmwareListQuery()

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
  const [isLoading, setIsLoading] = useState(false)
  const totalSwitchCount = data.reduce((total, venue) => total + venue.switchCount, 0)


  useEffect(()=>{
    setShowSubTitle(true)
  }, [current])

  const switchColumns: TableProps<SwitchFirmware>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Switch' }),
      key: 'switchName',
      dataIndex: 'switchName',
      width: 150,
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
      width: 100,
      render: function (_, row) {
        return getHightlightSearch(row.model, searchText)
      }
    }, {
      title: intl.$t({ defaultMessage: 'Current Firmware' }),
      key: 'currentFirmware',
      dataIndex: 'currentFirmware',
      width: 150,
      filterMultiple: false,
      render: function (_, row) {
        const version = row.currentFirmware ?
          parseSwitchVersion(row.currentFirmware) : noDataDisplay
        return getTooltipText(version)
      }
    }, {
      title: intl.$t({ defaultMessage: 'Available Firmware' }),
      key: 'availableVersion',
      dataIndex: 'availableVersion',
      width: 150,
      render: function (_, row) {
        const currentVersion = row.currentFirmware ?
          parseSwitchVersion(row.currentFirmware) : noDataDisplay
        const availableVersion = row.availableVersion?.id ?
          parseSwitchVersion(row.availableVersion.id) : noDataDisplay
        const version = currentVersion === availableVersion ? noDataDisplay : availableVersion

        return getTooltipText(version)
      }
    }, {
      title: intl.$t({ defaultMessage: 'Scheduling' }),
      key: 'switchNextSchedule',
      dataIndex: 'switchNextSchedule',
      width: 200,
      render: function (_, row) {
        const tooltip = getSwitchScheduleTpl(row) ||
          intl.$t({ defaultMessage: 'Not scheduled' })
        const customDisplayValue = getSwitchNextScheduleTpl(intl, row)
        return getTooltipText(tooltip, customDisplayValue)
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
      setIsLoading(true)
      const switchListPayload = {
        venueIdList: [record.id]
      }
      const switchList = record.id
        ? (await getSwitchFirmwareList({
          params: { tenantId: tenantId },
          payload: switchListPayload,
          enableRbac: isSwitchRbacEnabled
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
      setIsLoading(false)

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
      expandable={{
        // columnWidth: '60px',
        expandedRowRender: () => { return <></> },
        rowExpandable: () => false
      }}
      rowKey='switchId'
      rowSelection={{
        type: 'checkbox',
        // columnWidth: '30px',
        selectedRowKeys: selectedSwitchRowKeys[record.id],
        onChange: (selectedKeys) => {
          const currentSwitchList = nestedData[record.id]?.initialData
          const result = {
            ...nestedData,
            [record.id]: {
              initialData: currentSwitchList,
              selectedData: currentSwitchList.filter(c => selectedKeys.includes(c.switchId))
            }
          }
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
    const searchSwitchList = (await getSwitchFirmwareList({
      params: { tenantId: tenantId },
      payload: switchListPayload,
      enableRbac: isSwitchRbacEnabled
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
        }}><Table<SwitchFirmware>
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
                  if ((record?.switchCount + record?.aboveTenSwitchCount > 0)) {
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
                rowExpandable: record =>
                  (record?.switchCount + record?.aboveTenSwitchCount > 0) ?? false
              }}
              enableApiFilter={true}
              rowKey='id'
              rowSelection={{
                type: 'checkbox',
                // columnWidth: '30px',
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
                        const switchList = (await getSwitchFirmwareList({
                          params: { tenantId: tenantId },
                          payload: switchListPayload,
                          enableRbac: isSwitchRbacEnabled
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

import { Key, useEffect, useState } from 'react'

import { Tooltip } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useGetSwitchCurrentVersionsQuery,
  useLazyGetSwitchFirmwareListQuery,
  useLazyGetSwitchListQuery
} from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
  SwitchFirmware,
  SwitchViewModel
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { RequestPayload } from '@acx-ui/types'

import {
  getNextScheduleTpl,
  getSwitchNextScheduleTplTooltip,
  isSwitchNextScheduleTooltipDisabled,
  parseSwitchVersion,
  toUserDate
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
  data: FirmwareSwitchVenue[],
}

export const NestedSwitchFirmwareTable = (
  { data }: VenueTableProps) => {
  const [selectedSwitchRowKeys, setSelectedSwitchRowKeys] = useState({} as {
    [key: string]: Key[]
  })
  const [selectedVenueRowKeys, setSelectedVenueRowKeys] = useState([] as Key[])
  const [nestedData, setNestedData] = useState({} as {
    [key: string]: {
      initialData: SwitchFirmware[],
      selectedData: SwitchFirmware[] //Need to removed
    }
  })
  const [ getSwitchList ] = useLazyGetSwitchFirmwareListQuery()


  const columns = useColumns()
  const intl = useIntl()
  const switchColumns: TableProps<SwitchFirmware>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Venue' }),
      key: 'switchName',
      dataIndex: 'switchName',
      defaultSortOrder: 'ascend'
    }, {
      title: '',
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
      dataIndex: 'model'
    }
  ]

  const { tenantId } = useParams()

  const [isLoading, setIsLoading] = useState({} as { [key: string]: boolean })
  const handleExpand = async (_expanded: unknown, record: { id: string }) => {
    setIsLoading({
      [record.id]: true
    })

    if (_.isEmpty(nestedData[record.id]?.initialData)) {
      const switchListPayload = {
        pageSize: 10000,
        filters: {
          venueId: [record.id]
        },
        fields: ['id', 'isStack', 'formStacking', 'name', 'model', 'serialNumber',
          'deviceStatus', 'syncedSwitchConfig', 'configReady', 'currentFirmware',
          'availableVersion', 'switchNextSchedule', 'venueNextSchedule', 'preDownload'
        ]
      }
      const switchList = record.id
        ? (await getSwitchList({
          params: { tenantId: tenantId }, payload: switchListPayload
        }, true)).data?.data.filter((v) => v.venueId === record.id)
        : []

      const hasSelectedVenue = selectedVenueRowKeys.includes(record.id)
      const result = {
        ...nestedData, [record.id]: {
          initialData: switchList,
          selectedData: hasSelectedVenue ? switchList : []
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


    setIsLoading({
      [record.id]: false
    })
  }

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(nestedData)
  }, [nestedData])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const expandedRowRenderFunc = (record: FirmwareSwitchVenue) => {
    return <Table<SwitchFirmware>
      columns={switchColumns}
      className='switchTable'
      loading={isLoading[record.id]}
      locale={{
        emptyText: 'No data'
      }}
      style={{ paddingLeft: '0px !important' }}
      dataSource={nestedData[record.id]?.initialData ?? [] as SwitchFirmware[]}
      // pagination={tableQuery.pagination}
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

        }
      }}
    />
  }


  return (
    <SwitchUI.ExpanderTableWrapper>
      <Table
        columns={columns}
        type={'tall'}
        dataSource={data}
        // pagination={tableQuery.pagination}
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
          onChange: (selectedKeys, newRows, info) => {
            // eslint-disable-next-line no-console
            // console.log(newRows)

            const addedVenue = _.difference(selectedKeys, selectedVenueRowKeys)
            const deletedVenue = _.difference(selectedVenueRowKeys, selectedKeys)

            if (addedVenue.length == 1) {
              const selectedAllSwitchList = nestedData[addedVenue[0]].initialData
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
              const selectedAllSwitchList = nestedData[deletedVenue[0]].initialData
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
          }
        }}
      /></SwitchUI.ExpanderTableWrapper>
  )
}

export function VenueFirmwareList (data: FirmwareSwitchVenue[]) {

  return (
    <NestedSwitchFirmwareTable
      data={data}
    />
  )
}

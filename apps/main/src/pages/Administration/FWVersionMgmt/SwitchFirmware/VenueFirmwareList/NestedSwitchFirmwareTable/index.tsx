import { useEffect, useState } from 'react'

import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import {
  Table,
  TableProps,
} from '@acx-ui/components'
import {
  useGetSwitchCurrentVersionsQuery,
  useLazyGetSwitchListQuery
} from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
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
      key: 'availableFw',
      dataIndex: 'availableFw',
      render: function (_, row) {
        return row.lastScheduleUpdateTime ? toUserDate(row.lastScheduleUpdateTime) : '--'
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
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedRowKeys2, setSelectedRowKeys2] = useState([])
  const [ getSwitchList ] = useLazyGetSwitchListQuery()


  const columns = useColumns()
  const intl = useIntl()
  const switchColumns: TableProps<SwitchViewModel>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      defaultSortOrder: 'ascend'
    }, {
      title: '',
      key: 'model',
      dataIndex: 'model'
    }, {
      title: intl.$t({ defaultMessage: 'Current Firmware' }),
      key: 'version',
      dataIndex: 'model',
      filterMultiple: false
    }, {
      title: intl.$t({ defaultMessage: 'Available Firmware' }),
      key: 'availableFw',
      dataIndex: 'model'
    }, {
      title: intl.$t({ defaultMessage: 'Scheduling' }),
      key: 'switchNextSchedule',
      dataIndex: 'model'
    }
  ]

  const { tenantId } = useParams()
  const [nestedData, setNestedData] = useState({} as { [key: string]: SwitchViewModel[] })
  const [isLoading, setIsLoading] = useState({} as { [key: string]: boolean })
  const handleExpand = async (_expanded: unknown, record: { id: string }) => {
    setIsLoading({
      [record.id]: true
    })
    setNestedData({ ...nestedData, [record.id]: [] })

    const switchListPayload = {
      pageSize: 10000,
      filters: {
        venueId: [record.id]
      },
      fields: ['id', 'isStack', 'formStacking', 'name', 'model', 'serialNumber',
        'deviceStatus', 'syncedSwitchConfig', 'configReady', 'currentFirmware', 'availableVersion',
        'switchNextSchedule', 'venueNextSchedule', 'preDownload'
      ]
    }
    const switchList = record.id
      ? (await getSwitchList({
        params: { tenantId: tenantId }, payload: switchListPayload
      }, true)).data?.data
      : []

    const result = { ...nestedData, [record.id]: switchList }
    setNestedData(result as { [key: string]: SwitchViewModel[] })
    setIsLoading({
      [record.id]: false
    })
  }

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(selectedRowKeys)
  }, [selectedRowKeys])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const expandedRowRenderFunc = (record: FirmwareSwitchVenue) => {
    return <Table<SwitchViewModel>
      columns={switchColumns}
      className='switchTable'
      loading={isLoading[record.id]}
      locale={{
        emptyText: 'No data'
      }}
      style={{ paddingLeft: '0px !important' }}
      dataSource={nestedData[record.id] ?? [] as SwitchViewModel[]}
      // pagination={tableQuery.pagination}
      sticky={false}
      tableAlertRender={false}
      showHeader={false}
      expandIcon={
        () => <></>
      }
      expandable={{ expandedRowRender: () => { return <></> } }}
      // onChange={tableQuery.handleTableChange}
      rowKey='id'
      rowSelection={{
        type: 'checkbox',
        selectedRowKeys
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
          type: 'checkbox', selectedRowKeys: selectedRowKeys2,
          onChange: (keys, newRows, info) => {
            // eslint-disable-next-line no-console
            console.log(newRows)
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

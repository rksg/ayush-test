import { useState } from 'react'

import { Tooltip } from 'antd'
import * as _      from 'lodash'
import { useIntl } from 'react-intl'

import {
  ColumnType,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import {
  useGetSwitchVenueVersionListQuery,
  useGetSwitchCurrentVersionsQuery,
  useLazyGetSwitchListQuery
} from '@acx-ui/rc/services'
import {
  FirmwareSwitchVenue,
  TableQuery,
  useTableQuery,
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

function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const intl = useIntl()

  const columns: TableProps<FirmwareSwitchVenue>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      searchable: searchable,
      defaultSortOrder: 'ascend'
    }, {
      title: '',
      key: 'Model',
      dataIndex: 'Model'
    }, {
      title: intl.$t({ defaultMessage: 'Current Firmware' }),
      key: 'version',
      dataIndex: 'version',
      // sorter: true,
      filterable: filterables ? filterables['version'] : false,
      filterMultiple: false,
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
  tableQuery: TableQuery<FirmwareSwitchVenue, RequestPayload<unknown>, unknown>,
  searchable?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}

export const NestedSwitchFirmwareTable = (
  { tableQuery, searchable, filterables }: VenueTableProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [ getSwitchList ] = useLazyGetSwitchListQuery()


  const columns = useColumns(searchable, filterables)
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
      rowSelection={{ type: 'checkbox', selectedRowKeys }}
    />
  }


  return (
    <Loader states={[
      tableQuery,
      { isLoading: false }
    ]}>
      <SwitchUI.ExpanderTableWrapper>
        <Table
          columns={columns}
          type={'tall'}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          expandable={{
            onExpand: handleExpand,
            expandedRowRender: expandedRowRenderFunc,
            rowExpandable: record => record.switchCount ? record.switchCount > 0 : false
          }}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          enableApiFilter={true}
          rowKey='id'
          rowSelection={{ type: 'checkbox', selectedRowKeys }}
        /></SwitchUI.ExpanderTableWrapper>
    </Loader>
  )
}

export function VenueFirmwareList () {
  const venuePayload = useDefaultVenuePayload()

  const tableQuery = useTableQuery<FirmwareSwitchVenue>({
    useQuery: useGetSwitchVenueVersionListQuery,
    defaultPayload: venuePayload,
    search: {
      searchTargetFields: venuePayload.searchTargetFields as string[]
    }
  })

  const { versionFilterOptions } = useGetSwitchCurrentVersionsQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      let versionList = data?.currentVersions
      if (data?.currentVersionsAboveTen && versionList) {
        versionList = versionList.concat(data?.currentVersionsAboveTen)
      }

      return {
        // eslint-disable-next-line max-len
        versionFilterOptions: versionList?.map(v=>({ key: v, value: parseSwitchVersion(v) })) || true
      }
    }
  })

  const typeFilterOptions = [{ key: 'Release', value: 'Release' }, { key: 'Beta', value: 'Beta' }]

  return (
    <NestedSwitchFirmwareTable tableQuery={tableQuery}
      searchable={true}
      filterables={{
        version: versionFilterOptions,
        type: typeFilterOptions
      }}
    />
  )
}

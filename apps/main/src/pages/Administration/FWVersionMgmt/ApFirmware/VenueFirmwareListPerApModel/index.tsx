import { useEffect, useState } from 'react'


import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps, Tooltip }                                                                    from '@acx-ui/components'
import { useGetFirmwareVersionIdListQuery }                                                                      from '@acx-ui/rc/services'
import { FirmwareCategory, FirmwareType, FirmwareVenuePerApModel, TableResult, dateSort, defaultSort, sortProp } from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                                                                             from '@acx-ui/user'
import { noDataDisplay }                                                                                         from '@acx-ui/utils'

import { getApNextScheduleTpl, getApSchedules, getNextSchedulesTooltip, toUserDate } from '../../FirmwareUtils'
import { PreferencesDialog }                                                         from '../../PreferencesDialog'
import * as UI                                                                       from '../../styledComponents'

import { UpdateNowPerApModel }                                                         from './UpdateNowPerApModel'
import { renderCurrentFirmwaresColumn, useUpdateNowPerApModel, useUpgradePerferences } from './venueFirmwareListPerApModelUtils'

export function VenueFirmwareListPerApModel () {
  const { $t } = useIntl()
  const { data, isLoading } = useData()
  const [ selectedRowKeys, setSelectedRowKeys ] = useState([])
  const [ selectedRows, setSelectedRows ] = useState<FirmwareVenuePerApModel[]>([])
  // eslint-disable-next-line max-len
  const { updateNowVisible, setUpdateNowVisible, handleUpdateModalCancel } = useUpdateNowPerApModel()
  const {
    preferencesModalVisible, setPreferencesModalVisible, preferences,
    handlePreferencesModalCancel, handlePreferencesModalSubmit
  } = useUpgradePerferences()

  const clearSelection = () => {
    setSelectedRowKeys([])
  }

  const afterUpdateModalSubmit = () => {
    clearSelection()
  }

  const rowActions: TableProps<FirmwareVenuePerApModel>['rowActions'] = [
    {
      visible: (rows) => rows.some(row => !row.isFirmwareUpToDate),
      label: $t({ defaultMessage: 'Update Now' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setUpdateNowVisible(true)
      }
    }
  ]

  return (<>
    <Loader states={[{ isLoading }]}>
      <Table
        columns={useColumns()}
        dataSource={data?.data}
        // onChange={tableQuery.handleTableChange}
        // onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'checkbox', selectedRowKeys }}
        actions={filterByAccess([{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setPreferencesModalVisible(true)
        }])}
      />
    </Loader>
    {updateNowVisible && selectedRows && <UpdateNowPerApModel
      onCancel={handleUpdateModalCancel}
      afterSubmit={afterUpdateModalSubmit}
      selectedVenuesFirmwares={selectedRows}
    />}
    <PreferencesDialog
      visible={preferencesModalVisible}
      data={preferences}
      onCancel={handlePreferencesModalCancel}
      onSubmit={handlePreferencesModalSubmit}
    />
  </>)
}

function useColumns () {
  const { $t } = useIntl()
  const { versionFilterOptions } = useGetFirmwareVersionIdListQuery({ params: useParams() }, {
    refetchOnMountOrArgChange: false,
    selectFromResult ({ data }) {
      return {
        versionFilterOptions: data?.map(v => ({ key: v, value: v })) || true
      }
    }
  })

  const columns: TableProps<FirmwareVenuePerApModel>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Current Firmware' }),
      key: 'currentApFirmwares',
      dataIndex: 'currentApFirmwares',
      filterable: versionFilterOptions ?? false,
      filterMultiple: false,
      render: function (data, row) {
        return row.currentApFirmwares
          ? renderCurrentFirmwaresColumn(row.currentApFirmwares)
          : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'lastScheduleUpdate',
      dataIndex: 'lastScheduleUpdate',
      sorter: { compare: sortProp('lastScheduleUpdate', dateSort) },
      render: function (_, row) {
        return toUserDate(row.lastScheduleUpdate || noDataDisplay)
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'isFirmwareUpToDate',
      dataIndex: 'isFirmwareUpToDate',
      sorter: { compare: sortProp('isFirmwareUpToDate', defaultSort) },
      render: function (_, row) {
        return row.isFirmwareUpToDate
          ? $t({ defaultMessage: 'Up to date' })
          : $t({ defaultMessage: 'Update available' })
      }
    },
    {
      title: $t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextSchedules',
      dataIndex: 'nextSchedules',
      sorter: { compare: sortProp('nextSchedules[0].startDateTime', dateSort) },
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const schedules = getApSchedules(row)

        return schedules.length === 0
          ? getApNextScheduleTpl(row)
          : <Tooltip
            title={<UI.ScheduleTooltipText>{getNextSchedulesTooltip(row)}</UI.ScheduleTooltipText>}
            overlayStyle={{ minWidth: '285px' }}
          ><UI.WithTooltip>{getApNextScheduleTpl(row)}</UI.WithTooltip></Tooltip>
      }
    }
  ]

  return columns
}

function useData () {
  const [ data, setData ] = useState<TableResult<FirmwareVenuePerApModel>>()
  const [ isLoading, setIsLoading ] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setData(getTestingData())
      setIsLoading(false)
    }, 100)
  }, [])

  return {
    data,
    isLoading
  }
}

function getTestingData (): TableResult<FirmwareVenuePerApModel> {
  return {
    page: 1,
    totalCount: 4,
    data: [
      {
        id: '32127cc0605f416ab8dd070ed8c30b72',
        name: 'VenueAAA-withFirmwareSchedule',
        isFirmwareUpToDate: false,
        currentApFirmwares: [
          { apModel: 'R770', firmware: '7.0.0.103.1240' },
          { apModel: 'R750', firmware: '7.0.0.103.1240' },
          { apModel: 'R550', firmware: '7.0.0.103.1000' },
          { apModel: 'R720', firmware: '6.2.3.103.800' },
          { apModel: 'R500', firmware: '6.2.0.103.533' }
        ],
        lastScheduleUpdate: '2024-02-26T16:00:00.784-08:00',
        nextSchedules: [
          {
            startDateTime: '2024-03-04T14:00:00-08:00',
            versionInfo: {
              version: '7.0.0.104.1220',
              type: FirmwareType.AP_FIRMWARE_UPGRADE,
              category: FirmwareCategory.RECOMMENDED
            }
          },
          {
            startDateTime: '2024-03-04T14:00:00-08:00',
            versionInfo: {
              version: '6.2.0.103.554',
              type: FirmwareType.AP_FIRMWARE_UPGRADE,
              category: FirmwareCategory.RECOMMENDED
            }
          }
        ]
      },
      {
        id: '90b0b0cd6c3a44a894fe73e210b1a4c1',
        name: 'venueBBB-upToDate',
        isFirmwareUpToDate: true,
        currentApFirmwares: [
          { apModel: 'R550', firmware: '7.0.0.104.1220' }
        ],
        lastScheduleUpdate: '2024-02-22T14:00:01.099-08:00'
      },
      {
        id: '10b0b0cd6c3a44a894fe73e210b12345',
        name: 'venueCCC-oneApOutdated',
        isFirmwareUpToDate: false,
        currentApFirmwares: [
          { apModel: 'R350', firmware: '7.0.0.104.1220' },
          { apModel: 'R550', firmware: '6.2.0.103.486' }
        ],
        lastScheduleUpdate: '2022-01-12T14:00:01.099-08:00'
      },
      {
        id: '6015f2a175e1429bad3e80f4e45287da',
        name: 'venueDDD-VenueIsNotInWifiDBOrNoAp',
        isFirmwareUpToDate: true
      }
    ]
  }
}

import { useState } from 'react'


import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, Table, TableProps, Tooltip, showActionModal }                                                            from '@acx-ui/components'
import { useGetFirmwareVersionIdListQuery, useGetVenueApModelFirmwareListQuery, useSkipVenueSchedulesPerApModelMutation } from '@acx-ui/rc/services'
import { FirmwareType, FirmwareVenuePerApModel, Schedule, dateSort, defaultSort, sortProp, useTableQuery }                from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess }                                                                                      from '@acx-ui/user'
import { noDataDisplay }                                                                                                  from '@acx-ui/utils'

import { compareVersions, getApNextScheduleTpl, getApSchedules, getNextSchedulesTooltip, toUserDate } from '../../FirmwareUtils'
import { PreferencesDialog }                                                                          from '../../PreferencesDialog'
import * as UI                                                                                        from '../../styledComponents'

import { ChangeSchedulePerApModelDialog }                                                                                  from './ChangeScheduleDialog'
import { UpdateNowPerApModelDialog }                                                                                       from './UpdateNowDialog'
import { renderCurrentFirmwaresColumn, useChangeScheduleVisiblePerApModel, useUpdateNowPerApModel, useUpgradePerferences } from './venueFirmwareListPerApModelUtils'

export function VenueFirmwareListPerApModel () {
  const { $t } = useIntl()
  const tableQuery = useTableQuery<FirmwareVenuePerApModel>({
    useQuery: useGetVenueApModelFirmwareListQuery,
    defaultPayload: {}
  })
  const [ selectedRowKeys, setSelectedRowKeys ] = useState([])
  const [ selectedRows, setSelectedRows ] = useState<FirmwareVenuePerApModel[]>([])
  const { updateNowVisible, setUpdateNowVisible, handleUpdateNowCancel } = useUpdateNowPerApModel()
  // eslint-disable-next-line max-len
  const { changeScheduleVisible, setChangeScheduleVisible, handleChangeScheduleCancel } = useChangeScheduleVisiblePerApModel()
  const {
    preferencesModalVisible, setPreferencesModalVisible, preferences,
    handlePreferencesModalCancel, handlePreferencesModalSubmit
  } = useUpgradePerferences()
  const [ skipVenueSchedulesUpgrade ] = useSkipVenueSchedulesPerApModelMutation()

  const clearSelection = () => {
    setSelectedRowKeys([])
  }

  const afterUpdateModalSubmit = () => {
    clearSelection()
  }

  const doSkipSchedules = (selectedRows: FirmwareVenuePerApModel[], callback: () => void) => {
    showActionModal({
      type: 'confirm',
      width: 460,
      title: $t({ defaultMessage: 'Skip This Update?' }),
      // eslint-disable-next-line max-len
      content: $t({ defaultMessage: 'Please confirm that you wish to exclude the selected <venuePlural></venuePlural> from this scheduled update' }),
      okText: $t({ defaultMessage: 'Skip' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      onOk () {
        skipVenueSchedulesUpgrade({
          payload: { venueIds: selectedRows.map((row) => row.id) }
        }).then(callback)
      }
    })
  }

  const rowActions: TableProps<FirmwareVenuePerApModel>['rowActions'] = [
    {
      visible: (rows) => rows.some(row => !row.isFirmwareUpToDate),
      label: $t({ defaultMessage: 'Update Now' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setUpdateNowVisible(true)
      }
    },
    {
      visible: (rows) => rows.some(row => !row.isFirmwareUpToDate),
      label: $t({ defaultMessage: 'Change Update Schedule' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setChangeScheduleVisible(true)
      }
    },
    {
      visible: (rows) => rows.every(row => hasApSchedule(row)),
      label: $t({ defaultMessage: 'Skip Update' }),
      onClick: (rows, clearSelection) => {
        doSkipSchedules(rows, clearSelection)
      }
    }
  ]

  return (<>
    <Loader states={[tableQuery]}>
      <Table
        columns={useColumns()}
        dataSource={tableQuery.data?.data}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
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
    {updateNowVisible && selectedRows && <UpdateNowPerApModelDialog
      onCancel={handleUpdateNowCancel}
      afterSubmit={afterUpdateModalSubmit}
      selectedVenuesFirmwares={selectedRows}
    />}
    {changeScheduleVisible && selectedRows && <ChangeSchedulePerApModelDialog
      onCancel={handleChangeScheduleCancel}
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
  const versionFilterOptions = useVersionFilterOptions()

  const columns: TableProps<FirmwareVenuePerApModel>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
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

function useVersionFilterOptions () {
  const { versionFilterOptions } = useGetFirmwareVersionIdListQuery({ params: useParams() }, {
    refetchOnMountOrArgChange: false,
    selectFromResult ({ data }) {
      return {
        // eslint-disable-next-line max-len
        versionFilterOptions: data?.map(v => ({ key: v, value: v })).sort((v1, v2) => -compareVersions(v1.value, v2.value))
      }
    }
  })

  return versionFilterOptions
}

function hasApSchedule (venue: { nextSchedules?: Schedule[] }): boolean {
  return !!venue.nextSchedules &&
    // eslint-disable-next-line max-len
    venue.nextSchedules.some(schedule => schedule?.versionInfo?.type === FirmwareType.AP_FIRMWARE_UPGRADE)
}

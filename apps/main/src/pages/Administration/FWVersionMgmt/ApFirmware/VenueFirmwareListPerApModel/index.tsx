import { useContext, useState } from 'react'


import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip, showActionModal } from '@acx-ui/components'
import {
  renderCurrentFirmwaresColumn,
  useChangeScheduleVisiblePerApModel,
  useUpdateNowPerApModel,
  useUpgradePerferences,
  useDowngradePerApModel,
  UpdateNowPerApModelDialog,
  ChangeSchedulePerApModelDialog,
  useUpdateEarlyAccessNowPerApModel,
  UpdateEarlyAccessNowDialog
} from '@acx-ui/rc/components'
import {
  compareVersions,
  getApNextScheduleTpl,
  getApSchedules,
  getNextSchedulesTooltip,
  toUserDate
} from '@acx-ui/rc/components'
import {
  useGetVenueApModelFirmwareListQuery,
  useSkipVenueSchedulesPerApModelMutation
} from '@acx-ui/rc/services'
import { FirmwareType, FirmwareVenuePerApModel, useTableQuery } from '@acx-ui/rc/utils'
import { RolesEnum, WifiScopes }                                from '@acx-ui/types'
import {
  filterByAccess,
  hasPermission,
  hasRoles
}                                                               from '@acx-ui/user'
import { getIntl, noDataDisplay } from '@acx-ui/utils'

import { isApFirmwareUpToDate } from '../..'
import { PreferencesDialog }    from '../../PreferencesDialog'
import * as UI                  from '../../styledComponents'
import { ApFirmwareContext }    from '../index'

import { DowngradePerApModelDialog } from './DowngradeDialog'

export function VenueFirmwareListPerApModel () {
  const { $t } = useIntl()
  const apFirmwareContext = useContext(ApFirmwareContext)
  const tableQuery = useTableQuery<FirmwareVenuePerApModel>({
    useQuery: useGetVenueApModelFirmwareListQuery,
    defaultPayload: {
      // eslint-disable-next-line max-len
      fields: ['name', 'id', 'isApFirmwareUpToDate', 'currentApFirmwares', 'lastApFirmwareUpdate', 'nextApFirmwareSchedules']
    },
    search: {
      searchTargetFields: ['name']
    }
  })
  const isEarlyAccess = (apFirmwareContext.isAlphaFlag || apFirmwareContext.isBetaFlag) as boolean
  const [ selectedRowKeys, setSelectedRowKeys ] = useState([])
  const [ selectedRows, setSelectedRows ] = useState<FirmwareVenuePerApModel[]>([])
  const { updateNowVisible, setUpdateNowVisible, handleUpdateNowCancel } = useUpdateNowPerApModel()
  // eslint-disable-next-line max-len
  const { updateEarlyAccessNowVisible, setUpdateEarlyAccessNowVisible, handleUpdateEarlyAccessNowCancel } = useUpdateEarlyAccessNowPerApModel()
  // eslint-disable-next-line max-len
  const { downgradeVisible, setDowngradeVisible, handleDowngradeCancel, canDowngrade } = useDowngradePerApModel()
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

  const afterAction = () => {
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
      scopeKey: [WifiScopes.UPDATE],
      visible: (rows) => rows.some(row => !isApFirmwareUpToDate(row.isApFirmwareUpToDate)),
      label: $t({ defaultMessage: 'Update Now' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setUpdateNowVisible(true)
      }
    },
    {
      scopeKey: [WifiScopes.UPDATE],
      // eslint-disable-next-line max-len
      visible: (rows) => isEarlyAccess && rows.some(row => !isApFirmwareUpToDate(row.isApFirmwareUpToDate)),
      label: $t({ defaultMessage: 'Update with Early Access Now' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setUpdateEarlyAccessNowVisible(true)
      }
    },
    {
      scopeKey: [WifiScopes.UPDATE],
      visible: (rows) => rows.some(row => !isApFirmwareUpToDate(row.isApFirmwareUpToDate)),
      label: $t({ defaultMessage: 'Change Update Schedule' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setChangeScheduleVisible(true)
      }
    },
    {
      scopeKey: [WifiScopes.UPDATE],
      visible: (rows) => rows.every(row => hasApSchedule(row.nextApFirmwareSchedules)),
      label: $t({ defaultMessage: 'Skip Update' }),
      onClick: (rows, clearSelection) => {
        doSkipSchedules(rows, clearSelection)
      }
    },
    {
      scopeKey: [WifiScopes.UPDATE],
      visible: (rows) => canDowngrade(rows),
      // eslint-disable-next-line max-len
      label: $t({ defaultMessage: 'Downgrade' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setDowngradeVisible(true)
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
        pagination={tableQuery.pagination}
        enableApiFilter={true}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        // eslint-disable-next-line max-len
        rowSelection={hasPermission({ scopes: [WifiScopes.UPDATE] }) &&
          { type: 'checkbox', selectedRowKeys }}
        actions={hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]) ? [{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setPreferencesModalVisible(true)
        }] : []}
      />
    </Loader>
    {updateNowVisible && selectedRows && <UpdateNowPerApModelDialog
      onCancel={handleUpdateNowCancel}
      afterSubmit={afterAction}
      selectedVenuesFirmwares={selectedRows}
    />}
    {changeScheduleVisible && selectedRows && <ChangeSchedulePerApModelDialog
      onCancel={handleChangeScheduleCancel}
      afterSubmit={afterAction}
      selectedVenuesFirmwares={selectedRows}
    />}
    {downgradeVisible && selectedRows && <DowngradePerApModelDialog
      onCancel={handleDowngradeCancel}
      afterSubmit={afterAction}
      selectedVenuesFirmwares={selectedRows}
    />}
    {updateEarlyAccessNowVisible && selectedRows && <UpdateEarlyAccessNowDialog
      onCancel={handleUpdateEarlyAccessNowCancel}
      afterSubmit={afterAction}
      selectedVenuesFirmwares={selectedRows}
      isAlpha={apFirmwareContext.isAlphaFlag as boolean}
      isBeta={apFirmwareContext.isBetaFlag as boolean}
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
      sorter: true,
      defaultSortOrder: 'ascend',
      searchable: true
    },
    {
      title: $t({ defaultMessage: 'Current Firmware' }),
      key: 'currentApFirmwares',
      dataIndex: 'currentApFirmwares',
      filterable: versionFilterOptions ?? false,
      filterMultiple: false,
      filterKey: 'currentApFirmwares.firmware',
      render: function (data, row) {
        return row.currentApFirmwares && row.currentApFirmwares.length > 0
          ? renderCurrentFirmwaresColumn(row.currentApFirmwares)
          : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'lastApFirmwareUpdate',
      dataIndex: 'lastApFirmwareUpdate',
      sorter: true,
      render: function (_, row) {
        return toUserDate(row.lastApFirmwareUpdate || noDataDisplay)
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'isApFirmwareUpToDate',
      dataIndex: 'isApFirmwareUpToDate',
      sorter: true,
      render: function (_, row) {
        return getApFirmwareStatusDescription(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextApFirmwareSchedules',
      dataIndex: 'nextApFirmwareSchedules',
      sorter: true,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const schedules = getApSchedules(row.nextApFirmwareSchedules)

        return schedules.length === 0
          ? getApNextScheduleTpl({ nextSchedules: schedules })
          : <Tooltip
            // eslint-disable-next-line max-len
            title={getNextSchedulesTooltip(schedules)}
            overlayStyle={{ minWidth: '285px' }}
          // eslint-disable-next-line max-len
          ><UI.WithTooltip>{getApNextScheduleTpl({ nextSchedules: schedules })}</UI.WithTooltip></Tooltip>
      }
    }
  ]

  return columns
}

function useVersionFilterOptions () {
  const { versionFilterOptions } = useGetVenueApModelFirmwareListQuery({
    payload: {
      fields: ['name', 'id', 'currentApFirmwares'],
      page: 1, pageSize: 10000
    }
  }, {
    selectFromResult: ({ data }) => {
      // eslint-disable-next-line max-len
      const allFirmware = data?.data.map(v => v.currentApFirmwares?.map(f => f.firmware)).flat().filter(v => v) || []
      const uniqueFirmware = [...new Set(allFirmware)].sort((v1, v2) => -compareVersions(v1, v2))

      return {
        versionFilterOptions: uniqueFirmware.map(v => ({ key: v, value: v }))
      }
    }
  })

  return versionFilterOptions
}

// eslint-disable-next-line max-len
function hasApSchedule (nextSchedules: FirmwareVenuePerApModel['nextApFirmwareSchedules']): boolean {
  return !!nextSchedules &&
    // eslint-disable-next-line max-len
    nextSchedules.some(schedule => schedule?.versionInfo?.type === FirmwareType.AP_FIRMWARE_UPGRADE)
}

export function getApFirmwareStatusDescription (
  data: Pick<FirmwareVenuePerApModel, 'isApFirmwareUpToDate' | 'currentApFirmwares'>
): string {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  if (data.isApFirmwareUpToDate === undefined || (data.currentApFirmwares ?? []).length === 0) {
    return noDataDisplay
  }

  return data.isApFirmwareUpToDate
    ? $t({ defaultMessage: 'Up to date' })
    : $t({ defaultMessage: 'Update available' })
}

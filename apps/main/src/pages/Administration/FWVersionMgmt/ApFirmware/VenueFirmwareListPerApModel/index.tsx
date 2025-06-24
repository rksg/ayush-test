import { useCallback, useContext, useState } from 'react'


import { useIntl } from 'react-intl'

import { Loader, Table, TableProps, Tooltip, showActionModal, Filter }                             from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                  from '@acx-ui/feature-toggle'
import {
  renderCurrentFirmwaresColumn,
  useChangeScheduleVisiblePerApModel,
  useUpdateNowPerApModel,
  useUpgradePerferences,
  useDowngradePerApModel,
  UpdateNowPerApModelDialog,
  ChangeSchedulePerApModelDialog,
  useUpdateEarlyAccessNowPerApModel,
  UpdateEarlyAccessNowDialog, convertToApModelIndividualDisplayData, isAlphaFilter, isBetaFilter
} from '@acx-ui/rc/components'
import {
  compareVersions,
  getApNextScheduleTpl,
  getApSchedules,
  getNextSchedulesTooltip,
  toUserDate
} from '@acx-ui/rc/components'
import {
  useGetAllApModelFirmwareListQuery,
  useGetVenueApModelFirmwareListQuery, useGetVenueApModelFirmwareSchedulesListQuery,
  useSkipVenueSchedulesPerApModelMutation
} from '@acx-ui/rc/services'
import {
  ApModelFirmware,
  dateSort,
  defaultSort, FirmwareLabel,
  FirmwareType,
  FirmwareUrlsInfo,
  FirmwareVenuePerApModel,
  sortProp,
  SortResult,
  useTableQuery
} from '@acx-ui/rc/utils'
import { RolesEnum, WifiScopes } from '@acx-ui/types'
import {
  filterByAccess, getUserProfile, hasAllowedOperations,
  hasRoles
} from '@acx-ui/user'
import { getIntl, getOpsApi, noDataDisplay } from '@acx-ui/utils'

import { isApFirmwareUpToDate } from '../..'
import { PreferencesDialog }    from '../../PreferencesDialog'
import * as UI                  from '../../styledComponents'
import { ApFirmwareContext }    from '../index'

import { DowngradePerApModelDialog } from './DowngradeDialog'

export function VenueFirmwareListPerApModel () {
  const { $t } = useIntl()
  const { rbacOpsApiEnabled } = getUserProfile()
  const apFirmwareContext = useContext(ApFirmwareContext)
  const isApFwMgmtEarlyAccess = useIsSplitOn(Features.AP_FW_MGMT_EARLY_ACCESS_TOGGLE)
  const [searchString, setSearchString] = useState('')
  const [filterString, setFilterString] = useState('')

  const { data: apModelFirmwares } = useGetAllApModelFirmwareListQuery({}, {
    refetchOnMountOrArgChange: 300
  })

  const useGetVenueApModelFirmwareListData = () => {
    const tableQuery = useTableQuery<FirmwareVenuePerApModel>({
      useQuery: useGetVenueApModelFirmwareListQuery,
      defaultPayload: {
        // eslint-disable-next-line max-len
        fields: ['name', 'id', 'isApFirmwareUpToDate', 'currentApFirmwares', 'lastApFirmwareUpdate', 'nextApFirmwareSchedules']
      },
      search: {
        searchTargetFields: ['name']
      },
      option: {
        skip: isApFwMgmtEarlyAccess
      }
    })

    const { data, isLoading } = useGetVenueApModelFirmwareSchedulesListQuery({
      payload: {
        firmwareVersion: filterString,
        search: searchString
      }
    }, {
      skip: !isApFwMgmtEarlyAccess
    })

    const pagination = { pageSize: 10, defaultPageSize: 10 }
    const onFilterChange = (filter: Filter, search: { searchString?: string }) => {
      if (search.searchString !== searchString) {
        setSearchString(search.searchString || '')
      }
      if ((filter['currentApFirmwares.firmware']?.length ?? 0) > 0) {
        setFilterString((filter['currentApFirmwares.firmware'] || [''])[0] as string)
      } else {
        setFilterString('')
      }
    }

    return {
      data: isApFwMgmtEarlyAccess ? data : tableQuery.data?.data,
      onChange: isApFwMgmtEarlyAccess ? () => {} : tableQuery.handleTableChange,
      pagination: isApFwMgmtEarlyAccess ? pagination : tableQuery.pagination,
      onFilterChange: isApFwMgmtEarlyAccess ? onFilterChange : tableQuery.handleFilterChange,
      isLoading: isApFwMgmtEarlyAccess ? { isLoading } : tableQuery
    }
  }

  const {
    data,
    pagination,
    onChange,
    onFilterChange,
    isLoading
  } = useGetVenueApModelFirmwareListData()
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

  // eslint-disable-next-line max-len
  const genUpdateDisplayData = useCallback((apModelFirmwares: ApModelFirmware[], selectedRows: FirmwareVenuePerApModel[], forEarlyAccess: boolean = false, isApFwMgmtEarlyAccess: boolean) => {
    let eaApModelFirmwares = [] as ApModelFirmware[]
    let updateAlphaGroups = apModelFirmwares.filter(data => isAlphaFilter(data.labels))
    // eslint-disable-next-line max-len
    let updateBetaGroups = apModelFirmwares.filter(data => isBetaFilter(data.labels, (apFirmwareContext.isBetaFlag && !apFirmwareContext.isAlphaFlag)))

    eaApModelFirmwares = [
      ...(apFirmwareContext.isAlphaFlag ? updateAlphaGroups : []),
      ...((apFirmwareContext.isBetaFlag || apFirmwareContext.isAlphaFlag) ? updateBetaGroups : [])
    ]

    eaApModelFirmwares.sort((a, b) => compareVersions(b.id, a.id))

    const gaApModelFirmwares = apModelFirmwares
      .filter(apModelFirmware => apModelFirmware.labels?.includes(FirmwareLabel.GA))

    eaApModelFirmwares = eaApModelFirmwares.map(eaApModelFirmware => {
      const eaVersion = eaApModelFirmware.id
      const filteredApModels = eaApModelFirmware.supportedApModels?.filter(apModel => {
        return !gaApModelFirmwares.some(gaApModelFirmware => {
          return compareVersions(gaApModelFirmware.id, eaVersion) > 0
            && gaApModelFirmware.supportedApModels?.includes(apModel)
        })
      })

      return {
        ...eaApModelFirmware,
        supportedApModels: filteredApModels
      }
    })

    const filterApModelFirmwares = isApFwMgmtEarlyAccess
      ? ( forEarlyAccess ? eaApModelFirmwares : gaApModelFirmwares )
      : apModelFirmwares
    return convertToApModelIndividualDisplayData(
      filterApModelFirmwares,
      selectedRows,
      undefined,
      true
    )
    // eslint-disable-next-line max-len
  }, [apModelFirmwares, apFirmwareContext.isBetaFlag, apFirmwareContext.isAlphaFlag, selectedRows, isApFwMgmtEarlyAccess])

  // eslint-disable-next-line max-len
  const hasAvailableUpdateDisplayData = (rows: FirmwareVenuePerApModel[], forEarlyAccess: boolean = false) => {
    const updatedDisplayData = genUpdateDisplayData(
      apModelFirmwares || [],
      rows,
      forEarlyAccess,
      isApFwMgmtEarlyAccess
    )
    // eslint-disable-next-line max-len
    if (updatedDisplayData.length === 0 || updatedDisplayData.every(data => data.versionOptions.length === 0)) {
      return false
    }

    return true
  }

  const rowActions: TableProps<FirmwareVenuePerApModel>['rowActions'] = [
    {
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [getOpsApi(FirmwareUrlsInfo.patchVenueApModelFirmwares)],
      visible: (rows) => {
        if (!hasAvailableUpdateDisplayData(rows)) {
          return false
        }
        return rows.some(row => !isApFirmwareUpToDate(row.isApFirmwareUpToDate))
      },
      label: $t({ defaultMessage: 'Update Now' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setUpdateNowVisible(true)
      }
    },
    {
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [getOpsApi(FirmwareUrlsInfo.patchVenueApModelFirmwares)],
      visible: (rows) => {
        const forEarlyAccess = true
        if (!hasAvailableUpdateDisplayData(rows, forEarlyAccess)) {
          return false
        }
        // eslint-disable-next-line max-len
        return isApFwMgmtEarlyAccess && isEarlyAccess && rows.some(row => !isApFirmwareUpToDate(row.isApFirmwareUpToDate))
      },
      label: $t({ defaultMessage: 'Update with Early Access Now' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setUpdateEarlyAccessNowVisible(true)
      }
    },
    {
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [getOpsApi(FirmwareUrlsInfo.updateVenueSchedulesPerApModel)],
      visible: (rows) => {
        if (!hasAvailableUpdateDisplayData(rows)) {
          return false
        }

        return rows.some(row => !isApFirmwareUpToDate(row.isApFirmwareUpToDate))
      },
      label: $t({ defaultMessage: 'Change Update Schedule' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setChangeScheduleVisible(true)
      }
    },
    {
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [getOpsApi(FirmwareUrlsInfo.skipVenueSchedulesPerApModel)],
      visible: (rows) => rows.every(row => hasApSchedule(row.nextApFirmwareSchedules)),
      label: $t({ defaultMessage: 'Skip Update' }),
      onClick: (rows, clearSelection) => {
        doSkipSchedules(rows, clearSelection)
      }
    },
    {
      scopeKey: [WifiScopes.UPDATE],
      rbacOpsIds: [getOpsApi(FirmwareUrlsInfo.patchVenueApModelFirmwares)],
      visible: (rows) => canDowngrade(rows),
      // eslint-disable-next-line max-len
      label: $t({ defaultMessage: 'Downgrade' }),
      onClick: (rows) => {
        setSelectedRows(rows)
        setDowngradeVisible(true)
      }
    }
  ]

  const isPreferencesVisible = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(FirmwareUrlsInfo.updateEdgeUpgradePreferences)])
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  return (<>
    <Loader states={[isLoading]}>
      <Table
        columns={useColumns()}
        dataSource={data}
        pagination={pagination}
        {...(isApFwMgmtEarlyAccess ? {} : { onChange })}
        onFilterChange={onFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        // eslint-disable-next-line max-len
        rowSelection={filterByAccess(rowActions).length > 0 &&
          { type: 'checkbox', selectedRowKeys }}
        actions={isPreferencesVisible ? [{
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
  const intl = useIntl()
  const { $t } = intl
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
      sorter: { compare: (a, b) => {
        const aFirmware = a.currentApFirmwares?.[0]?.firmware || '0'
        const bFirmware = b.currentApFirmwares?.[0]?.firmware || '0'
        return compareVersions(aFirmware, bFirmware)
      } },
      filterable: versionFilterOptions ?? false,
      filterMultiple: false,
      filterKey: 'currentApFirmwares.firmware',
      render: function (data, row) {
        return row.currentApFirmwares && row.currentApFirmwares.length > 0
          ? renderCurrentFirmwaresColumn(row.currentApFirmwares, intl)
          : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'lastApFirmwareUpdate',
      dataIndex: 'lastApFirmwareUpdate',
      sorter: { compare: sortProp('lastApFirmwareUpdate', dateSort) },
      render: function (_, row) {
        return toUserDate(row.lastApFirmwareUpdate || noDataDisplay)
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'isFirmwareUpToDate',
      dataIndex: 'isFirmwareUpToDate',
      sorter: { compare: (a, b) => {
        const aDesc = getApFirmwareStatusDescription(a)
        const bDesc = getApFirmwareStatusDescription(b)
        // eslint-disable-next-line max-len
        return String(aDesc).localeCompare(String(bDesc), getIntl().locale, { sensitivity: 'base' }) as SortResult
      } },
      render: function (_, row) {
        return getApFirmwareStatusDescription(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextApFirmwareSchedules',
      dataIndex: 'nextApFirmwareSchedules',
      sorter: { compare: sortProp('nextApFirmwareSchedules[0].startDateTime', dateSort) },
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
  // eslint-disable-next-line max-len
  data: Pick<FirmwareVenuePerApModel, 'isApFirmwareUpToDate' | 'currentApFirmwares'>
): string {
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const isApFirmwareUpToDate = data.isApFirmwareUpToDate
  // eslint-disable-next-line max-len
  if (isApFirmwareUpToDate === undefined || (data.currentApFirmwares ?? []).length === 0) {
    return noDataDisplay
  }

  return isApFirmwareUpToDate
    ? $t({ defaultMessage: 'Up to date' })
    : $t({ defaultMessage: 'Update available' })
}

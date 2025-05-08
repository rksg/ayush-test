import React, { useState } from 'react'

import { Tooltip, Typography } from 'antd'
import * as _                  from 'lodash'
import { useIntl }             from 'react-intl'

import {
  ColumnType,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { useSwitchFirmwareUtils } from '@acx-ui/rc/components'
import {
  getNextScheduleTpl,
  toUserDate
} from '@acx-ui/rc/components'
import {
  useGetSwitchUpgradePreferencesQuery, //TODO
  useUpdateSwitchUpgradePreferencesMutation, //TODO
  useGetSwitchVenueVersionListQuery,
  useGetSwitchAvailableFirmwareListQuery,
  useGetSwitchCurrentVersionsQuery,
  useGetSwitchFirmwarePredownloadQuery
} from '@acx-ui/rc/services'
import {
  UpgradePreferences,
  FirmwareSwitchVenue,
  FirmwareVersion,
  TableQuery,
  sortProp,
  defaultSort,
  usePollingTableQuery,
  SwitchFirmwareStatusType, FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import { useParams }                               from '@acx-ui/react-router-dom'
import { RequestPayload, RolesEnum, SwitchScopes } from '@acx-ui/types'
import {
  filterByAccess, getUserProfile, hasAllowedOperations,
  hasPermission,
  hasRoles
} from '@acx-ui/user'
import { getOpsApi, noDataDisplay } from '@acx-ui/utils'

import { PreferencesDialog } from '../../PreferencesDialog'

import * as UI                                           from './styledComponents'
import { SwitchScheduleDrawer }                          from './SwitchScheduleDrawer'
import { SwitchFirmwareWizardType, SwitchUpgradeWizard } from './SwitchUpgradeWizard'
import { VenueStatusDrawer }                             from './VenueStatusDrawer'

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

export const VenueFirmwareTable = (
  { tableQuery, filterables }: VenueTableProps) => {
  const { $t } = useIntl()
  const intl = useIntl()
  const params = useParams()
  const { rbacOpsApiEnabled } = getUserProfile()

  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const {
    getSwitchNextScheduleTplTooltip,
    getSwitchFirmwareList,
    getSwitchVenueAvailableVersions,
    sortAvailableVersionProp
  } = useSwitchFirmwareUtils()
  const { data: availableVersions } = useGetSwitchAvailableFirmwareListQuery({
    params,
    enableRbac: isSwitchRbacEnabled
  })
  const [modelVisible, setModelVisible] = useState(false)
  const [updateNowWizardVisible, setUpdateNowWizardVisible] = useState(false)
  const [updateStatusDrawerVisible, setUpdateStatusDrawerVisible] = useState(false)
  const [clickedRowData, setClickedRowData] =
    useState<FirmwareSwitchVenue>({} as FirmwareSwitchVenue)
  const [switchScheduleDrawerVisible, setSwitchScheduleDrawerVisible] = useState(false)

  const [wizardType, setWizardType] =
    useState<SwitchFirmwareWizardType>(SwitchFirmwareWizardType.update)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedVenueList, setSelectedVenueList] = useState<FirmwareSwitchVenue[]>([])

  const { data: preDownload } = useGetSwitchFirmwarePredownloadQuery({
    params,
    enableRbac: isSwitchRbacEnabled
  })

  const [updateUpgradePreferences] = useUpdateSwitchUpgradePreferencesMutation()
  const { data: preferencesData } = useGetSwitchUpgradePreferencesQuery({ params })

  const preferenceDays = preferencesData?.days?.map((day) => {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
  })
  let preferences = {
    ...preferencesData,
    days: preferenceDays
  }

  const handleModalCancel = () => {
    setModelVisible(false)
  }

  const handleModalSubmit = async (payload: UpgradePreferences) => {
    try {
      await updateUpgradePreferences({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }
  const columns: TableProps<FirmwareSwitchVenue>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: isSwitchRbacEnabled ? 'venueName' : 'name',
      dataIndex: isSwitchRbacEnabled ? 'venueName' : 'name',
      sorter: { compare: sortProp(isSwitchRbacEnabled ? 'venueName' : 'name', defaultSort) },
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (_, row, __, highlightFn) {
        const name = isSwitchRbacEnabled ? row.venueName : row.name
        return highlightFn(name)
      }
    },
    {
      title: $t({ defaultMessage: 'Current Firmware' }),
      key: 'version',
      dataIndex: 'version',
      sorter: { compare: sortProp('switchFirmwareVersion.id', defaultSort) },
      filterable: filterables ? filterables['version'] : false,
      filterMultiple: false,
      render: function (_, row) {
        let versionList = getSwitchFirmwareList(row)
        return versionList.length > 0 ? versionList.join(', ') : noDataDisplay
      }
    },
    {
      title: $t({ defaultMessage: 'Available Firmware' }),
      sorter: { compare: sortAvailableVersionProp(defaultSort) },
      key: 'availableVersions',
      dataIndex: 'availableVersions',
      render: function (__, row) {
        return getSwitchVenueAvailableVersions(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      sorter: { compare: sortProp('status', defaultSort) },
      render: function (__, row) {

        const switchFirmwareStatusTextMapping: { [key in SwitchFirmwareStatusType]: string } = {
          [SwitchFirmwareStatusType.NONE]: noDataDisplay,
          [SwitchFirmwareStatusType.INITIATE]:
            $t({ defaultMessage: 'Firmware update initiated.' }),
          [SwitchFirmwareStatusType.SUCCESS]:
            $t({ defaultMessage: 'Update successful.' }),
          [SwitchFirmwareStatusType.FAILED]:
            $t({ defaultMessage: 'Update failed.' })
        }

        if (_.isEmpty(row.status) || row.status === SwitchFirmwareStatusType.NONE
          || _.isEmpty(switchFirmwareStatusTextMapping[row.status])) {
          return noDataDisplay
        }

        return <div>
          <Typography.Text
            style={{ lineHeight: '24px' }}>
            {switchFirmwareStatusTextMapping[row.status]}
          </Typography.Text>
          <UI.TextButton
            size='small'
            ghost={true}
            onClick={(e) => {
              e.stopPropagation()
              setClickedRowData(row)
              setUpdateStatusDrawerVisible(true)
            }}>
            {$t({ defaultMessage: 'Check Status' })}
          </UI.TextButton></div>
      }
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'lastUpdate',
      dataIndex: 'lastUpdate',
      sorter: { compare: sortProp('lastScheduleUpdateTime', defaultSort) },
      render: function (_, row) {
        return toUserDate(row.lastScheduleUpdateTime || noDataDisplay)
      }
    },
    {
      title: $t({ defaultMessage: 'Scheduling' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      sorter: { compare: sortProp('nextSchedule.timeSlot.startDateTime', defaultSort) },
      render: function (__, row) {
        const hasMultipleSchedule = (_.isEmpty(row.nextSchedule) && row.scheduleCount > 0) ||
          (!_.isEmpty(row.nextSchedule) && row.scheduleCount > 1)
        if (hasMultipleSchedule) {
          return <div>
            <Typography.Text
              style={{ lineHeight: '24px' }}>
              {intl.$t({ defaultMessage: 'Multiple.' })}
            </Typography.Text>
            <UI.TextButton
              size='small'
              ghost={true}
              onClick={(e) => {
                e.stopPropagation()
                setSwitchScheduleDrawerVisible(true)
                setClickedRowData(row)
              }}>
              {intl.$t({ defaultMessage: 'View schedule' })}
            </UI.TextButton></div>
        }
        return <Tooltip
          title={getSwitchNextScheduleTplTooltip(row) ||
            intl.$t({ defaultMessage: 'Not scheduled' })}
          placement='bottom' >
          <UI.WithTooltip>{getNextScheduleTpl(intl, row)}</UI.WithTooltip>
        </Tooltip >
      }
    }
  ]

  const hasAvailableSwitchFirmware = function () {
    let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
    return filterVersions?.length > 0
  }

  const rowActions: TableProps<FirmwareSwitchVenue>['rowActions'] = [{
    label: $t({ defaultMessage: 'Update Now' }),
    scopeKey: [SwitchScopes.UPDATE],
    visible: hasAvailableSwitchFirmware(),
    disabled: !hasAvailableSwitchFirmware(),
    onClick: (selectedRows) => {
      setSelectedVenueList(selectedRows)
      setWizardType(SwitchFirmwareWizardType.update)
      setUpdateNowWizardVisible(true)
    }
  },
  {
    label: $t({ defaultMessage: 'Change Update Schedule' }),
    scopeKey: [SwitchScopes.UPDATE],
    visible: hasAvailableSwitchFirmware(),
    disabled: !hasAvailableSwitchFirmware(),
    onClick: (selectedRows) => {
      setSelectedVenueList(selectedRows)
      setWizardType(SwitchFirmwareWizardType.schedule)
      setUpdateNowWizardVisible(true)
    }
  },
  {
    label: $t({ defaultMessage: 'Skip Update' }),
    scopeKey: [SwitchScopes.UPDATE],
    disabled: (selectedRows) => {
      let disabledUpdate = false
      selectedRows.forEach((row) => {
        const hasSchedule = row.nextSchedule || row.scheduleCount > 0
        if (!hasSchedule) {
          disabledUpdate = true
        }
      })
      return disabledUpdate
    },
    onClick: (selectedRows) => {
      setSelectedVenueList(selectedRows)
      setUpdateNowWizardVisible(true)
      setWizardType(SwitchFirmwareWizardType.skip)
    }
  }]

  const isSelectionVisible = hasPermission({
    scopes: [SwitchScopes.UPDATE]
  })

  const isPreferencesVisible = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(FirmwareUrlsInfo.updateSwitchUpgradePreferences)])
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  return (
    <Loader states={[tableQuery,
      { isLoading: false }
    ]}>
      <Table
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={isSelectionVisible && { type: 'checkbox', selectedRowKeys }}
        actions={isPreferencesVisible ? [{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setModelVisible(true)
        }] : []}
        style={{ marginTop: isPreferencesVisible ? '' : '25px' }}
      />

      <SwitchUpgradeWizard
        wizardType={wizardType}
        visible={updateNowWizardVisible}
        data={selectedVenueList as FirmwareSwitchVenue[]}
        setVisible={setUpdateNowWizardVisible}
        onSubmit={() => { }} />

      <PreferencesDialog
        visible={modelVisible}
        data={preferences}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        isSwitch={true}
        preDownload={preDownload?.preDownload}
      />

      <VenueStatusDrawer
        visible={updateStatusDrawerVisible}
        setVisible={setUpdateStatusDrawerVisible}
        data={clickedRowData} />
      <SwitchScheduleDrawer
        visible={switchScheduleDrawerVisible}
        setVisible={setSwitchScheduleDrawerVisible}
        data={clickedRowData} />
    </Loader>
  )
}

export function VenueFirmwareList () {
  const venuePayload = useDefaultVenuePayload()
  const { parseSwitchVersion } = useSwitchFirmwareUtils()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)

  const tableQuery = usePollingTableQuery<FirmwareSwitchVenue>({
    useQuery: useGetSwitchVenueVersionListQuery,
    defaultPayload: venuePayload,
    search: {
      searchTargetFields: venuePayload.searchTargetFields as string[]
    },
    enableRbac: isSwitchRbacEnabled
  })

  const { versionFilterOptions } = useGetSwitchCurrentVersionsQuery({
    params: useParams(),
    enableRbac: isSwitchRbacEnabled
  }, {
    selectFromResult ({ data }) {
      let versionList = data?.currentVersions
      if (data?.currentVersionsAboveTen && versionList) {
        versionList = versionList.concat(data?.currentVersionsAboveTen)
      }

      return {
        // eslint-disable-next-line max-len
        versionFilterOptions: versionList?.map(v => ({ key: v, value: parseSwitchVersion(v) })) || true
      }
    }
  })

  const typeFilterOptions = [{ key: 'Release', value: 'Release' }, { key: 'Beta', value: 'Beta' }]

  return (
    <VenueFirmwareTable tableQuery={tableQuery}
      searchable={true}
      filterables={{
        version: versionFilterOptions,
        type: typeFilterOptions
      }}
    />
  )
}

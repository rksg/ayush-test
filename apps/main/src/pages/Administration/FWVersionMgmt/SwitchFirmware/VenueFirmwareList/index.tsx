import React, { useState } from 'react'

import { Form, Tooltip, Typography } from 'antd'
import * as _            from 'lodash'
import { useIntl }       from 'react-intl'

import {
  ColumnType,
  Table,
  TableProps,
  Loader,
  Button
} from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  useGetSwitchUpgradePreferencesQuery,
  useUpdateSwitchUpgradePreferencesMutation,
  useGetSwitchVenueVersionListQuery,
  useGetSwitchAvailableFirmwareListQuery,
  useGetSwitchCurrentVersionsQuery,
  useSkipSwitchUpgradeSchedulesMutation,
  useUpdateSwitchVenueSchedulesMutation,
  useGetSwitchFirmwarePredownloadQuery,
  useGetSwitchLatestFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  UpgradePreferences,
  FirmwareSwitchVenue,
  FirmwareVersion,
  TableQuery,
  useTableQuery,
  sortProp,
  defaultSort,
  FirmwareCategory,
  SwitchFirmwareStatusType
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { RequestPayload } from '@acx-ui/types'

import {
  getNextScheduleTpl,
  getReleaseFirmware,
  getSwitchNextScheduleTplTooltip,
  isSwitchNextScheduleTooltipDisabled,
  parseSwitchVersion,
  toUserDate
} from '../../FirmwareUtils'
import { PreferencesDialog } from '../../PreferencesDialog'
import * as UI               from '../../styledComponents'

import { ScheduleUpdatesWizard } from './ScheduleUpdatesWizard'
import { SkipUpdatesWizard }     from './SkipUpdatesWizard'
import { UpdateNowWizard }       from './UpdateNowWizard'
import { UpdateStatusDrawer }    from './UpdateStatusDrawer'

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
  { tableQuery, searchable, filterables }: VenueTableProps) => {
  const { $t } = useIntl()
  const intl = useIntl()
  const params = useParams()
  const { data: availableVersions } = useGetSwitchAvailableFirmwareListQuery({ params })
  const [skipSwitchUpgradeSchedules] = useSkipSwitchUpgradeSchedulesMutation()
  const [updateVenueSchedules] = useUpdateSwitchVenueSchedulesMutation()
  const [modelVisible, setModelVisible] = useState(false)
  const [updateNowWizardVisible, setUpdateNowWizardVisible] = useState(false)
  const [scheduleWizardVisible, setScheduleWizardVisible] = useState(false)
  const [skipWizardVisible, setSkipWizardVisible] = useState(false)
  const [updateStatusDrawerVisible, setUpdateStatusDrawerVisible] = useState(false)
  const [clickedUpdateStatusData, setClickedUpdateStatusData] =
    useState<FirmwareSwitchVenue>({} as FirmwareSwitchVenue)


  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [selectedVenueList, setSelectedVenueList] = useState<FirmwareSwitchVenue[]>([])

  const enableSwitchTwoVersionUpgrade = useIsSplitOn(Features.SUPPORT_SWITCH_TWO_VERSION_UPGRADE)

  const { data: preDownload } = useGetSwitchFirmwarePredownloadQuery({ params })

  const [updateUpgradePreferences] = useUpdateSwitchUpgradePreferencesMutation()
  const { data: preferencesData } = useGetSwitchUpgradePreferencesQuery({ params })


  const { data: latestReleaseVersions } = useGetSwitchLatestFirmwareListQuery({ params })

  const isLatestVersion = function (currentVersion: FirmwareVersion) {
    if(_.isEmpty(currentVersion?.id)) return false
    const latestVersions = getReleaseFirmware(latestReleaseVersions)
    const latestFirmware = latestVersions.filter(v => v.id.startsWith('090'))[0]
    const latestRodanFirmware = latestVersions.filter(v => v.id.startsWith('100'))[0]
    return (currentVersion.id === latestFirmware?.id ||
      currentVersion.id === latestRodanFirmware?.id)
  }


  const filterVersions = function (availableVersions: FirmwareVersion[]) {

    return availableVersions?.map((version) => {
      if (version?.category === FirmwareCategory.RECOMMENDED && !isLatestVersion(version)) {
        return {
          ...version,
          id: version?.id, name: version?.name, category: FirmwareCategory.REGULAR
        }
      } return version
    })
  }


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
      title: $t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        return row.name
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
        let versionList = []
        if (row.switchFirmwareVersion?.id) {
          versionList.push(parseSwitchVersion(row.switchFirmwareVersion.id))
        }
        if (row.switchFirmwareVersionAboveTen?.id) {
          versionList.push(parseSwitchVersion(row.switchFirmwareVersionAboveTen.id))
        }
        return versionList.length > 0 ? versionList.join(', ') : '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Available Firmware' }),
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
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      render: function (__, row) {

        const switchFirmwareStatusTextMapping: { [key in SwitchFirmwareStatusType]: string } = {
          [SwitchFirmwareStatusType.NONE]: '--',
          [SwitchFirmwareStatusType.INITIATE]:
            $t({ defaultMessage: 'Firmware update initiated.' }),
          [SwitchFirmwareStatusType.SUCCESS]:
            $t({ defaultMessage: 'Update successful.' }),
          [SwitchFirmwareStatusType.FAILED]:
            $t({ defaultMessage: 'Update failed.' })
        }

        if (_.isEmpty(row.status) || row.status === SwitchFirmwareStatusType.NONE
          || _.isEmpty(switchFirmwareStatusTextMapping[row.status])) {
          return '--'
        }

        return <div>
          <Typography.Text
            style={{ lineHeight: '24px' }}>
            {switchFirmwareStatusTextMapping[row.status]}
          </Typography.Text>
          <Button
            size='small'
            ghost={true}
            style={{
              color: '#5496EA',
              padding: '0',
              marginLeft: '5px',
              marginBottom: '2px'
            }}
            onClick={() => {
              setClickedUpdateStatusData(row)
              setUpdateStatusDrawerVisible(true)
            }}>
            Check Status
          </Button></div>
      }
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'lastUpdate',
      dataIndex: 'lastUpdate',
      sorter: { compare: sortProp('lastScheduleUpdateTime', defaultSort) },
      render: function (_, row) {
        return row.lastScheduleUpdateTime ? toUserDate(row.lastScheduleUpdateTime) : '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Scheduling' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      sorter: { compare: sortProp('nextSchedule.timeSlot.startDateTime', defaultSort) },
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

  const hasAvailableSwitchFirmware = function (selectedRows: FirmwareSwitchVenue[]) {
    let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
    selectedRows.forEach((row: FirmwareSwitchVenue) => {
      const version = row.switchFirmwareVersion?.id
      const rodanVersion = row.switchFirmwareVersionAboveTen?.id
      // eslint-disable-next-line max-len
      removeCurrentVersionsAnd10010IfNeeded(version, rodanVersion, filterVersions)
    })
    return filterVersions?.length > 0
  }

  const rowActions: TableProps<FirmwareSwitchVenue>['rowActions'] = [{
    visible: (selectedRows) => {
      let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
      if (!filterVersions || filterVersions.length === 0) {
        return false
      }
      return selectedRows.every((row: FirmwareSwitchVenue) => {
        const version = row.switchFirmwareVersion?.id
        if (!version) {
          return (row.availableVersions && row.availableVersions.length > 0)
        }
        _.remove(filterVersions, (v: FirmwareVersion) => v.id === version)
        return filterVersions.length > 0
      })
    },
    label: $t({ defaultMessage: 'Update Now' }),
    disabled: (selectedRows) => {
      return !hasAvailableSwitchFirmware(selectedRows)
    },
    onClick: (selectedRows) => {
      setSelectedVenueList(selectedRows)
      let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
      let nonIcx8200Count = 0, icx8200Count = 0
      selectedRows.forEach((row: FirmwareSwitchVenue) => {
        const version = row.switchFirmwareVersion?.id
        const rodanVersion = row.switchFirmwareVersionAboveTen?.id
        filterVersions = checkCurrentVersions(version, rodanVersion, filterVersions)
        if (enableSwitchTwoVersionUpgrade) {
          nonIcx8200Count = nonIcx8200Count + (row.switchCount ? row.switchCount : 0)
          icx8200Count = icx8200Count + (row.aboveTenSwitchCount ? row.aboveTenSwitchCount : 0)
        }
      })

      setUpdateNowWizardVisible(true)
    }
  },
  {
    visible: (selectedRows) => {
      let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
      if (!filterVersions || filterVersions.length === 0) {
        return false
      }
      return selectedRows.every((row: FirmwareSwitchVenue) => {
        const version = row.switchFirmwareVersion?.id
        if (!version) {
          return (row.availableVersions && row.availableVersions.length > 0)
        }
        _.remove(filterVersions, (v: FirmwareVersion) => v.id === version)
        return filterVersions.length > 0
      })
    },
    label: $t({ defaultMessage: 'Change Update Schedule' }),
    // disabled: (selectedRows) => {
    //   return !hasAvailableSwitchFirmware(selectedRows)
    // },
    // tooltip: (selectedRows) => {
    //   return hasAvailableSwitchFirmware(selectedRows) ?
    //     '' : $t({ defaultMessage: 'No available versions' })
    // },
    onClick: (selectedRows) => {
      setSelectedVenueList(selectedRows)
      let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
      let nonIcx8200Count = 0, icx8200Count = 0

      let currentSchedule = enableSwitchTwoVersionUpgrade && selectedRows.length === 1
        ? (selectedRows[0].nextSchedule || undefined)
        : undefined

      selectedRows.forEach((row: FirmwareSwitchVenue) => {
        const version = row.switchFirmwareVersion?.id
        const rodanVersion = row.switchFirmwareVersionAboveTen?.id
        filterVersions = checkCurrentVersions(version, rodanVersion, filterVersions)

        if (enableSwitchTwoVersionUpgrade) {
          nonIcx8200Count = nonIcx8200Count + (row.switchCount ? row.switchCount : 0)
          icx8200Count = icx8200Count + (row.aboveTenSwitchCount ? row.aboveTenSwitchCount : 0)
        }
      })
      setScheduleWizardVisible(true)
    }
  },
  {
    disabled: (selectedRows) => {
      let skipUpdateEnabled = true
      selectedRows.forEach((row) => {
        if (!hasSchedule(row)) {
          skipUpdateEnabled = false
        }
      })
      return false// !skipUpdateEnabled
    },
    label: $t({ defaultMessage: 'Skip Update' }),
    onClick: (selectedRows, clearSelection) => {
      setSelectedVenueList(selectedRows)
      setSkipWizardVisible(true)
      // showActionModal({
      //   type: 'confirm',
      //   width: 460,
      //   title: $t({ defaultMessage: 'Skip This Update?' }),
      //   // eslint-disable-next-line max-len
      //   content: $t({ defaultMessage: 'Please confirm that you wish to exclude the selected venues from this scheduled update' }),
      //   okText: $t({ defaultMessage: 'Skip' }),
      //   cancelText: $t({ defaultMessage: 'Cancel' }),
      //   onOk () {
      //     skipSwitchUpgradeSchedules({
      //       params: { ...params },
      //       payload: selectedRows.map((row) => row.id)
      //     }).then(clearSelection)
      //   },
      //   onCancel () {}
      // })
    }
  }]

  return (
    <Loader states={[
      tableQuery,
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
        rowActions={rowActions}
        rowSelection={{ type: 'checkbox', selectedRowKeys }}
        actions={[{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setModelVisible(true)
        }]}
      />

      <UpdateNowWizard
        visible={updateNowWizardVisible}
        data={selectedVenueList as FirmwareSwitchVenue[]}
        onCancel={() => { setUpdateNowWizardVisible(false) }}
        onSubmit={() => { }}/>
      <ScheduleUpdatesWizard
        visible={scheduleWizardVisible}
        data={selectedVenueList as FirmwareSwitchVenue[]}
        onCancel={() => { setScheduleWizardVisible(false) }}
        onSubmit={() => { }} />

      <SkipUpdatesWizard
        visible={skipWizardVisible}
        data={selectedVenueList as FirmwareSwitchVenue[]}
        onCancel={() => { setSkipWizardVisible(false) }}
        onSubmit={() => { }} />

      <PreferencesDialog
        visible={modelVisible}
        data={preferences}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
        isSwitch={true}
        preDownload={preDownload?.preDownload}
      />
      <UpdateStatusDrawer
        visible={updateStatusDrawerVisible}
        setVisible={setUpdateStatusDrawerVisible}
        data={clickedUpdateStatusData} />
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
    <VenueFirmwareTable tableQuery={tableQuery}
      searchable={true}
      filterables={{
        version: versionFilterOptions,
        type: typeFilterOptions
      }}
    />
  )
}

function hasSchedule (venue: FirmwareSwitchVenue): boolean {
  return !!venue.nextSchedule
}

const removeCurrentVersionsAnd10010IfNeeded = (version: string,
  rodanVersion: string,
  filterVersions: FirmwareVersion[]) => {
  _.remove(filterVersions, (v: FirmwareVersion) => {
    return v.id === version || v.id === rodanVersion
  })
}

function checkCurrentVersions (version: string,
  rodanVersion: string,
  filterVersions: FirmwareVersion[]): FirmwareVersion[] {
  let inUseVersions = [] as FirmwareVersion[]
  filterVersions.forEach((v: FirmwareVersion) => {
    if (v.id === version || v.id === rodanVersion) {
      v = { ...v, inUse: true }
    }
    inUseVersions.push(v)
  })
  return inUseVersions
}


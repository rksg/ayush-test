/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react'

import { Tooltip, Typography } from 'antd'
import * as _                  from 'lodash'
import { useIntl }             from 'react-intl'

import {
  ColumnType,
  Table,
  TableProps,
  Loader,
  Button
} from '@acx-ui/components'
import {
  useGetSwitchUpgradePreferencesQuery,
  useUpdateSwitchUpgradePreferencesMutation,
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
  useTableQuery,
  sortProp,
  defaultSort,
  SwitchFirmwareStatusType
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { RequestPayload } from '@acx-ui/types'
import { noDataDisplay }  from '@acx-ui/utils'

import {
  getNextScheduleTpl,
  getSwitchNextScheduleTplTooltip,
  parseSwitchVersion,
  toUserDate
} from '../../FirmwareUtils'
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
  const { data: availableVersions } = useGetSwitchAvailableFirmwareListQuery({ params })
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

  const { data: preDownload } = useGetSwitchFirmwarePredownloadQuery({ params })

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
        if (!Array.isArray(availableVersions) || availableVersions.length === 0) {
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
          <UI.TextButton
            size='small'
            ghost={true}
            onClick={() => {
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
              onClick={() => {
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

  const hasAvailableSwitchFirmware = function (selectedRows: FirmwareSwitchVenue[]) {
    let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
    selectedRows.forEach((row: FirmwareSwitchVenue) => {
      const version = row.switchFirmwareVersion?.id
      const rodanVersion = row.switchFirmwareVersionAboveTen?.id
      removeCurrentVersionsAnd10010IfNeeded(version, rodanVersion, filterVersions)
    })
    return filterVersions?.length > 0
  }

  const rowActions: TableProps<FirmwareSwitchVenue>['rowActions'] = [{
    label: $t({ defaultMessage: 'Update Now' }),
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
    disabled: (selectedRows) => {
      return !hasAvailableSwitchFirmware(selectedRows)
    },
    onClick: (selectedRows) => {
      setSelectedVenueList(selectedRows)
      setWizardType(SwitchFirmwareWizardType.update)
      setUpdateNowWizardVisible(true)
    }
  },
  {
    label: $t({ defaultMessage: 'Change Update Schedule' }),
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
    onClick: (selectedRows) => {
      setSelectedVenueList(selectedRows)
      setWizardType(SwitchFirmwareWizardType.schedule)
      setUpdateNowWizardVisible(true)
    }
  },
  {
    label: $t({ defaultMessage: 'Skip Update' }),
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

const removeCurrentVersionsAnd10010IfNeeded = (version: string,
  rodanVersion: string,
  filterVersions: FirmwareVersion[]) => {
  _.remove(filterVersions, (v: FirmwareVersion) => {
    return v.id === version || v.id === rodanVersion
  })
}

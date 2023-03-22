import React, { useState } from 'react'

import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import {
  showActionModal,
  ColumnType,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetUpgradePreferencesQuery,
  useUpdateUpgradePreferencesMutation,
  useGetVenueVersionListQuery,
  useGetAvailableFirmwareListQuery,
  useGetFirmwareVersionIdListQuery,
  useSkipVenueUpgradeSchedulesMutation,
  useUpdateVenueSchedulesMutation,
  useUpdateNowMutation
} from '@acx-ui/rc/services'
import {
  Schedule,
  UpgradePreferences,
  FirmwareCategory,
  FirmwareType,
  FirmwareVenue,
  FirmwareVersion,
  UpdateNowRequest,
  UpdateScheduleRequest,
  TableQuery,
  RequestPayload,
  firmwareTypeTrans,
  useTableQuery,
  sortProp,
  defaultSort
} from '@acx-ui/rc/utils'
import { useParams }      from '@acx-ui/react-router-dom'
import { filterByAccess } from '@acx-ui/user'

import {
  compareVersions,
  getApVersion,
  getApNextScheduleTpl,
  getNextScheduleTplTooltip,
  isNextScheduleTooltipDisabled,
  toUserDate
} from '../../FirmwareUtils'
import { PreferencesDialog } from '../../PreferencesDialog'
import * as UI               from '../../styledComponents'

import { ChangeScheduleDialog } from './ChangeScheduleDialog'
import { RevertDialog }         from './RevertDialog'
import { UpdateNowDialog }      from './UpdateNowDialog'

type TablePaginationPosition =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight'

const transform = firmwareTypeTrans()

function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const intl = useIntl()
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)

  const columns: TableProps<FirmwareVenue>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Venue Name' }),
      key: 'name',
      dataIndex: 'name',
      // sorter: true,
      sorter: { compare: sortProp('name', defaultSort) },
      searchable: searchable,
      // defaultSortOrder: 'ascend',
      render: function (data, row) {
        return row.name
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Current AP Firmware' }),
      key: 'version',
      dataIndex: 'version',
      // sorter: true,
      sorter: { compare: sortProp('versions[0].version', defaultSort) },
      filterable: filterables ? filterables['version'] : false,
      filterMultiple: false,
      render: function (data, row) {
        return row.versions ? row.versions[0].version : '--'
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Firmware Type' }),
      key: 'type',
      dataIndex: 'type',
      // sorter: true,
      sorter: { compare: sortProp('versions[0].category', defaultSort) },
      filterable: filterables ? filterables['type'] : false,
      filterMultiple: false,
      render: function (data, row) {
        if (!row.versions) return '--'
        const text = transform(row.versions[0].category as FirmwareCategory, 'type')
        const subText = transform(row.versions[0].category as FirmwareCategory, 'subType')
        if (!subText) return text
        return `${text} (${subText})`
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Last Update' }),
      key: 'lastUpdate',
      dataIndex: 'lastUpdate',
      sorter: false,
      render: function (data, row) {
        if (!row.lastScheduleUpdate) return '--'
        return toUserDate(row.lastScheduleUpdate)
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      sorter: false,
      render: function (data, row) {
        return (!isNextScheduleTooltipDisabled(row)
          ? getApNextScheduleTpl(intl, row)
          // eslint-disable-next-line max-len
          : <Tooltip title={<UI.ScheduleTooltipText>{getNextScheduleTplTooltip(row)}</UI.ScheduleTooltipText>} placement='bottom'>
            <UI.ScheduleText>{getApNextScheduleTpl(intl, row)}</UI.ScheduleText>
          </Tooltip>
        )
      }
    }
  ]

  return columns.filter(({ key }) =>
    (key !== 'edges' || (key === 'edges' && isEdgeEnabled)))
}

export const useDefaultVenuePayload = (): RequestPayload => {
  return {}
}

type VenueTableProps = {
  tableQuery: TableQuery<FirmwareVenue, RequestPayload<unknown>, unknown>,
  rowSelection?: TableProps<FirmwareVenue>['rowSelection'],
  searchable?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}

export const VenueFirmwareTable = (
  { tableQuery, rowSelection, searchable, filterables }: VenueTableProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: availableVersions } = useGetAvailableFirmwareListQuery({ params })
  const [skipVenueUpgradeSchedules] = useSkipVenueUpgradeSchedulesMutation()
  const [updateVenueSchedules] = useUpdateVenueSchedulesMutation()
  const [updateNow] = useUpdateNowMutation()
  const [modelVisible, setModelVisible] = useState(false)
  const [updateModelVisible, setUpdateModelVisible] = useState(false)
  const [changeScheduleModelVisible, setChangeScheduleModelVisible] = useState(false)
  const [revertModelVisible, setRevertModelVisible] = useState(false)
  const [venues, setVenues] = useState<FirmwareVenue[]>([])
  const [upgradeVersions, setUpgradeVersions] = useState<FirmwareVersion[]>([])
  const [eol, setEol] = useState(false)
  const [eolName, setEolName] = useState('')
  const [latestEolVersion, setLatestEolVersion] = useState('')
  const [eolModels, setEolModels] = useState<string[]>([])
  const [changeUpgradeVersions, setChangeUpgradeVersions] = useState<FirmwareVersion[]>([])
  const [revertVersions, setRevertVersions] = useState<FirmwareVersion[]>([])
  const pageBotton: TablePaginationPosition | 'none' = 'none'

  const [updateUpgradePreferences] = useUpdateUpgradePreferencesMutation()
  const { data: preferencesData } = useGetUpgradePreferencesQuery({ params })
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

  const handleUpdateModalCancel = () => {
    setUpdateModelVisible(false)
  }

  const handleUpdateModalSubmit = async (data: UpdateNowRequest[]) => {
    try {
      updateNow({
        params: { ...params },
        payload: data
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleChangeScheduleModalCancel = () => {
    setChangeScheduleModelVisible(false)
  }
  const handleChangeScheduleModalSubmit = (data: UpdateScheduleRequest) => {
    try {
      updateVenueSchedules({
        params: { ...params },
        payload: data
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleRevertModalCancel = () => {
    setRevertModelVisible(false)
  }

  const handleRevertModalSubmit = (data: UpdateNowRequest[]) => {
    try {
      updateNow({
        params: { ...params },
        payload: data
      }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const tableData = tableQuery.data as readonly FirmwareVenue[] | undefined
  const columns = useColumns(searchable, filterables)

  const rowActions: TableProps<FirmwareVenue>['rowActions'] = [{
    visible: (selectedRows) => {
      let eolAp = false
      let allEolFwlatest = true
      for (let v of venues) {
        if (v['eolApFirmwares']) {
          eolAp = true
          if (allEolFwlatest) {
            // eslint-disable-next-line max-len
            allEolFwlatest = compareVersions(v['eolApFirmwares'][0].latestEolVersion, v['eolApFirmwares'][0].currentEolVersion) === 0 ? true : false
          }
        }
      }

      let filterVersions: FirmwareVersion[] = []
      if (selectedRows.length === 1) {
        const version = getApVersion(selectedRows[0])
        if (!version) {
          return false
        }
        if (availableVersions) {
          for (let i = 0; i < availableVersions.length; i++) {
            if (compareVersions(availableVersions[i].id, version) > 0) {
              filterVersions.push(availableVersions[i])
            }
          }
        }
        return filterVersions.length > 0 || (eolAp && !allEolFwlatest)
      }

      let minVersion = ''
      let isSameVersion = true
      const ok = selectedRows.every((row: FirmwareVenue) => {
        const version = getApVersion(row)
        if (!version) {
          return false
        }
        if (minVersion && compareVersions(version, minVersion) !== 0) {
          isSameVersion = false
        }

        if (!minVersion || compareVersions(version, minVersion) > 0) {
          minVersion = version
        }
        return true
      })
      if (!ok) return false
      if (availableVersions) {
        for (let i = 0; i < availableVersions.length; i++) {
          // eslint-disable-next-line max-len
          if (compareVersions(availableVersions[i].id, minVersion) > 0 || (compareVersions(availableVersions[i].id, minVersion) === 0 && !isSameVersion)) {
            filterVersions.push(availableVersions[i])
          }
        }
      }
      return filterVersions.length > 0 || (eolAp && !allEolFwlatest)
    },
    label: $t({ defaultMessage: 'Update Now' }),
    onClick: (selectedRows) => {
      setVenues(selectedRows)
      let eolAp = false
      let eolName = ''
      let latestEolVersion = ''
      let eolModels: string[] = []
      for (let v of venues) {
        if (v['eolApFirmwares']) {
          eolAp = true
          eolName = v['eolApFirmwares'][0].name
          latestEolVersion = v['eolApFirmwares'][0].latestEolVersion
          eolModels = [...new Set([...eolModels, ...v['eolApFirmwares'][0].apModels])]
        }
      }
      setEol(eolAp)
      setEolName(eolName)
      setLatestEolVersion(latestEolVersion)
      setEolModels(eolModels)

      let filterVersions: FirmwareVersion[] = []
      if (selectedRows.length === 1) {
        const version = getApVersion(selectedRows[0])
        if (availableVersions) {
          for (let i = 0; i < availableVersions.length; i++) {
            if (compareVersions(availableVersions[i].id, version as string) > 0) {
              filterVersions.push(availableVersions[i])
            }
          }
        }
      } else {
        let minVersion = ''
        let isSameVersion = true
        selectedRows.forEach((row: FirmwareVenue) => {
          const version = getApVersion(row)
          if (minVersion && compareVersions(version as string, minVersion) !== 0) {
            isSameVersion = false
          }
          if (!minVersion || compareVersions(version as string, minVersion) > 0) {
            minVersion = version as string
          }
        })
        if (availableVersions) {
          for (let i = 0; i < availableVersions.length; i++) {
            // eslint-disable-next-line max-len
            if (compareVersions(availableVersions[i].id, minVersion) > 0 || (compareVersions(availableVersions[i].id, minVersion) === 0 && !isSameVersion)) {
              filterVersions.push(availableVersions[i])
            }
          }
        }
      }
      setUpgradeVersions(filterVersions)
      setUpdateModelVisible(true)
    }
  },
  {
    visible: (selectedRows) => {
      if (!availableVersions || availableVersions.length === 0) {
        return false
      }
      let filterVersions: FirmwareVersion[] = []
      if (selectedRows.length === 1) {
        const version = getApVersion(selectedRows[0])
        if (!version) {
          return false
        }
        for (let i = 0; i < availableVersions.length; i++) {
          if (compareVersions(availableVersions[i].id, version) > 0) {
            filterVersions.push(availableVersions[i])
          }
        }
        return filterVersions.length > 0
      }

      let minVersion = ''
      let isSameVersion = true
      const ok = selectedRows.every((row: FirmwareVenue) => {
        const version = getApVersion(row)
        if (!version) {
          return false
        }
        if (minVersion && compareVersions(version, minVersion) !== 0) {
          isSameVersion = false
        }

        if (!minVersion || compareVersions(version, minVersion) > 0) {
          minVersion = version
        }
        return true
      })
      if (!ok) return false
      for (let i = 0; i < availableVersions.length; i++) {
        // eslint-disable-next-line max-len
        if (compareVersions(availableVersions[i].id, minVersion) > 0 || (compareVersions(availableVersions[i].id, minVersion) === 0 && !isSameVersion)) {
          filterVersions.push(availableVersions[i])
        }
      }
      return filterVersions.length > 0
    },
    label: $t({ defaultMessage: 'Change Update Schedule' }),
    onClick: (selectedRows) => {
      setVenues(selectedRows)
      let filterVersions: FirmwareVersion[] = []
      if (selectedRows.length === 1) {
        const version = getApVersion(selectedRows[0])
        if (availableVersions) {
          for (let i = 0; i < availableVersions.length; i++) {
            if (compareVersions(availableVersions[i].id, version as string) > 0) {
              filterVersions.push(availableVersions[i])
            }
          }
        }
      } else {
        let minVersion = ''
        let isSameVersion = true
        selectedRows.forEach((row: FirmwareVenue) => {
          const version = getApVersion(row)
          if (minVersion && compareVersions(version as string, minVersion) !== 0) {
            isSameVersion = false
          }
          if (!minVersion || compareVersions(version as string, minVersion) > 0) {
            minVersion = version as string
          }
        })
        if (availableVersions) {
          for (let i = 0; i < availableVersions.length; i++) {
            // eslint-disable-next-line max-len
            if (compareVersions(availableVersions[i].id, minVersion) > 0 || (compareVersions(availableVersions[i].id, minVersion) === 0 && !isSameVersion)) {
              filterVersions.push(availableVersions[i])
            }
          }
        }
      }
      setChangeUpgradeVersions(filterVersions)
      setChangeScheduleModelVisible(true)
    }
  },
  {
    visible: (selectedRows) => {
      let skipUpdateVisilibity = true
      selectedRows.forEach((row) => {
        if (!hasApSchedule(row)) {
          skipUpdateVisilibity = false
        }
      })
      return skipUpdateVisilibity
    },
    label: $t({ defaultMessage: 'Skip Update' }),
    onClick: (selectedRows, clearSelection) => {
      showActionModal({
        type: 'confirm',
        width: 460,
        title: $t({ defaultMessage: 'Skip This Update?' }),
        // eslint-disable-next-line max-len
        content: $t({ defaultMessage: 'Please confirm that you wish to exclude the selected venues from this scheduled update' }),
        okText: $t({ defaultMessage: 'Skip' }),
        cancelText: $t({ defaultMessage: 'Cancel' }),
        onOk () {
          skipVenueUpgradeSchedules({
            params: { ...params },
            payload: { venueIds: selectedRows.map((row) => row.id) }
          }).then(clearSelection)
        },
        onCancel () {}
      })
    }
  },
  {
    visible: (selectedRows) => {
      let filterVersions: FirmwareVersion[] = []
      if (selectedRows.length > 1) {
        return false
      }
      if (!availableVersions || availableVersions.length === 0) {
        return false
      }

      return selectedRows.every((row: FirmwareVenue) => {
        const version = getApVersion(row)
        if (!version) {
          return false
        }

        for (let i = 0; i < availableVersions.length; i++) {
          if (compareVersions(availableVersions[i].id, version) < 0) {
            filterVersions.push(availableVersions[i])
          }
        }
        return filterVersions.length > 0
      })
    },
    label: $t({ defaultMessage: 'Revert Now' }),
    onClick: (selectedRows) => {
      setVenues(selectedRows)
      let filterVersions: FirmwareVersion[] = []
      selectedRows.forEach((row: FirmwareVenue) => {
        const version = getApVersion(row)
        if (availableVersions) {
          for (let i = 0; i < availableVersions.length; i++) {
            if (compareVersions(availableVersions[i].id, version as string) < 0) {
              filterVersions.push(availableVersions[i])
            }
          }
        }
      })
      setRevertVersions(filterVersions)
      setRevertModelVisible(true)
    }
  }]


  return (
    <Loader states={[
      tableQuery,
      { isLoading: false }
    ]}>
      <Table
        columns={columns}
        columnState={{ hidden: true }}
        dataSource={tableData}
        // eslint-disable-next-line max-len
        pagination={{ pageSize: 10000, position: [pageBotton as TablePaginationPosition , pageBotton as TablePaginationPosition] }}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={rowSelection}
        actions={filterByAccess([{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setModelVisible(true)
        }])}
      />
      <UpdateNowDialog
        visible={updateModelVisible}
        data={venues}
        availableVersions={upgradeVersions}
        eol={eol}
        eolName={eolName}
        latestEolVersion={latestEolVersion}
        eolModels={eolModels}
        onCancel={handleUpdateModalCancel}
        onSubmit={handleUpdateModalSubmit}
      />
      <ChangeScheduleDialog
        visible={changeScheduleModelVisible}
        data={venues}
        availableVersions={changeUpgradeVersions}
        onCancel={handleChangeScheduleModalCancel}
        onSubmit={handleChangeScheduleModalSubmit}
      />
      <RevertDialog
        visible={revertModelVisible}
        data={venues}
        availableVersions={revertVersions}
        onCancel={handleRevertModalCancel}
        onSubmit={handleRevertModalSubmit}
      />
      <PreferencesDialog
        visible={modelVisible}
        data={preferences}
        onCancel={handleModalCancel}
        onSubmit={handleModalSubmit}
      />
    </Loader>
  )
}

export function VenueFirmwareList () {
  const venuePayload = useDefaultVenuePayload()

  const tableQuery = useTableQuery<FirmwareVenue>({
    useQuery: useGetVenueVersionListQuery,
    defaultPayload: venuePayload,
    search: {
      searchTargetFields: venuePayload.searchTargetFields as string[]
    }
  })

  const { versionFilterOptions } = useGetFirmwareVersionIdListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        // eslint-disable-next-line max-len
        versionFilterOptions: data?.map(v=>({ key: v, value: v })) || true
      }
    }
  })

  const typeFilterOptions = [{ key: 'Release', value: 'Release' }, { key: 'Beta', value: 'Beta' }]

  return (
    <VenueFirmwareTable tableQuery={tableQuery}
      rowSelection={{ type: 'checkbox' }}
      searchable={true}
      filterables={{
        version: versionFilterOptions,
        type: typeFilterOptions
      }}
    />
  )
}

// eslint-disable-next-line max-len
const scheduleTypeIsApFunc = (value: Schedule) => value && value.versionInfo && value.versionInfo.type && value.versionInfo.type === FirmwareType.AP_FIRMWARE_UPGRADE

function hasApSchedule (venue: FirmwareVenue): boolean {
  return venue.nextSchedules && venue.nextSchedules.filter(scheduleTypeIsApFunc).length > 0
}


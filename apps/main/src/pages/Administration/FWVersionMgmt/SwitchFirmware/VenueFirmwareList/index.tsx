import React, { useState } from 'react'

import * as _      from 'lodash'
import { useIntl } from 'react-intl'

import {
  showActionModal,
  showToast,
  ColumnType,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import {
  useGetUpgradePreferencesQuery,
  useUpdateUpgradePreferencesMutation,
  useGetSwitchVenueVersionListQuery,
  useGetSwitchAvailableFirmwareListQuery,
  useGetSwitchFirmwareVersionIdListQuery,
  useSkipSwitchUpgradeSchedulesMutation,
  useUpdateSwitchVenueSchedulesMutation
} from '@acx-ui/rc/services'
import {
  UpgradePreferences,
  FirmwareSwitchVenue,
  FirmwareVersion,
  UpdateScheduleRequest,
  TableQuery,
  RequestPayload,
  firmwareTypeTrans,
  useTableQuery
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import {
  getNextScheduleTpl,
  toUserDate
} from '../../FirmwareUtils'

import { ChangeScheduleDialog } from './ChangeScheduleDialog'
import { PreferencesDialog }    from './PreferencesDialog'
import { UpdateNowDialog }      from './UpdateNowDialog'

const transform = firmwareTypeTrans()

function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const { $t } = useIntl()

  const columns: TableProps<FirmwareSwitchVenue>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: true,
      searchable: searchable,
      defaultSortOrder: 'ascend',
      width: 120,
      render: function (data, row) {
        return row.name
      }
    },
    {
      title: $t({ defaultMessage: 'Current Firmware' }),
      key: 'switchFirmwareVersion.id',
      dataIndex: 'switchFirmwareVersion.id',
      sorter: true,
      filterable: filterables ? filterables['version'] : false,
      width: 120,
      render: function (data, row) {
        return row.switchFirmwareVersion?.id ?? '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Firmware Type' }),
      key: 'switchFirmwareVersion.category',
      dataIndex: 'switchFirmwareVersion.category',
      sorter: true,
      filterable: filterables ? filterables['type'] : false,
      width: 120,
      render: function (data, row) {
        return transform(row.switchFirmwareVersion?.category, 'type') ?? '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'lastUpdate',
      dataIndex: 'lastUpdate',
      sorter: true,
      width: 120,
      render: function (data, row) {
        return row.lastScheduleUpdateTime ? toUserDate(row.lastScheduleUpdateTime) : '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      sorter: true,
      width: 120,
      render: function (data, row) {
        return getNextScheduleTpl(row)
      }
    }
  ]

  return columns
}

export const useDefaultVenuePayload = (): RequestPayload => {
  return {
    // fields: [
    //   'check-all',
    //   'name',
    //   'description',
    //   'city',
    //   'country',
    //   'networks',
    //   'aggregatedApStatus',
    //   'switches',
    //   'switchClients',
    //   'clients',
    //   'cog',
    //   'latitude',
    //   'longitude',
    //   'status',
    //   'id'
    // ],
    // searchTargetFields: ['name', 'description'],
    // filters: {},
    // sortField: 'name',
    // sortOrder: 'ASC'
    firmwareType: '',
    firmwareVersion: '',
    search: '',
    updateAvailable: ''
  }
}

type VenueTableProps = {
  tableQuery: TableQuery<FirmwareSwitchVenue, RequestPayload<unknown>, unknown>,
  rowSelection?: TableProps<FirmwareSwitchVenue>['rowSelection'],
  searchable?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}

export const VenueFirmwareTable = (
  { tableQuery, rowSelection, searchable, filterables }: VenueTableProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { data: availableVersions } = useGetSwitchAvailableFirmwareListQuery({ params })
  const [skipSwitchUpgradeSchedules] = useSkipSwitchUpgradeSchedulesMutation()
  const [updateVenueSchedules] = useUpdateSwitchVenueSchedulesMutation()
  const [modelVisible, setModelVisible] = useState(false)
  const [updateModelVisible, setUpdateModelVisible] = useState(false)
  const [changeScheduleModelVisible, setChangeScheduleModelVisible] = useState(false)
  const [venues, setVenues] = useState<FirmwareSwitchVenue[]>([])
  const [upgradeVersions, setUpgradeVersions] = useState<FirmwareVersion[]>([])
  const [changeUpgradeVersions, setChangeUpgradeVersions] = useState<FirmwareVersion[]>([])

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
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const handleUpdateModalCancel = () => {
    setUpdateModelVisible(false)
  }

  const handleUpdateModalSubmit = async (data: UpdateScheduleRequest) => {
    try {
      updateVenueSchedules({
        params: { ...params },
        payload: data
      }).unwrap()
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
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
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  // eslint-disable-next-line max-len
  // const tableData = tableQuery?.data as readonly FirmwareSwitchVenue[] | undefined
  const columns = useColumns(searchable, filterables)

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
    onClick: (selectedRows) => {
      setVenues(selectedRows)
      let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
      selectedRows.forEach((row: FirmwareSwitchVenue) => {
        const version = row.switchFirmwareVersion?.id
        _.remove(filterVersions, (v: FirmwareVersion) => v.id === version)
      })
      setUpgradeVersions(filterVersions)
      setUpdateModelVisible(true)
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
    onClick: (selectedRows) => {
      setVenues(selectedRows)
      let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
      selectedRows.forEach((row: FirmwareSwitchVenue) => {
        const version = row.switchFirmwareVersion?.id
        _.remove(filterVersions, (v: FirmwareVersion) => v.id === version)
      })
      setChangeUpgradeVersions(filterVersions)
      setChangeScheduleModelVisible(true)
    }
  },
  {
    visible: (selectedRows) => {
      let skipUpdateVisilibity = true
      selectedRows.forEach((row) => {
        if (!hasSchedule(row)) {
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
          skipSwitchUpgradeSchedules({
            params: { ...params },
            payload: selectedRows.map((row) => row.id)
          }).then(clearSelection)
        },
        onCancel () {}
      })
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
        // dataSource={tableData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={rowActions}
        rowSelection={rowSelection}
        actions={[{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setModelVisible(true)
        }]}
      />
      <UpdateNowDialog
        visible={updateModelVisible}
        data={venues}
        availableVersions={upgradeVersions}
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

  const tableQuery = useTableQuery<FirmwareSwitchVenue>({
    useQuery: useGetSwitchVenueVersionListQuery,
    defaultPayload: venuePayload,
    search: {
      searchTargetFields: venuePayload.searchTargetFields as string[]
    }
  })

  const { versionFilterOptions } = useGetSwitchFirmwareVersionIdListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        // eslint-disable-next-line max-len
        versionFilterOptions: data?.map(v=>({ key: v.id, value: v.id })) || true
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

function hasSchedule (venue: FirmwareSwitchVenue): boolean {
  return !!venue.nextSchedule
}


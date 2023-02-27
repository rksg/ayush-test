import React, { useState } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useIntl }                   from 'react-intl'

import {
  showActionModal,
  CustomButtonProps,
  ColumnType,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useVenuesListQuery,
  useGetVenueVersionListQuery,
  useGetVenueVersionsQuery,
  useDeleteVenueMutation,
  useGetVenueCityListQuery,
  useGetAvailableFirmwareListQuery,
  useSkipVenueUpgradeSchedulesMutation,
  useUpdateNowMutation
} from '@acx-ui/rc/services'
import {
  Venue,
  Schedule,
  FirmwareType,
  FirmwareCategory,
  FirmwareVenue,
  FirmwareVersion,
  UpdateNowRequest,
  ApVenueStatusEnum,
  TableQuery,
  RequestPayload,
  useTableQuery
} from '@acx-ui/rc/utils'

import {
  compareVersions,
  getApVersion
} from '../../FirmwareUtils'

import { TenantLink, useNavigate, useParams } from '@acx-ui/react-router-dom'

import { ChangeScheduleDialog } from './ChangeScheduleDialog'
import { PreferencesDialog }    from './PreferencesDialog'
import { RevertDialog }         from './RevertDialog'
import { UpdateNowDialog }      from './UpdateNowDialog'

function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const { $t } = useIntl()
  const isEdgeEnabled = useIsSplitOn(Features.EDGES)

  const columns: TableProps<FirmwareVenue>['columns'] = [
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
      title: $t({ defaultMessage: 'Current AP Firmware' }),
      key: 'versions[0].version',
      dataIndex: 'versions[0].version',
      sorter: true,
      filterable: filterables ? filterables['version'] : false,
      width: 120,
      render: function (data, row) {
        return row.versions[0].version
      }
    },
    {
      title: $t({ defaultMessage: 'Firmware Type' }),
      key: 'versions[0].category',
      dataIndex: 'versions[0].category',
      sorter: true,
      filterable: filterables ? filterables['type'] : false,
      width: 120,
      render: function (data, row) {
        return row.versions[0].category
      }
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'lastUpdate',
      dataIndex: 'lastUpdate',
      sorter: true,
      width: 120,
      render: function (data, row) {
        return '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      sorter: true,
      width: 120,
      render: function (data, row) {
        return 'Not scheduled'
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
  // const navigate = useNavigate()
  // const { tenantId } = useParams()
  const { data: availableVersions } = useGetAvailableFirmwareListQuery({ params })
  const [skipVenueUpgradeSchedules] = useSkipVenueUpgradeSchedulesMutation()
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
  const [revertVersions, setRevertVersions] = useState<FirmwareVersion[]>([])
  // let venues: FirmwareVenue[] = []

  const handleModalCancel = () => {
    setModelVisible(false)
  }
  const handleModalSubmit = (data: []) => {
    // set preferences
  }

  const handleUpdateModalCancel = () => {
    setUpdateModelVisible(false)
  }

  const handleUpdateModalSubmit = (data: UpdateNowRequest[]) => {
    updateNow({
      params: { ...params },
      payload: data
    })
  }

  const handleChangeScheduleModalCancel = () => {
    setChangeScheduleModelVisible(false)
  }
  const handleChangeScheduleModalSubmit = (data: []) => {
    // change firmware scheduled
  }

  const handleRevertModalCancel = () => {
    setRevertModelVisible(false)
  }
  const handleRevertModalSubmit = (data: UpdateNowRequest[]) => {
    updateNow({
      params: { ...params },
      payload: data
    })
  }

  // const tableData: readonly FirmwareVenue[] | undefined = tableQuery.data

  const tableData = tableQuery.data as readonly FirmwareVenue[] | undefined
  const columns = useColumns(searchable, filterables)
  const [
    deleteVenue,
    { isLoading: isDeleteVenueUpdating }
  ] = useDeleteVenueMutation()

  const rowActions: TableProps<FirmwareVenue>['rowActions'] = [{
    visible: (selectedRows) => {
      let eolAp = false
      let allEolFwlatest = true
      // let eolModels = []
      for (let v of venues) {
        if (v['eolApFirmwares']) {
          eolAp = true
          // this.latestEolVersion = v['eolApFirmwares'][0].latestEolVersion;
          // this.eolModels = [...new Set([...this.eolModels, ...v['eolApFirmwares'][0].apModels])];
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

      // multiple case
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
      // let allEolFwlatest = true
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
    visible: (selectedRows) => selectedRows.length === 1,
    label: $t({ defaultMessage: 'Change Update Schedule' }),
    onClick: () => setChangeScheduleModelVisible(true)
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
            payload: { ...selectedRows.map((row) => row.id) }
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
      { isLoading: false, isFetching: isDeleteVenueUpdating }
    ]}>
      <Table
        columns={columns}
        dataSource={tableData}
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
        eol={eol}
        eolName={eolName}
        latestEolVersion={latestEolVersion}
        eolModels={eolModels}
        onCancel={handleUpdateModalCancel}
        onSubmit={handleUpdateModalSubmit}
      />
      <ChangeScheduleDialog
        visible={changeScheduleModelVisible}
        firmwareType={FirmwareType.AP_FIRMWARE_UPGRADE}
        data={venues}
        eol={true}
        availableVersions={availableVersions}
        eolName='eolName'
        latestEolVersion='eolVersion'
        eolModels='eolModel'
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

  const { versionFilterOptions } = useGetVenueVersionsQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        // eslint-disable-next-line max-len
        versionFilterOptions: data?.map(v=>({ key: v.versions[0].version, value: v.versions[0].version })) || true
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


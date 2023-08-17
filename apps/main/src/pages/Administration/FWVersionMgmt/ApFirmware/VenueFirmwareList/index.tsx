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
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  useGetUpgradePreferencesQuery,
  useUpdateUpgradePreferencesMutation,
  useGetVenueVersionListQuery,
  useGetAvailableABFListQuery,
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
  firmwareTypeTrans,
  useTableQuery,
  sortProp,
  defaultSort,
  dateSort,
  EolApFirmware,
  ABFVersion
} from '@acx-ui/rc/utils'
import { useParams }                 from '@acx-ui/react-router-dom'
import { RequestPayload }            from '@acx-ui/types'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import {
  compareVersions,
  getApVersion,
  getApNextScheduleTpl,
  getNextSchedulesTooltip,
  toUserDate,
  getApSchedules
} from '../../FirmwareUtils'
import { PreferencesDialog } from '../../PreferencesDialog'
import * as UI               from '../../styledComponents'

import { AdvancedUpdateNowDialog } from './AdvancedUpdateNowDialog'
import { ChangeScheduleDialog }    from './ChangeScheduleDialog'
import { RevertDialog }            from './RevertDialog'
import { UpdateNowDialog }         from './UpdateNowDialog'
import { useApEolFirmware }        from './useApEolFirmware'


function useColumns (
  searchable?: boolean,
  filterables?: { [key: string]: ColumnType['filterable'] }
) {
  const intl = useIntl()
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const transform = firmwareTypeTrans(intl.$t)

  const columns: TableProps<FirmwareVenue>['columns'] = [
    {
      title: intl.$t({ defaultMessage: 'Venue' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      searchable: searchable,
      render: function (_, row) {
        return row.name
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Current AP Firmware' }),
      key: 'version',
      dataIndex: 'version',
      sorter: { compare: sortCurrentApFirmware },
      filterable: filterables ? filterables['version'] : false,
      filterMultiple: false,
      render: function (_, row) {
        return getApVersion(row) ?? '--'
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Legacy AP Firmware' }),
      key: 'eolApFirmwares',
      dataIndex: 'eolApFirmwares',
      sorter: false,
      render: function (_, row) {
        const firmwareText = getDisplayEolFirmwareText(row)

        return firmwareText
          ? <Tooltip title={getDisplayEolFirmwareTooltipText(row)}>
            <UI.WithTooltip>{firmwareText}</UI.WithTooltip>
          </Tooltip>
          : '--'
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Firmware Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: { compare: sortProp('versions[0].category', defaultSort) },
      filterable: filterables ? filterables['type'] : false,
      filterMultiple: false,
      render: function (_, row) {
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
      sorter: { compare: sortProp('lastScheduleUpdate', dateSort) },
      render: function (_, row) {
        if (!row.lastScheduleUpdate) return '--'
        return toUserDate(row.lastScheduleUpdate)
      }
    },
    {
      title: intl.$t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      sorter: { compare: sortProp('nextSchedules[0].startDateTime', dateSort) },
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const schedules = getApSchedules(row)

        return schedules.length === 0
          ? getApNextScheduleTpl(row)
          : <Tooltip
            title={<UI.ScheduleTooltipText>{getNextSchedulesTooltip(row)}</UI.ScheduleTooltipText>}
            overlayStyle={{ minWidth: '280px' }}
          ><UI.WithTooltip>{getApNextScheduleTpl(row)}</UI.WithTooltip></Tooltip>
      }
    }
  ]

  return columns.filter(({ key }) =>
    (key !== 'edges' || (key === 'edges' && isEdgeEnabled)))
}

function sortCurrentApFirmware (a: FirmwareVenue, b: FirmwareVenue) {
  return compareVersions(getApVersion(a), getApVersion(b))
}

function getDisplayEolFirmware (venue: FirmwareVenue): EolApFirmware[] {
  const eolApFirmwares = venue.eolApFirmwares || []
  const currentVersion = getApVersion(venue)
  return eolApFirmwares.filter(eol => compareVersions(eol.currentEolVersion, currentVersion) < 0)
}

function getDisplayEolFirmwareTooltipText (venue: FirmwareVenue): string {
  // eslint-disable-next-line max-len
  return getDisplayEolFirmware(venue).map(eol => `${eol.currentEolVersion}: ${eol.apModels.join(',')}`).join('\n')
}

function getDisplayEolFirmwareText (venue: FirmwareVenue): string {
  return getDisplayEolFirmware(venue).map(eol => eol.currentEolVersion).join(', ')
}

type VenueTableProps = {
  tableQuery: TableQuery<FirmwareVenue, RequestPayload<unknown>, unknown>,
  searchable?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
}

export const VenueFirmwareTable = (
  { tableQuery, searchable, filterables }: VenueTableProps) => {
  const { $t } = useIntl()
  const params = useParams()
  const { availableVersions } = useGetAvailableABFListQuery({ params }, {
    refetchOnMountOrArgChange: false,
    selectFromResult: ({ data }) => {
      return {
        availableVersions: data?.filter((abfVersion: ABFVersion) => abfVersion.abf === 'active')
      }
    }
  })
  const [skipVenueUpgradeSchedules] = useSkipVenueUpgradeSchedulesMutation()
  const [updateVenueSchedules] = useUpdateVenueSchedulesMutation()
  const [updateNow] = useUpdateNowMutation()
  const [modelVisible, setModelVisible] = useState(false)
  const [updateModelVisible, setUpdateModelVisible] = useState(false)
  const [changeScheduleModelVisible, setChangeScheduleModelVisible] = useState(false)
  const [revertModelVisible, setRevertModelVisible] = useState(false)
  const [venues, setVenues] = useState<FirmwareVenue[]>([])
  const [upgradeVersions, setUpgradeVersions] = useState<FirmwareVersion[]>([])
  const [changeUpgradeVersions, setChangeUpgradeVersions] = useState<FirmwareVersion[]>([])
  const [revertVersions, setRevertVersions] = useState<FirmwareVersion[]>([])
  const { canUpdateEolApFirmware } = useApEolFirmware()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

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
      await updateNow({ params: { ...params }, payload: data }).unwrap()
      clearSelection()
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

  const extractAvailableApFirmwares = (selectedRows: FirmwareVenue[]): FirmwareVersion[] => {
    if (!availableVersions) {
      return []
    }

    let filterVersions: FirmwareVersion[]

    if (selectedRows.length === 1) {
      const version = getApVersion(selectedRows[0])
      // eslint-disable-next-line max-len
      filterVersions = availableVersions.filter((availVersion: FirmwareVersion) => compareVersions(availVersion.id, version) > 0)
    } else {
      let selectedMaxVersion: string | undefined
      let isSameVersion = true

      selectedRows.forEach((row: FirmwareVenue) => {
        const version = getApVersion(row)
        if (selectedMaxVersion && compareVersions(version, selectedMaxVersion) !== 0) {
          isSameVersion = false
        }
        if (!selectedMaxVersion || compareVersions(version, selectedMaxVersion) > 0) {
          selectedMaxVersion = version
        }
      })

      filterVersions = availableVersions.filter((availVersion: FirmwareVersion) => {
        const result = compareVersions(availVersion.id, selectedMaxVersion)
        return result > 0 || (result === 0 && !isSameVersion)
      })
    }

    return filterVersions
  }

  const rowActions: TableProps<FirmwareVenue>['rowActions'] = [{
    visible: (selectedRows) => {
      const eolAvailable = canUpdateEolApFirmware(selectedRows)
      const activeApFirmwares = extractAvailableApFirmwares(selectedRows)

      return eolAvailable || activeApFirmwares.length > 0
    },
    label: $t({ defaultMessage: 'Update Now' }),
    onClick: (selectedRows) => {
      setVenues(selectedRows)
      setUpgradeVersions(extractAvailableApFirmwares(selectedRows))
      setUpdateModelVisible(true)
    }
  },
  {
    visible: (selectedRows) => {
      const activeApFirmwares = extractAvailableApFirmwares(selectedRows)
      return activeApFirmwares.length > 0
    },
    label: $t({ defaultMessage: 'Change Update Schedule' }),
    onClick: (selectedRows) => {
      setVenues(selectedRows)
      setChangeUpgradeVersions(extractAvailableApFirmwares(selectedRows))
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
            if (compareVersions(availableVersions[i].id, version) < 0) {
              filterVersions.push(availableVersions[i])
            }
          }
        }
      })
      setRevertVersions(filterVersions)
      setRevertModelVisible(true)
    }
  }]

  const clearSelection = () => {
    setSelectedRowKeys([])
  }

  return (
    <Loader states={[
      tableQuery,
      { isLoading: false }
    ]}>
      <Table
        columns={useColumns(searchable, filterables)}
        dataSource={tableQuery.data?.data}
        onChange={tableQuery.handleTableChange}
        onFilterChange={tableQuery.handleFilterChange}
        enableApiFilter={true}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'checkbox', selectedRowKeys }}
        actions={filterByAccess([{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setModelVisible(true)
        }])}
      />
      <UpdateNowDialogSwitcher
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
      <RevertDialog
        visible={revertModelVisible}
        data={venues}
        availableVersions={revertVersions}
        onCancel={handleRevertModalCancel}
        onSubmit={handleUpdateModalSubmit}
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
  const tableQuery = useTableQuery<FirmwareVenue>({
    useQuery: useGetVenueVersionListQuery,
    defaultPayload: {}
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

interface UpdateNowDialogSwitcherProps {
  visible: boolean,
  onCancel: () => void,
  onSubmit: (data: UpdateNowRequest[]) => void,
  data?: FirmwareVenue[],
  availableVersions?: FirmwareVersion[]
}

function UpdateNowDialogSwitcher (props: UpdateNowDialogSwitcherProps) {
  const isEolApPhase2Enabled = useIsSplitOn(Features.EOL_AP_2022_12_PHASE_2_TOGGLE)
  const { getAvailableEolApFirmwares } = useApEolFirmware()
  const eolApFirmwares = getAvailableEolApFirmwares(props.data)

  const eolApFirmware = eolApFirmwares.length > 0
    ? {
      eol: true,
      eolName: eolApFirmwares[0].name,
      latestEolVersion: eolApFirmwares[0].latestEolVersion,
      eolModels: eolApFirmwares[0].apModels
    }
    : {}

  return isEolApPhase2Enabled
    ? <AdvancedUpdateNowDialog {...props} />
    : <UpdateNowDialog {...({ ...props, ...eolApFirmware })} />
}

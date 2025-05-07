import React, { useState } from 'react'

import { Tooltip } from 'antd'
import { useIntl } from 'react-intl'

import {
  showActionModal,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  compareVersions,
  getApVersion,
  getApSequence,
  getApNextScheduleTpl,
  getNextSchedulesTooltip,
  toUserDate,
  getApSchedules,
  findMaxActiveABFVersion
} from '@acx-ui/rc/components'
import {
  useGetUpgradePreferencesQuery,
  useUpdateUpgradePreferencesMutation,
  useGetVenueVersionListQuery,
  useGetAvailableABFListQuery,
  useGetFirmwareVersionIdListQuery,
  useSkipVenueUpgradeSchedulesMutation,
  useUpdateVenueSchedulesMutation,
  useUpdateNowMutation,
  useUpdateDowngradeMutation
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
  firmwareTypeTrans,
  useTableQuery,
  sortProp,
  defaultSort,
  dateSort,
  EolApFirmware,
  ABFVersion,
  FirmwareUrlsInfo
} from '@acx-ui/rc/utils'
import { useParams }                                 from '@acx-ui/react-router-dom'
import { filterByAccess, getUserProfile, hasAccess } from '@acx-ui/user'
import { getOpsApi, noDataDisplay }                  from '@acx-ui/utils'

import { PreferencesDialog } from '../../PreferencesDialog'
import * as UI               from '../../styledComponents'

import { AdvancedUpdateNowDialog } from './AdvancedUpdateNowDialog'
import { ChangeScheduleDialog }    from './ChangeScheduleDialog'
import { DowngradeDialog }         from './DowngradeDialog'
import { RevertDialog }            from './RevertDialog'
import { UpdateNowDialog }         from './UpdateNowDialog'
import { useApEolFirmware }        from './useApEolFirmware'

function useColumns () {
  const { $t } = useIntl()
  const { versionFilterOptions } = useGetFirmwareVersionIdListQuery({ params: useParams() }, {
    refetchOnMountOrArgChange: false,
    selectFromResult ({ data }) {
      return {
        versionFilterOptions: data?.map(v => ({ key: v, value: v })) || true
      }
    }
  })

  const typeFilterOptions = [
    { key: 'Release', value: $t({ defaultMessage: 'Release' }) },
    { key: 'Beta', value: $t({ defaultMessage: 'Beta' }) }
  ]
  const transform = firmwareTypeTrans($t)

  const columns: TableProps<FirmwareVenue>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      searchable: true,
      render: function (_, row) {
        return row.name
      }
    },
    {
      title: $t({ defaultMessage: 'Current AP Firmware' }),
      key: 'version',
      dataIndex: 'version',
      sorter: { compare: sortCurrentApFirmware },
      filterable: versionFilterOptions ?? false,
      filterMultiple: false,
      render: function (_, row) {
        return getApVersion(row) ?? '--'
      }
    },
    {
      title: $t({ defaultMessage: 'Legacy AP Firmware' }),
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
      title: $t({ defaultMessage: 'Firmware Type' }),
      key: 'type',
      dataIndex: 'type',
      sorter: { compare: sortProp('versions[0].category', defaultSort) },
      filterable: typeFilterOptions,
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
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'lastUpdate',
      dataIndex: 'lastUpdate',
      sorter: { compare: sortProp('lastScheduleUpdate', dateSort) },
      render: function (_, row) {
        return toUserDate(row.lastScheduleUpdate || noDataDisplay)
      }
    },
    {
      title: $t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      sorter: { compare: sortProp('nextSchedules[0].startDateTime', dateSort) },
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const schedules = getApSchedules(row.nextSchedules)

        return schedules.length === 0
          ? getApNextScheduleTpl(row)
          : <Tooltip
            // eslint-disable-next-line max-len
            title={<UI.ScheduleTooltipText>{getNextSchedulesTooltip(row.nextSchedules)}</UI.ScheduleTooltipText>}
            overlayStyle={{ minWidth: '280px' }}
          ><UI.WithTooltip>{getApNextScheduleTpl(row)}</UI.WithTooltip></Tooltip>
      }
    }
  ]

  return columns
}

function sortCurrentApFirmware (a: FirmwareVenue, b: FirmwareVenue) {
  return compareVersions(getApVersion(a), getApVersion(b))
}

function getLegacyEolFirmware (venue: FirmwareVenue): EolApFirmware[] {
  const eolApFirmwares = venue.eolApFirmwares || []
  const currentSequence = getApSequence(venue) ?? 0
  return eolApFirmwares.filter(eol => eol.sequence === (currentSequence - 1))
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

const VenueFirmwareTable = () => {
  const isWifiDowngradeVenueABF = useIsSplitOn(Features.WIFI_DOWNGRADE_VENUE_ABF_TOGGLE)
  const { $t } = useIntl()
  const params = useParams()
  const { rbacOpsApiEnabled } = getUserProfile()

  const tableQuery = useTableQuery<FirmwareVenue>({
    useQuery: useGetVenueVersionListQuery,
    defaultPayload: {}
  })
  const { data: availableABFLists } = useGetAvailableABFListQuery({ params }, {
    refetchOnMountOrArgChange: false
  })
  // eslint-disable-next-line max-len
  const availableVersions = availableABFLists?.filter((abfVersion: ABFVersion) => abfVersion.abf === 'active')
    .sort((abfVersionA, abfVersionB) => -compareVersions(abfVersionA.id, abfVersionB.id))

  let downgradeVersions: ABFVersion[] = []
  if (isWifiDowngradeVenueABF && availableVersions && availableVersions.length > 0) {
    const sequence = availableVersions[0].sequence ? availableVersions[0].sequence : 0
    // eslint-disable-next-line max-len
    downgradeVersions = availableABFLists?.filter((abfVersion: ABFVersion) => abfVersion.sequence as number <= sequence)
      // eslint-disable-next-line max-len
      .sort((abfVersionA, abfVersionB) => -compareVersions(abfVersionA.id, abfVersionB.id)) as ABFVersion[]
  }
  const [skipVenueUpgradeSchedules] = useSkipVenueUpgradeSchedulesMutation()
  const [updateVenueSchedules] = useUpdateVenueSchedulesMutation()
  const [updateNow] = useUpdateNowMutation()
  const [updateDowngrade] = useUpdateDowngradeMutation()
  const [preferencesModelVisible, setPreferencesModelVisible] = useState(false)
  const [updateModelVisible, setUpdateModelVisible] = useState(false)
  const [changeScheduleModelVisible, setChangeScheduleModelVisible] = useState(false)
  const [revertModelVisible, setRevertModelVisible] = useState(false)
  const [venues, setVenues] = useState<FirmwareVenue[]>([])
  const [upgradeVersions, setUpgradeVersions] = useState<FirmwareVersion[]>([])
  const [changeUpgradeVersions, setChangeUpgradeVersions] = useState<FirmwareVersion[]>([])
  const [revertVersions, setRevertVersions] = useState<FirmwareVersion[]>([])
  const [venueActiveSeq, setVenueActiveSeq] = useState(0)
  const { canUpdateEolApFirmware } = useApEolFirmware()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const [updateUpgradePreferences] = useUpdateUpgradePreferencesMutation()
  const { data: preferencesData } = useGetUpgradePreferencesQuery({ params })
  const preferenceDays = preferencesData?.days?.map((day) => {
    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
  })
  const preferences = { ...preferencesData, days: preferenceDays }

  const handlePreferencesModalCancel = () => {
    setPreferencesModelVisible(false)
  }
  const handlePreferencesModalSubmit = async (payload: UpgradePreferences) => {
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

  const handleDowngradeModalSubmit = async (data: UpdateNowRequest[]) => {
    try {
      if (data[0] && data[0].firmwareSequence && data[0].firmwareSequence !== venueActiveSeq) {
        // eslint-disable-next-line max-len
        await updateDowngrade({ params: { venueId: data[0].venueIds[0], firmwareVersion: data[0].firmwareVersion } }).unwrap()
      } else {
        await updateNow({ params: { ...params }, payload: data }).unwrap()
      }
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

    const maxActiveABFVersion = findMaxActiveABFVersion(selectedRows)

    const filterVersions = availableVersions.filter((availVersion: FirmwareVersion) => {
      const result = compareVersions(availVersion.id, maxActiveABFVersion.maxVersion)
      return result > 0 || (result === 0 && !maxActiveABFVersion.isAllTheSame)
    })

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
        content: $t({ defaultMessage: 'Please confirm that you wish to exclude the selected <venuePlural></venuePlural> from this scheduled update' }),
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
      if (isWifiDowngradeVenueABF) {
        if (!downgradeVersions || downgradeVersions.length === 0) {
          return false
        }

        return selectedRows.every((row: FirmwareVenue) => {
          const version = getApVersion(row)
          if (!version) {
            return false
          }
          const venueSequence = getApSequence(row)
          if (!venueSequence) {
            return false
          }
          const downgradeEolFirmwares = getLegacyEolFirmware(row)
          for (let i = 0; i < downgradeVersions.length; i++) {
            if (compareVersions(downgradeVersions[i].id, version) < 0) {
              if (downgradeVersions[i].sequence === venueSequence) {
                filterVersions.push(downgradeVersions[i])
              }
              if (downgradeVersions[i].sequence === (venueSequence - 1)) {
                if (downgradeEolFirmwares && downgradeEolFirmwares.length > 0) {
                  // eslint-disable-next-line max-len
                  if (compareVersions(downgradeVersions[i].id, downgradeEolFirmwares[0].currentEolVersion) <= 0) {
                    filterVersions.push(downgradeVersions[i])
                  }
                } else {
                  filterVersions.push(downgradeVersions[i])
                }
              }
            }
          }
          return filterVersions.length > 0
        })
      } else {
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
      }
    },
    // eslint-disable-next-line max-len
    label: isWifiDowngradeVenueABF ? $t({ defaultMessage: 'Downgrade' }) : $t({ defaultMessage: 'Revert Now' }),
    onClick: (selectedRows) => {
      setVenues(selectedRows)
      let filterVersions: FirmwareVersion[] = []
      selectedRows.forEach((row: FirmwareVenue) => {
        const version = getApVersion(row)
        if (isWifiDowngradeVenueABF) {
          const venueSequence = getApSequence(row) ?? 0
          const downgradeEolFirmwares = getLegacyEolFirmware(row)
          if (downgradeVersions) {
            for (let i = 0; i < downgradeVersions.length; i++) {
              if (compareVersions(downgradeVersions[i].id, version) < 0) {
                if (downgradeVersions[i].sequence === venueSequence) {
                  filterVersions.push(downgradeVersions[i])
                }
                if (downgradeVersions[i].sequence === (venueSequence - 1)) {
                  if (downgradeEolFirmwares && downgradeEolFirmwares.length > 0) {
                    // eslint-disable-next-line max-len
                    if (compareVersions(downgradeVersions[i].id, downgradeEolFirmwares[0].currentEolVersion) <= 0) {
                      filterVersions.push(downgradeVersions[i])
                    }
                  } else {
                    filterVersions.push(downgradeVersions[i])
                  }
                }
              }
            }
            setVenueActiveSeq(venueSequence)
          }
        } else {
          if (availableVersions) {
            for (let i = 0; i < availableVersions.length; i++) {
              if (compareVersions(availableVersions[i].id, version) < 0) {
                filterVersions.push(availableVersions[i])
              }
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
          // eslint-disable-next-line max-len
          ...(rbacOpsApiEnabled ? { rbacOpsIds: [getOpsApi(FirmwareUrlsInfo.updateUpgradePreferences)] } : {}),
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setPreferencesModelVisible(true)
        }])}
      />
      {updateModelVisible && <UpdateNowDialogSwitcher
        data={venues}
        availableVersions={upgradeVersions}
        onCancel={handleUpdateModalCancel}
        onSubmit={handleUpdateModalSubmit}
      />}
      {changeScheduleModelVisible && <ChangeScheduleDialog
        data={venues}
        availableVersions={changeUpgradeVersions}
        onCancel={handleChangeScheduleModalCancel}
        onSubmit={handleChangeScheduleModalSubmit}
      />}
      {revertModelVisible && <RevertDialogSwitcher
        data={venues}
        availableVersions={revertVersions}
        onCancel={handleRevertModalCancel}
        onSubmit={handleDowngradeModalSubmit}
      />}
      <PreferencesDialog
        visible={preferencesModelVisible}
        data={preferences}
        onCancel={handlePreferencesModalCancel}
        onSubmit={handlePreferencesModalSubmit}
      />
    </Loader>
  )
}

// eslint-disable-next-line max-len
const scheduleTypeIsApFunc = (value: Schedule) => value && value.versionInfo && value.versionInfo.type && value.versionInfo.type === FirmwareType.AP_FIRMWARE_UPGRADE

function hasApSchedule (venue: { nextSchedules?: Schedule[] }): boolean {
  return !!venue.nextSchedules && venue.nextSchedules.filter(scheduleTypeIsApFunc).length > 0
}

export function VenueFirmwareList () {
  return <VenueFirmwareTable />
}

interface UpdateNowDialogSwitcherProps {
  onCancel: () => void,
  onSubmit: (data: UpdateNowRequest[]) => void,
  data?: FirmwareVenue[],
  availableVersions?: FirmwareVersion[]
}

function UpdateNowDialogSwitcher (props: UpdateNowDialogSwitcherProps) {
  const isEolApPhase2Enabled = useIsSplitOn(Features.EOL_AP_2022_12_PHASE_2_TOGGLE)
  const { getAvailableEolApFirmwareGroups } = useApEolFirmware()
  // eslint-disable-next-line max-len
  const eolApFirmwareGroups = getAvailableEolApFirmwareGroups(props.data).filter(eolGroup => eolGroup.isUpgradable)

  const eolApFirmware = eolApFirmwareGroups.length > 0
    ? {
      eol: true,
      eolName: eolApFirmwareGroups[0].name,
      latestEolVersion: eolApFirmwareGroups[0].latestEolVersion,
      eolModels: eolApFirmwareGroups[0].apModels
    }
    : {}

  return isEolApPhase2Enabled
    ? <AdvancedUpdateNowDialog {...props} />
    : <UpdateNowDialog {...({ ...props, ...eolApFirmware })} />
}

interface RevertDialogSwitcherProps {
  onCancel: () => void,
  onSubmit: (data: UpdateNowRequest[]) => void,
  data?: FirmwareVenue[],
  availableVersions?: FirmwareVersion[]
}

function RevertDialogSwitcher (props: RevertDialogSwitcherProps) {
  const isWifiDowngradeVenueABF = useIsSplitOn(Features.WIFI_DOWNGRADE_VENUE_ABF_TOGGLE)

  return isWifiDowngradeVenueABF
    ? <DowngradeDialog {...props} />
    : <RevertDialog {...props} />
}

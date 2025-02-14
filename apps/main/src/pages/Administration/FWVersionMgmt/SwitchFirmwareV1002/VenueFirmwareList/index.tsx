import { useState } from 'react'

import { Tooltip, Typography } from 'antd'
import * as _                  from 'lodash'
import { useIntl }             from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { InformationOutlined }    from '@acx-ui/icons'
import { useSwitchFirmwareUtils } from '@acx-ui/rc/components'
import {
  getNextScheduleTplV1002,
  toUserDate
} from '@acx-ui/rc/components'
import {
  useGetSwitchUpgradePreferencesQuery,
  useUpdateSwitchUpgradePreferencesMutation,
  useGetSwitchFirmwarePredownloadQuery,
  useGetSwitchVenueVersionListV1001Query,
  useGetSwitchAvailableFirmwareListV1001Query,
  useGetSwitchCurrentVersionsV1001Query,
  useGetSwitchDefaultFirmwareListV1001Query

} from '@acx-ui/rc/services'
import {
  UpgradePreferences,
  sortProp,
  defaultSort,
  usePollingTableQuery,
  SwitchFirmwareStatusType,
  SwitchFirmwareModelGroup,
  FirmwareSwitchVenueV1002,
  SwitchFirmwareVersion1002,
  compareSwitchVersion,
  SwitchModelGroupDisplayText,
  FirmwareRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useParams }                               from '@acx-ui/react-router-dom'
import { RequestPayload, RolesEnum, SwitchScopes } from '@acx-ui/types'
import {
  filterByAccess,
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
    search: ''
  }
}

export function VenueFirmwareList () {
  const venuePayload = useDefaultVenuePayload()
  const { parseSwitchVersion, getCurrentFirmwareDisplay } = useSwitchFirmwareUtils()
  const { $t } = useIntl()
  const intl = useIntl()
  const params = useParams()
  const isSupport8100 = useIsSplitOn(Features.SWITCH_SUPPORT_ICX8100)

  const tableQuery = usePollingTableQuery<FirmwareSwitchVenueV1002>({
    useQuery: useGetSwitchVenueVersionListV1001Query,
    defaultPayload: venuePayload,
    search: {
      searchTargetFields: venuePayload.searchTargetFields as string[]
    }
  })

  const { versionFilterOptions } = useGetSwitchCurrentVersionsV1001Query({ params }, {
    selectFromResult ({ data }) {
      const filterOptions = []
      for (const key in SwitchFirmwareModelGroup) {
        const modelGroupValue =
          SwitchFirmwareModelGroup[key as keyof typeof SwitchFirmwareModelGroup]
        const versionGroup = data?.currentVersions?.filter(
          (v: { modelGroup: SwitchFirmwareModelGroup }) => v.modelGroup === modelGroupValue)[0]

        if (versionGroup) {
          filterOptions.push({
            // eslint-disable-next-line max-len
            label: `${$t({ defaultMessage: 'ICX Models' })} ${SwitchModelGroupDisplayText[modelGroupValue]}`,
            options: versionGroup.versions.map(
              (v) => ({ value: `${modelGroupValue},${v}`, label: parseSwitchVersion(v) }))
          })
        }
      }
      return { versionFilterOptions: filterOptions }
    }
  })


  const { getSwitchNextScheduleTplTooltipV1002 } = useSwitchFirmwareUtils()
  const { data: availableVersions } = useGetSwitchAvailableFirmwareListV1001Query({ params })
  const { data: preDownload } = useGetSwitchFirmwarePredownloadQuery({
    params, enableRbac: true })
  const [updateUpgradePreferences] = useUpdateSwitchUpgradePreferencesMutation()
  const { data: preferencesData } = useGetSwitchUpgradePreferencesQuery({ params })

  const [modelVisible, setModelVisible] = useState(false)
  const [updateNowWizardVisible, setUpdateNowWizardVisible] = useState(false)
  const [updateStatusDrawerVisible, setUpdateStatusDrawerVisible] = useState(false)
  const [clickedRowData, setClickedRowData] =
    useState<FirmwareSwitchVenueV1002>({} as FirmwareSwitchVenueV1002)
  const [switchScheduleDrawerVisible, setSwitchScheduleDrawerVisible] = useState(false)
  const [wizardType, setWizardType] =
    useState<SwitchFirmwareWizardType>(SwitchFirmwareWizardType.update)
  const [selectedVenueList, setSelectedVenueList] = useState<FirmwareSwitchVenueV1002[]>([])

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

  const { data: recommendedSwitchReleaseVersions } =
    useGetSwitchDefaultFirmwareListV1001Query({ params })
  const columns: TableProps<FirmwareSwitchVenueV1002>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueName' ,
      dataIndex: 'venueName',
      sorter: { compare: sortProp('venueName', defaultSort) },
      searchable: true,
      width: 120,
      defaultSortOrder: 'ascend',
      render: function (_, row, __, highlightFn) {

        const modelGroups = [
          SwitchFirmwareModelGroup.ICX71,
          SwitchFirmwareModelGroup.ICX7X,
          SwitchFirmwareModelGroup.ICX82,
          ...(isSupport8100 ? [SwitchFirmwareModelGroup.ICX81] : [])
        ]

        const getRecommendedVersion = (modelGroup: SwitchFirmwareModelGroup) => {
          return recommendedSwitchReleaseVersions
            ?.find(r => r.modelGroup === modelGroup)?.versions[0]?.id
        }

        const hasOutdatedVersion = modelGroups.some(modelGroup => {
          const recommendedVersion = getRecommendedVersion(modelGroup)
          const currentVersion = row.versions.find(v => v.modelGroup === modelGroup)?.version
          const commpareSwitchVersionRes = compareSwitchVersion(recommendedVersion, currentVersion)
          return commpareSwitchVersionRes > 0
        })

        const outdatedVersionSign = hasOutdatedVersion ?
          <Tooltip children={<InformationOutlined style={{
            marginBottom: '-4px',
            overflow: 'visible',
            marginLeft: '2px'
          }} />}
          // eslint-disable-next-line max-len
          title={$t({ defaultMessage: 'Switches in this <VenueSingular></VenueSingular> are running an older version. We recommend that you update the <VenueSingular></VenueSingular> to the recommended firmware version.' })} /> : <></>
        return <div style={{ display: 'flex' }}><Tooltip
          children={<div style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>{highlightFn(row.venueName)} </div>}
          title={row.venueName}></Tooltip>{outdatedVersionSign}</div>
      }
    },
    {
      title: $t({ defaultMessage: 'Current Firmware' }),
      key: 'version',
      dataIndex: 'version',
      width: 250,
      minWidth: 300,
      sorter: { compare: sortProp('switchFirmwareVersion.id', defaultSort) },
      filterable: true,
      fitlerCustomOptions: versionFilterOptions || [],
      filterMultiple: false,
      filterKey: 'filterModelVersion',
      onCell: () => ({
        style: { padding: '10px 0 5px 0',
          overflow: 'hidden' }
      }),
      render: (_, row) => getCurrentFirmwareDisplay(intl, row, 0)
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

        const switchFirmwareStatusValue =
        SwitchFirmwareStatusType[row.status as keyof typeof SwitchFirmwareStatusType]

        if (_.isEmpty(switchFirmwareStatusValue)
          || switchFirmwareStatusValue === SwitchFirmwareStatusType.NONE ) {
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
          title={getSwitchNextScheduleTplTooltipV1002(intl, row,
            getNextScheduleTplV1002(intl, row)
          ) ||
            intl.$t({ defaultMessage: 'Not scheduled' })}
          placement='bottom' >
          <UI.WithTooltip>{getNextScheduleTplV1002(intl, row)}</UI.WithTooltip>
        </Tooltip >
      }
    }
  ]

  const hasAvailableSwitchFirmware = function () {
    let filterVersions: SwitchFirmwareVersion1002[] =
      [...availableVersions as SwitchFirmwareVersion1002[] ?? []]
    return filterVersions?.length > 0
  }

  const rowActions: TableProps<FirmwareSwitchVenueV1002>['rowActions'] = [{
    label: $t({ defaultMessage: 'Update Now' }),
    scopeKey: [SwitchScopes.UPDATE],
    rbacOpsIds: [getOpsApi(FirmwareRbacUrlsInfo.updateSwitchVenueSchedules)],
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
    rbacOpsIds: [getOpsApi(FirmwareRbacUrlsInfo.updateSwitchVenueSchedules)],
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
    rbacOpsIds: [getOpsApi(FirmwareRbacUrlsInfo.skipSwitchUpgradeSchedules)],
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

  const isPreferencesVisible
  = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

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
        rowKey='venueId'
        rowActions={filterByAccess(rowActions)}
        rowSelection={filterByAccess(rowActions).length > 0 && { type: 'checkbox' }}
        actions={isPreferencesVisible ? [{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setModelVisible(true)
        }] : []}
      />

      <SwitchUpgradeWizard
        wizardType={wizardType}
        visible={updateNowWizardVisible}
        data={selectedVenueList as FirmwareSwitchVenueV1002[]}
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

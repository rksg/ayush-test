import { useState } from 'react'

import { Tooltip, Typography } from 'antd'
import * as _                  from 'lodash'
import { useIntl }             from 'react-intl'

import {
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import { useSwitchFirmwareUtils }          from '@acx-ui/rc/components'
import {
  useGetSwitchUpgradePreferencesQuery, //TODO
  useUpdateSwitchUpgradePreferencesMutation, //TODO
  useGetSwitchFirmwarePredownloadQuery, // Done
  useGetSwitchVenueVersionListV1002Query,
  useGetSwitchAvailableFirmwareListV1002Query,
  useGetSwitchCurrentVersionsV1002Query

} from '@acx-ui/rc/services'
import {
  UpgradePreferences,
  sortProp,
  defaultSort,
  usePollingTableQuery,
  SwitchFirmwareStatusType,
  SwitchFirmwareModelGroup,
  FirmwareSwitchVenueV1002,
  SwitchFirmwareVersion1002
} from '@acx-ui/rc/utils'
import { useParams }                     from '@acx-ui/react-router-dom'
import { RequestPayload, SwitchScopes }  from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'
import { noDataDisplay }                 from '@acx-ui/utils'

import {
  getNextScheduleTplV1002,
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

export function VenueFirmwareList () {
  const venuePayload = useDefaultVenuePayload()
  const { parseSwitchVersion, getCurrentFirmwareDisplay } = useSwitchFirmwareUtils()
  const { $t } = useIntl()

  const modelGroupDisplayText: { [key in SwitchFirmwareModelGroup]: string } = {
    [SwitchFirmwareModelGroup.ICX71]: $t({ defaultMessage: '(7150)' }),
    [SwitchFirmwareModelGroup.ICX7X]: $t({ defaultMessage: '(7550-7850)' }),
    [SwitchFirmwareModelGroup.ICX82]: $t({ defaultMessage: '(8200)' })
  }

  const tableQuery = usePollingTableQuery<FirmwareSwitchVenueV1002>({
    useQuery: useGetSwitchVenueVersionListV1002Query,
    defaultPayload: venuePayload,
    search: {
      searchTargetFields: venuePayload.searchTargetFields as string[]
    }
  })

  const { versionFilterOptions } = useGetSwitchCurrentVersionsV1002Query({
    params: useParams()
  }, {
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
            label: `${$t({ defaultMessage: 'ICX Models' })} ${modelGroupDisplayText[modelGroupValue]}`,
            options: versionGroup.versions.map(
              (v) => ({ value: v, label: parseSwitchVersion(v) }))
          })
        }
      }

      return { versionFilterOptions: filterOptions }
    }
  })

  const intl = useIntl()
  const params = useParams()
  const {
    getSwitchNextScheduleTplTooltipV1002
  } = useSwitchFirmwareUtils()
  const { data: availableVersions } = useGetSwitchAvailableFirmwareListV1002Query({ params })
  const [modelVisible, setModelVisible] = useState(false)
  const [updateNowWizardVisible, setUpdateNowWizardVisible] = useState(false)
  const [updateStatusDrawerVisible, setUpdateStatusDrawerVisible] = useState(false)
  const [clickedRowData, setClickedRowData] =
    useState<FirmwareSwitchVenueV1002>({} as FirmwareSwitchVenueV1002)
  const [switchScheduleDrawerVisible, setSwitchScheduleDrawerVisible] = useState(false)

  const [wizardType, setWizardType] =
    useState<SwitchFirmwareWizardType>(SwitchFirmwareWizardType.update)

  const [selectedVenueList, setSelectedVenueList] = useState<FirmwareSwitchVenueV1002[]>([])

  const { data: preDownload } = useGetSwitchFirmwarePredownloadQuery({
    params,
    enableRbac: true
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
  const columns: TableProps<FirmwareSwitchVenueV1002>['columns'] = [
    {
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      key: 'venueName' ,
      dataIndex: 'venueName',
      sorter: { compare: sortProp('venueName', defaultSort) },
      searchable: true,
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        return row.venueName
      }
    },
    {
      title: $t({ defaultMessage: 'Current Firmware' }),
      key: 'version',
      dataIndex: 'version',
      sorter: { compare: sortProp('switchFirmwareVersion.id', defaultSort) },
      filterable: true,
      fitlerCustomOptions: versionFilterOptions || [],
      filterMultiple: false,
      filterKey: 'includeExpired',
      render: function (_, row) {
        return getCurrentFirmwareDisplay(intl, row)
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

        const witchFirmwareStatusValue =
        SwitchFirmwareStatusType[row.status as keyof typeof SwitchFirmwareStatusType]

        if (_.isEmpty(witchFirmwareStatusValue)
          || witchFirmwareStatusValue === SwitchFirmwareStatusType.NONE
          || _.isEmpty(witchFirmwareStatusValue)) {
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
          title={getSwitchNextScheduleTplTooltipV1002(intl, row) ||
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
        rowSelection={isSelectionVisible && { type: 'checkbox' }}
        actions={hasPermission({ scopes: [SwitchScopes.UPDATE] }) ? [{
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

import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Loader, Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import {
  useGetAvailableEdgeFirmwareVersionsQuery,
  useGetLatestEdgeFirmwareQuery,
  useGetVenueEdgeFirmwareListQuery,
  useUpdateEdgeFirmwareMutation
} from '@acx-ui/rc/services'
import {
  dateSort,
  defaultSort,
  EdgeVenueFirmware,
  FirmwareCategory,
  FirmwareSwitchVenue,
  firmwareTypeTrans,
  sortProp
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import {
  toUserDate,
  compareVersions,
  isSwitchNextScheduleTooltipDisabled,
  getNextScheduleTpl,
  getSwitchNextScheduleTplTooltip
} from '../../FirmwareUtils'
import * as UI from '../../styledComponents'

import { UpdateNowDialog } from './UpdateNowDialog'


export function VenueFirmwareList () {
  const intl = useIntl()
  const { $t } = intl
  const transform = firmwareTypeTrans($t)
  const [venueIds, setVenueIds] = useState<string[]>([])
  const {
    data: venueFirmwareList,
    isLoading: isVenueFirmwareListLoading
  } = useGetVenueEdgeFirmwareListQuery({})
  const { latestReleaseVersion } = useGetLatestEdgeFirmwareQuery({}, {
    selectFromResult: ({ data }) => ({
      latestReleaseVersion: data?.[0]
    })
  })
  const { data: availableVersions } = useGetAvailableEdgeFirmwareVersionsQuery({})
  const [updateNow] = useUpdateEdgeFirmwareMutation()

  const columns: TableProps<EdgeVenueFirmware>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend',
      width: 120
    },
    {
      title: $t({ defaultMessage: 'Current Firmware' }),
      key: 'versions[0].name',
      dataIndex: 'versions[0].name',
      sorter: { compare: sortProp('versions[0].name', defaultSort) },
      render: function (_, row) {
        return row.versions?.[0]?.name || '--'
      },
      width: 120
    },
    {
      title: $t({ defaultMessage: 'Firmware Type' }),
      key: 'versions[0].category',
      dataIndex: 'versions[0].category',
      sorter: { compare: sortProp('versions[0].category', defaultSort) },
      render: function (_, row) {
        if (!row.versions?.[0]) return '--'
        const text = transform(row.versions[0].category as FirmwareCategory, 'type')
        const subText = transform(row.versions[0].category as FirmwareCategory, 'subType')
        if (!subText) return text
        return `${text} (${subText})`
      },
      width: 120
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'updatedDate',
      dataIndex: 'updatedDate',
      sorter: { compare: sortProp('updatedDate', dateSort) },
      render: function (_, row) {
        if (!row.updatedDate) return '--'
        return toUserDate(row.updatedDate)
      },
      width: 120
    },
    {
      title: $t({ defaultMessage: 'Next Update Schedule' }),
      key: 'nextSchedule',
      dataIndex: 'nextSchedule',
      sorter: { compare: sortProp('nextSchedule.timeSlot.startDateTime', defaultSort) },
      render: function (_, row) {
        const rowData = row as unknown as FirmwareSwitchVenue
        return (!isSwitchNextScheduleTooltipDisabled(rowData)
          ? getNextScheduleTpl(intl, rowData)
          : (
            <Tooltip title={
              <UI.ScheduleTooltipText>
                {getSwitchNextScheduleTplTooltip(rowData)}
              </UI.ScheduleTooltipText>
            }
            placement='bottom'>
              <UI.WithTooltip>{getNextScheduleTpl(intl, rowData)}</UI.WithTooltip>
            </Tooltip>
          )
        )
      }
    }
  ]

  const rowActions: TableProps<EdgeVenueFirmware>['rowActions'] = [
    {
      visible: (selectedRows) => {
        const hasOutdatedFw = selectedRows?.some(
          item => latestReleaseVersion?.id &&
          ((item.versions?.[0].id
            && compareVersions(item.versions?.[0].id, latestReleaseVersion?.id) <= 0)
          || !item.versions?.[0].id))
        return hasOutdatedFw
      },
      label: $t({ defaultMessage: 'Update Now' }),
      onClick: (selectedRows) => {
        setVenueIds(selectedRows.map(item => item.id))
        setUpdateModelVisible(true)
      }
    },
    {
      visible: (selectedRows) => {
        return selectedRows.every(row => hasSchedule(row))
      },
      label: $t({ defaultMessage: 'Change Update Schedule' }),
      disabled: (selectedRows) => {
        return !hasAvailableSwitchFirmware(selectedRows)
      },
      // tooltip: (selectedRows) => {
      //   return hasAvailableSwitchFirmware(selectedRows) ?
      //     '' : $t({ defaultMessage: 'No available versions' })
      // },
      onClick: (selectedRows) => {
        setVenues(selectedRows)
        let filterVersions: FirmwareVersion[] = [...availableVersions as FirmwareVersion[] ?? []]
        let nonIcx8200Count = 0, icx8200Count = 0
        let currentScheduleVersion = enableSwitchTwoVersionUpgrade && selectedRows.length === 1 ? // eslint-disable-next-line max-len
          (selectedRows[0].nextSchedule?.version ? selectedRows[0].nextSchedule.version.name : '') : ''
        // eslint-disable-next-line max-len
        let currentScheduleVersionAboveTen = enableSwitchTwoVersionUpgrade && selectedRows.length === 1 ? // eslint-disable-next-line max-len
          (selectedRows[0].nextSchedule?.versionAboveTen ? selectedRows[0].nextSchedule.versionAboveTen.name : '') : ''

        selectedRows.forEach((row: FirmwareSwitchVenue) => {
          const version = row.switchFirmwareVersion?.id
          const rodanVersion = enableSwitchRodanFirmware ? row.switchFirmwareVersionAboveTen?.id : ''
          // eslint-disable-next-line max-len
          removeCurrentVersionsAnd10010IfNeeded(version, rodanVersion, filterVersions, enableSwitchRodanFirmware)

          if (enableSwitchTwoVersionUpgrade) {
            nonIcx8200Count = nonIcx8200Count + (row.switchCount ? row.switchCount : 0)
            icx8200Count = icx8200Count + (row.aboveTenSwitchCount ? row.aboveTenSwitchCount : 0)
          }
        })

        setChangeUpgradeVersions(filterVersions)
        setNonIcx8200Count(nonIcx8200Count)
        setIcx8200Count(icx8200Count)
        setCurrentScheduleVersion(currentScheduleVersion)
        setCurrentScheduleVersionAboveTen(currentScheduleVersionAboveTen)
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
    }
  ]

  const [updateModelVisible, setUpdateModelVisible] = useState(false)

  const handleUpdateModalCancel = () => {
    setUpdateModelVisible(false)
  }

  const handleUpdateModalSubmit = async (data: string) => {
    const payload = {
      venueIds: venueIds,
      firmwareVersion: data
    }
    try {
      await updateNow({ payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <Loader states={[
      { isLoading: isVenueFirmwareListLoading, isFetching: isVenueFirmwareListLoading }
    ]}>
      <Table
        columns={columns}
        dataSource={venueFirmwareList}
        rowKey='id'
        rowActions={filterByAccess(rowActions)}
        rowSelection={hasAccess() && { type: 'checkbox' }}
      />
      <UpdateNowDialog
        visible={updateModelVisible}
        availableVersions={availableVersions}
        onCancel={handleUpdateModalCancel}
        onSubmit={handleUpdateModalSubmit}
      />
    </Loader>
  )
}

const hasSchedule = (venue: EdgeVenueFirmware): boolean => {
  return !!venue.nextSchedule
}

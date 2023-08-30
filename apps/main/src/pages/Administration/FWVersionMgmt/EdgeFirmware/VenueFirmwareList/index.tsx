import { useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Loader, Table,
  TableProps,
  Tooltip,
  showActionModal
} from '@acx-ui/components'
import {
  useGetAvailableEdgeFirmwareVersionsQuery,
  useGetEdgeUpgradePreferencesQuery,
  useGetLatestEdgeFirmwareQuery,
  useGetVenueEdgeFirmwareListQuery,
  useSkipEdgeUpgradeSchedulesMutation,
  useUpdateEdgeFirmwareNowMutation,
  useUpdateEdgeUpgradePreferencesMutation,
  useUpdateEdgeVenueSchedulesMutation
} from '@acx-ui/rc/services'
import {
  EdgeFirmwareVersion,
  EdgeUpdateScheduleRequest,
  EdgeVenueFirmware,
  FirmwareCategory,
  FirmwareSwitchVenue,
  UpgradePreferences,
  dateSort,
  defaultSort,
  firmwareTypeTrans,
  sortProp
} from '@acx-ui/rc/utils'
import { filterByAccess, hasAccess } from '@acx-ui/user'

import {
  compareVersions,
  getNextScheduleTpl,
  getSwitchNextScheduleTplTooltip,
  isSwitchNextScheduleTooltipDisabled,
  toUserDate
} from '../../FirmwareUtils'
import { PreferencesDialog } from '../../PreferencesDialog'
import * as UI               from '../../styledComponents'

import { ChangeScheduleDialog } from './ChangeScheduleDialog'
import { UpdateNowDialog }      from './UpdateNowDialog'


export function VenueFirmwareList () {
  const intl = useIntl()
  const { $t } = intl
  const params = useParams()
  const transform = firmwareTypeTrans($t)
  const [venueIds, setVenueIds] = useState<string[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [
    changeScheduleAvailableVersions,
    setChangeScheduleAvailableVersions
  ] = useState<EdgeFirmwareVersion[]>()
  const [updateModalVisible, setUpdateModalVisible] = useState(false)
  const [preferenceModalVisible, setPreferenceModalVisible] = useState(false)
  const [changeScheduleModal, setChangeScheduleModal] = useState(false)
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
  const { preferenceData } = useGetEdgeUpgradePreferencesQuery({ params }, {
    selectFromResult: ({ data }) => {
      return {
        preferenceData: {
          ...data,
          days: data?.days?.map(day =>
            day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
          )
        }
      }
    }
  })
  const [updateNow] = useUpdateEdgeFirmwareNowMutation()
  const [updatePreferences] = useUpdateEdgeUpgradePreferencesMutation()
  const [updateSchedule] = useUpdateEdgeVenueSchedulesMutation()
  const [skipSchedule] = useSkipEdgeUpgradeSchedulesMutation()

  const columns: TableProps<EdgeVenueFirmware>['columns'] = [
    {
      title: $t({ defaultMessage: 'Venue Name' }),
      key: 'name',
      dataIndex: 'name',
      sorter: { compare: sortProp('name', defaultSort) },
      defaultSortOrder: 'ascend'
    },
    {
      title: $t({ defaultMessage: 'Current Firmware' }),
      key: 'versions[0].name',
      dataIndex: 'versions[0].name',
      sorter: { compare: sortProp('versions[0].name', defaultSort) },
      render: function (_, row) {
        return row.versions?.[0]?.name || '--'
      }
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
      }
    },
    {
      title: $t({ defaultMessage: 'Last Update' }),
      key: 'updatedDate',
      dataIndex: 'updatedDate',
      sorter: { compare: sortProp('updatedDate', dateSort) },
      render: function (_, row) {
        if (!row.updatedDate) return '--'
        return toUserDate(row.updatedDate)
      }
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
        setUpdateModalVisible(true)
      }
    },
    {
      visible: (selectedRows) => {
        return selectedRows.every(row => hasSchedule(row))
      },
      label: $t({ defaultMessage: 'Change Update Schedule' }),
      onClick: (selectedRows) => {
        const filteredAvailableVersions = availableVersions?.filter(availableVersion => {
          return !selectedRows.some(row =>
            row.versions.some(version => version.id === availableVersion.id))
        })
        setVenueIds(selectedRows.map(item => item.id))
        setChangeScheduleAvailableVersions(filteredAvailableVersions)
        setChangeScheduleModal(true)
      }
    },
    {
      visible: (selectedRows) => {
        return selectedRows.every(row => hasSchedule(row))
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
            skipSchedule({
              payload: {
                venueIds: selectedRows.map((row) => row.id)
              }
            }).then(clearSelection)
          },
          onCancel () {}
        })
      }
    }
  ]

  const handleUpdateModalCancel = () => {
    setUpdateModalVisible(false)
  }

  const handleUpdateModalSubmit = async (data: string) => {
    const payload = {
      venueIds: venueIds,
      firmwareVersion: data
    }
    try {
      await updateNow({ payload }).unwrap()
      setSelectedRowKeys([])
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handlePreferenceModalCancel = () => {
    setPreferenceModalVisible(false)
  }

  const handlePreferenceModalSubmit = async (payload: UpgradePreferences) => {
    try {
      await updatePreferences({ params, payload }).unwrap()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleChangeScheduleModalCancel = () => {
    setChangeScheduleModal(false)
  }

  const handleChangeScheduleModalSubmit = async (data: EdgeUpdateScheduleRequest) => {
    const payload = { ...data, venueIds }
    try {
      await updateSchedule({ payload }).unwrap()
      setSelectedRowKeys([])
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
        rowSelection={hasAccess() && { type: 'checkbox', selectedRowKeys }}
        actions={[{
          label: $t({ defaultMessage: 'Preferences' }),
          onClick: () => setPreferenceModalVisible(true)
        }]}
      />
      <UpdateNowDialog
        visible={updateModalVisible}
        availableVersions={availableVersions}
        onCancel={handleUpdateModalCancel}
        onSubmit={handleUpdateModalSubmit}
      />
      <PreferencesDialog
        visible={preferenceModalVisible}
        data={preferenceData}
        onCancel={handlePreferenceModalCancel}
        onSubmit={handlePreferenceModalSubmit}
      />
      <ChangeScheduleDialog
        visible={changeScheduleModal}
        availableVersions={changeScheduleAvailableVersions}
        onCancel={handleChangeScheduleModalCancel}
        onSubmit={handleChangeScheduleModalSubmit}
      />
    </Loader>
  )
}

const hasSchedule = (venue: EdgeVenueFirmware): boolean => {
  return !!venue.nextSchedule
}

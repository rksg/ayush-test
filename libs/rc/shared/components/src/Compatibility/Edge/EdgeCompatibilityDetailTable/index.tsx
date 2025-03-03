/* eslint-disable max-len */
import { useState } from 'react'

import { Space, Typography } from 'antd'
import { sumBy }             from 'lodash'
import moment                from 'moment'
import { useIntl }           from 'react-intl'

import { Table, TableProps }                                                                                                                                                                                                                                                        from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                                                                                                                                                                   from '@acx-ui/feature-toggle'
import { useGetAvailableEdgeFirmwareVersionsQuery, useGetLatestEdgeFirmwareQuery, useGetVenueEdgeFirmwareListQuery, useStartEdgeFirmwareVenueUpdateNowMutation, useUpdateEdgeFirmwareNowMutation, useUpdateEdgeFirmwareVenueScheduleMutation, useUpdateEdgeVenueSchedulesMutation } from '@acx-ui/rc/services'
import { EdgeFirmwareVersion, EdgeIncompatibleFeature, EdgeIncompatibleFeatureV1_1, EdgeUpdateScheduleRequest, EdgeVenueFirmware, EntityCompatibility, EntityCompatibilityV1_1, IncompatibilityFeatureGroups, IncompatibilityFeatures, getCompatibilityFeatureDisplayName }         from '@acx-ui/rc/utils'
import { EdgeScopes }                                                                                                                                                                                                                                                               from '@acx-ui/types'
import { filterByAccess, hasPermission }                                                                                                                                                                                                                                            from '@acx-ui/user'
import { compareVersions }                                                                                                                                                                                                                                                          from '@acx-ui/utils'

import { EdgeChangeScheduleDialog } from '../../../EdgeFirmware/ChangeScheduleDialog'
import { EdgeUpdateNowDialog }      from '../../../EdgeFirmware/UpdateNowDialog'
import { useIsEdgeFeatureReady }    from '../../../useEdgeActions'

interface EdgeCompatibilityDetailTableData {
  featureName: string,
  requiredFw: string,
  incompatible?: number,
}

interface EdgeCompatibilityDetailTableProps {
  data: EntityCompatibility['incompatibleFeatures'] | EntityCompatibilityV1_1['incompatibleFeatures'],
  requirementOnly?: boolean,
  venueId?: string,  // is required when `requirementOnly === false`
}

const useColumns = (isGroupedData: boolean) => {
  const { $t } = useIntl()

  const defaultColumns: TableProps<EdgeCompatibilityDetailTableData | EdgeIncompatibleFeatureV1_1>['columns'] =
    [{
      title: $t({ defaultMessage: 'Incompatible Feature' }),
      key: 'featureName',
      dataIndex: 'featureName',
      defaultSortOrder: 'ascend',
      render: function (_, row) {
        const { featureName } = isGroupedData ? row as EdgeIncompatibleFeatureV1_1 : row as EdgeCompatibilityDetailTableData
        const featureDisplayName = getCompatibilityFeatureDisplayName(featureName as IncompatibilityFeatures & IncompatibilityFeatureGroups)
        return featureDisplayName
      }
    }, {
      title: $t({ defaultMessage: 'Incompatible RUCKUS Edges' }),
      key: isGroupedData ? 'incompatibleDevices' : 'incompatible',
      dataIndex: isGroupedData ? 'incompatibleDevices' : 'incompatible',
      align: 'center',
      render: function (_, row) {
        if (isGroupedData) {
          const { incompatibleDevices } = row as EdgeIncompatibleFeatureV1_1
          const totalCount = sumBy(incompatibleDevices, (d) => d.count)
          return incompatibleDevices ? totalCount : ''
        } else {
          const { incompatible } = row as EdgeCompatibilityDetailTableData
          return incompatible
        }
      }
    }, {
      title: $t({ defaultMessage: 'Min. Required Versions' }),
      key: isGroupedData ? 'requirements' : 'requiredFw',
      dataIndex: isGroupedData ? 'requirements' : 'requiredFw',
      render: function (_, row) {
        if (isGroupedData) {
          const { requirements } = row as EdgeIncompatibleFeatureV1_1
          return <Space>{requirements?.map((r) => r.firmware).join(', ')}</Space>
        } else {
          const { requiredFw } = row as EdgeCompatibilityDetailTableData
          return requiredFw
        }
      }
    }]

  return defaultColumns
}

export const EdgeCompatibilityDetailTable = (props: EdgeCompatibilityDetailTableProps) => {
  const { $t } = useIntl()

  const isBatchOperationEnable = useIsSplitOn(Features.EDGE_FIRMWARE_NOTIFICATION_BATCH_OPERATION_TOGGLE)
  const { data, requirementOnly = false, venueId } = props

  const isEdgeCompatibilityEnhancementEnabled = useIsEdgeFeatureReady(Features.EDGE_ENG_COMPATIBILITY_CHECK_ENHANCEMENT_TOGGLE)
  const isGroupedData = isEdgeCompatibilityEnhancementEnabled && (data[0].hasOwnProperty('featureType'))

  const [updateNowFwVer, setUpdateNowFwVer] = useState<string|undefined>()
  const [scheduleUpdateFwVer, setScheduleUpdateFwVer] = useState<string|undefined>()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const [updateNow] = useUpdateEdgeFirmwareNowMutation()
  const [updateSchedule] = useUpdateEdgeVenueSchedulesMutation()
  const [startEdgeFirmwareVenueUpdateNow] = useStartEdgeFirmwareVenueUpdateNowMutation()
  const [updateEdgeFirmwareVenueSchedule] = useUpdateEdgeFirmwareVenueScheduleMutation()

  const { latestReleaseVersion } = useGetLatestEdgeFirmwareQuery({}, {
    skip: requirementOnly,
    selectFromResult: ({ data }) => ({
      latestReleaseVersion: data?.[0]
    })
  })
  const { data: availableVersions } = useGetAvailableEdgeFirmwareVersionsQuery({},
    { skip: requirementOnly })
  const { venueFirmware } = useGetVenueEdgeFirmwareListQuery({
    payload: {
      filters: { venueId: [venueId] }
    }
  }, {
    skip: requirementOnly,
    selectFromResult: ({ data }) => {
      return { venueFirmware: data?.filter(fw => fw.id === venueId)?.[0] }
    }
  })

  const columns = useColumns(isGroupedData)

  const handleUpdateNowSubmit = async (data: string) => {
    const payload = { version: data }

    try {
      if (isBatchOperationEnable) {
        await startEdgeFirmwareVenueUpdateNow({
          payload: {
            venueIds: [venueId!],
            version: data,
            state: 'UPDATE_NOW'
          }
        }).unwrap()
      } else {
        await updateNow({
          params: { venueId },
          payload
        }).unwrap()
      }

      setSelectedRowKeys([])
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleScheduleSubmit = async (value: EdgeUpdateScheduleRequest) => {
    const payload = {
      ...value,
      date: moment(value.date).format('yyyy-MM-DD')
    }

    try {
      if (isBatchOperationEnable) {
        await updateEdgeFirmwareVenueSchedule({
          payload: {
            venueIds: [venueId!],
            date: payload.date,
            time: payload.time,
            version: payload.version
          }
        }).unwrap()
      } else {
        await updateSchedule({
          params: { venueId },
          payload
        }).unwrap()
      }

      setSelectedRowKeys([])
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const rowActions: TableProps<EdgeCompatibilityDetailTableData | EdgeIncompatibleFeatureV1_1>['rowActions'] = [{
    label: $t({ defaultMessage: 'Update Version Now' }),
    scopeKey: [EdgeScopes.UPDATE],
    visible: (selectedRows) => {
      if (!selectedRows?.length) return false

      return Boolean(latestReleaseVersion?.id &&
          ((venueFirmware?.versions?.[0].id
            && compareVersions(venueFirmware?.versions?.[0].id, latestReleaseVersion?.id) <= 0)
          || !venueFirmware?.versions?.[0].id))
    },
    onClick: (selectedRows: EdgeCompatibilityDetailTableData[] | EdgeIncompatibleFeatureV1_1[]) => {
      setUpdateNowFwVer(isGroupedData
        ? (selectedRows[0] as EdgeIncompatibleFeatureV1_1).requirements?.[0].firmware
        : (selectedRows[0] as EdgeCompatibilityDetailTableData).requiredFw)
    }
  }, {
    label: $t({ defaultMessage: 'Schedule Version Update' }),
    scopeKey: [EdgeScopes.UPDATE],
    visible: (selectedRows) => {
      if (!selectedRows?.length) return false

      return !!venueFirmware?.nextSchedule
    },
    onClick: (selectedRows: EdgeCompatibilityDetailTableData[] | EdgeIncompatibleFeatureV1_1[]) => {
      setScheduleUpdateFwVer(isGroupedData
        ? (selectedRows[0] as EdgeIncompatibleFeatureV1_1).requirements?.[0].firmware
        : (selectedRows[0] as EdgeCompatibilityDetailTableData).requiredFw)
    }
  }]

  const tableData = isGroupedData
    ? data as EdgeIncompatibleFeatureV1_1[] : data.map(feature => ({
      ...(feature as EdgeIncompatibleFeature).featureRequirement,
      incompatible: sumBy(feature.incompatibleDevices, (d) => d.count)
    })) as EdgeCompatibilityDetailTableData[]

  const showCheckbox = hasPermission({ scopes: [EdgeScopes.UPDATE] }) && !requirementOnly

  return <>
    <Typography.Text>
      {
        $t({ defaultMessage: '* Please note that all RUCKUS Edges in this <venueSingular></venueSingular> would be upgraded together.' })
      }
    </Typography.Text>
    <Table
      rowKey='featureName'
      // eslint-disable-next-line max-len
      columns={columns.filter(i => requirementOnly ? ( isGroupedData ? i.dataIndex !== 'incompatibleDevices' : i.dataIndex !== 'incompatible') : true)}
      dataSource={tableData}
      rowActions={filterByAccess(rowActions)}
      rowSelection={showCheckbox && {
        type: 'checkbox',
        selectedRowKeys
      }}
    />

    <EdgeUpdateNowDialog
      visible={!!updateNowFwVer}
      onCancel={() => setUpdateNowFwVer(undefined)}
      onSubmit={handleUpdateNowSubmit}
      availableVersions={availableVersions}
    />
    <EdgeChangeScheduleDialog
      visible={!!scheduleUpdateFwVer}
      onCancel={() => setScheduleUpdateFwVer(undefined)}
      onSubmit={handleScheduleSubmit}
      availableVersions={getFilteredScheduleVersions(availableVersions, venueFirmware)}
    />
  </>
}

const getFilteredScheduleVersions = (availableVersions?: EdgeFirmwareVersion[], venueFirmware?: EdgeVenueFirmware) => {
  if (!availableVersions || !venueFirmware) return availableVersions

  return availableVersions.filter(availableVersion => {
    return !venueFirmware.versions.some(version => version.id === availableVersion.id)
  })
}
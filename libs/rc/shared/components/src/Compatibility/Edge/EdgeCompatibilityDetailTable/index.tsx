import { useState } from 'react'

import { Typography } from 'antd'
import { sumBy }      from 'lodash'
import moment         from 'moment'
import { useIntl }    from 'react-intl'

import { Table, TableProps }                                                                                                                                                                                                                                                        from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                                                                                                                                                                   from '@acx-ui/feature-toggle'
import { useGetAvailableEdgeFirmwareVersionsQuery, useGetLatestEdgeFirmwareQuery, useGetVenueEdgeFirmwareListQuery, useStartEdgeFirmwareVenueUpdateNowMutation, useUpdateEdgeFirmwareNowMutation, useUpdateEdgeFirmwareVenueScheduleMutation, useUpdateEdgeVenueSchedulesMutation } from '@acx-ui/rc/services'
import { EdgeFirmwareVersion, EdgeUpdateScheduleRequest, EdgeVenueFirmware, EntityCompatibility, IncompatibilityFeatures, getCompatibilityFeatureDisplayName }                                                                                                                      from '@acx-ui/rc/utils'
import { EdgeScopes }                                                                                                                                                                                                                                                               from '@acx-ui/types'
import { filterByAccess, hasPermission }                                                                                                                                                                                                                                            from '@acx-ui/user'
import { compareVersions }                                                                                                                                                                                                                                                          from '@acx-ui/utils'

import { EdgeChangeScheduleDialog } from '../../../EdgeFirmware/ChangeScheduleDialog'
import { EdgeUpdateNowDialog }      from '../../../EdgeFirmware/UpdateNowDialog'

interface EdgeCompatibilityDetailTableData {
  featureName: string,
  requiredFw: string,
  incompatible?: number,
}

interface EdgeCompatibilityDetailTableProps {
  data: EntityCompatibility['incompatibleFeatures'],
  requirementOnly?: boolean,
  venueId?: string,  // is required when `requirementOnly === false`
}

const useColumns = () => {
  const { $t } = useIntl()

  const defaultColumns: TableProps<EdgeCompatibilityDetailTableData>['columns'] = [{
    title: $t({ defaultMessage: 'Incompatible Feature' }),
    key: 'featureName',
    dataIndex: 'featureName',
    defaultSortOrder: 'ascend',
    // eslint-disable-next-line max-len
    render: (_, row) => getCompatibilityFeatureDisplayName(row.featureName as IncompatibilityFeatures)
  }, {
    title: $t({ defaultMessage: 'Incompatible RUCKUS Edges' }),
    key: 'incompatible',
    dataIndex: 'incompatible',
    align: 'center'
  }, {
    title: $t({ defaultMessage: 'Min. Required Version' }),
    key: 'requiredFw',
    dataIndex: 'requiredFw'
  }]

  return defaultColumns
}
export const EdgeCompatibilityDetailTable = (props: EdgeCompatibilityDetailTableProps) => {
  const { $t } = useIntl()

  // eslint-disable-next-line max-len
  const isBatchOperationEnable = useIsSplitOn(Features.EDGE_FIRMWARE_NOTIFICATION_BATCH_OPERATION_TOGGLE)
  const { data, requirementOnly = false, venueId } = props

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

  const columns = useColumns()

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

  const rowActions: TableProps<EdgeCompatibilityDetailTableData>['rowActions'] = [{
    label: $t({ defaultMessage: 'Update Version Now' }),
    scopeKey: [EdgeScopes.UPDATE],
    visible: (selectedRows) => {
      if (!selectedRows?.length) return false

      return Boolean(latestReleaseVersion?.id &&
          ((venueFirmware?.versions?.[0].id
            && compareVersions(venueFirmware?.versions?.[0].id, latestReleaseVersion?.id) <= 0)
          || !venueFirmware?.versions?.[0].id))
    },
    onClick: (selectedRows: EdgeCompatibilityDetailTableData[]) => {
      setUpdateNowFwVer(selectedRows[0].requiredFw)
    }
  }, {
    label: $t({ defaultMessage: 'Schedule Version Update' }),
    scopeKey: [EdgeScopes.UPDATE],
    visible: (selectedRows) => {
      if (!selectedRows?.length) return false

      return !!venueFirmware?.nextSchedule
    },
    onClick: (selectedRows: EdgeCompatibilityDetailTableData[]) => {
      setScheduleUpdateFwVer(selectedRows[0].requiredFw)
    }
  }]

  const transformed = data.map(feature => ({
    ...feature.featureRequirement,
    incompatible: sumBy(feature.incompatibleDevices, (d) => d.count)
  })) as EdgeCompatibilityDetailTableData[]

  const showCheckbox = hasPermission({ scopes: [EdgeScopes.UPDATE] }) && !requirementOnly

  return <>
    <Typography.Text>
      {
        // eslint-disable-next-line max-len
        $t({ defaultMessage: '* Please note that all RUCKUS Edges in this <venueSingular></venueSingular> would be upgraded together.' })
      }
    </Typography.Text>
    <Table
      rowKey='featureName'
      columns={columns.filter(i => requirementOnly ? i.dataIndex !== 'incompatible' : true)}
      dataSource={transformed}
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

// eslint-disable-next-line max-len
const getFilteredScheduleVersions = (availableVersions?: EdgeFirmwareVersion[], venueFirmware?: EdgeVenueFirmware) => {
  if (!availableVersions || !venueFirmware) return availableVersions

  return availableVersions.filter(availableVersion => {
    return !venueFirmware.versions.some(version => version.id === availableVersion.id)
  })
}
import { useState } from 'react'

import { sumBy }   from 'lodash'
import moment      from 'moment'
import { useIntl } from 'react-intl'

import { Table, TableProps }                                                                                                                                                                from '@acx-ui/components'
import { useGetAvailableEdgeFirmwareVersionsQuery, useGetLatestEdgeFirmwareQuery, useGetVenueEdgeFirmwareListQuery, useUpdateEdgeFirmwareNowMutation, useUpdateEdgeVenueSchedulesMutation } from '@acx-ui/rc/services'
import { EdgeFirmwareVersion, EdgeUpdateScheduleRequest, EntityCompatibility }                                                                                                              from '@acx-ui/rc/utils'
import { EdgeScopes }                                                                                                                                                                       from '@acx-ui/types'
import { filterByAccess, hasPermission }                                                                                                                                                    from '@acx-ui/user'
import { compareVersions }                                                                                                                                                                  from '@acx-ui/utils'

import { EdgeChangeScheduleDialog } from '../../EdgeFirmware/ChangeScheduleDialog'
import { EdgeUpdateNowDialog }      from '../../EdgeFirmware/UpdateNowDialog'

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
    defaultSortOrder: 'ascend'
  }, {
    title: $t({ defaultMessage: 'Incompatible SmartEdges' }),
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

  const { data, requirementOnly = false, venueId } = props
  const [updateNowFwVer, setUpdateNowFwVer] = useState<string|undefined>()
  const [scheduleUpdateFwVer, setScheduleUpdateFwVer] = useState<string|undefined>()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const [updateNow] = useUpdateEdgeFirmwareNowMutation()
  const [updateSchedule] = useUpdateEdgeVenueSchedulesMutation()
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
      filter: { venueId }
    }
  }, {
    skip: requirementOnly,
    selectFromResult: ({ data }) => ({
      venueFirmware: data?.[0]
    })
  })

  const columns = useColumns()

  const handleUpdateNowSubmit = async (data: string) => {
    const payload = { version: data }

    try {
      await updateNow({
        params: { venueId },
        payload
      })
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
      await updateSchedule({
        params: { venueId },
        payload
      })
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
      availableVersions={getFilteredVersions(availableVersions, latestReleaseVersion?.id)}
    />
    <EdgeChangeScheduleDialog
      visible={!!scheduleUpdateFwVer}
      onCancel={() => setScheduleUpdateFwVer(undefined)}
      onSubmit={handleScheduleSubmit}
      availableVersions={getFilteredVersions(availableVersions, latestReleaseVersion?.id)}
    />
  </>
}

const getFilteredVersions = (availableVersions?: EdgeFirmwareVersion[], minVer?: string) => {
  if (!availableVersions || !minVer) return availableVersions
  return availableVersions.filter(fw => compareVersions(fw.id, minVer) >= 0)
}
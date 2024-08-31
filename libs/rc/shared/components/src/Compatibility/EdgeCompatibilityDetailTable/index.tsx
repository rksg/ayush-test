// import { useState } from 'react'

import { sumBy }   from 'lodash'
import { useIntl } from 'react-intl'

import { Table, TableProps }   from '@acx-ui/components'
import { EntityCompatibility } from '@acx-ui/rc/utils'
import { EdgeScopes }          from '@acx-ui/types'
import { hasPermission }       from '@acx-ui/user'

// import { EdgeChangeScheduleDialog } from '../../EdgeFirmware/ChangeScheduleDialog'
// import { EdgeUpdateNowDialog }      from '../../EdgeFirmware/UpdateNowDialog'

interface EdgeCompatibilityDetailTableData {
  featureName: string,
  requiredFw: string,
  incompatible?: number,
}

interface EdgeCompatibilityDetailTableProps {
  data: EntityCompatibility['incompatibleFeatures'],
  requirementOnly?: boolean,
  venueId?: string,
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
  // const { $t } = useIntl()

  const { data, requirementOnly = false } = props
  // const [updateNowVisible, setUpdateNowVisible] = useState<boolean>(false)
  // const [scheduleUpdateVisible, setScheduleUpdateVisible] = useState<boolean>(false)

  // const [updateNow] = useUpdateEdgeFirmwareNowMutation()
  // const [updateSchedule] = useUpdateEdgeVenueSchedulesMutation()

  const columns = useColumns()

  // const rowActions: TableProps<EdgeCompatibilityDetailTableData>['rowActions'] = [{
  //   label: $t({ defaultMessage: 'Update Version Now' }),
  //   scopeKey: [EdgeScopes.UPDATE],
  //   onClick: (selectedRows) => {
  //     const features = selectedRows.map(i => i.featureName)
  //     setUpdateNowVisible(true)
  //   }
  // }, {
  //   label: $t({ defaultMessage: 'Schedule Version Update' }),
  //   scopeKey: [EdgeScopes.UPDATE],
  //   onClick: (selectedRows) => {
  //     const features = selectedRows.map(i => i.featureName)

  //     setScheduleUpdateVisible(true)
  //   }
  // }]

  // const handleUpdateNowSubmit = async (data: string) => {
  //   const payload = { version: data }

  //   try {
  //     const requests = venueIds.map(vId => updateNow({
  //       params: { venueId: vId },
  //       payload
  //     }))
  //     Promise.all(requests).then(() => setSelectedRowKeys([]))
  //   } catch (error) {
  //     console.log(error) // eslint-disable-line no-console
  //   }
  // }

  // const handleScheduleSubmit = async (data: EdgeUpdateScheduleRequest) => {

  // }

  const transformed = data.map(feature => ({
    ...feature.featureRequirement,
    incompatible: sumBy(feature.incompatibleDevices, (d) => d.count)
  })) as EdgeCompatibilityDetailTableData[]

  return <>
    <Table
      rowKey='featureName'
      columns={columns.filter(i => requirementOnly ? i.dataIndex !== 'incompatible' : true)}
      dataSource={transformed}
      // rowActions={filterByAccess(rowActions)}
      rowSelection={hasPermission({ scopes: [EdgeScopes.UPDATE] }) && {
        type: 'checkbox'
      }}
    />
    {/*
    <EdgeUpdateNowDialog
      visible={updateNowVisible}
      onCancel={() => setUpdateNowVisible(false)}
      onSubmit={handleUpdateNowSubmit}
      // availableVersions?: EdgeFirmwareVersion[],
    />
    <EdgeChangeScheduleDialog
      visible={scheduleUpdateVisible}
      onCancel={() => setUpdateNowVisible(false)}
      onSubmit={handleScheduleSubmit}
    />
    */}
  </>
}
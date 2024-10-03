import { useState } from 'react'

import { Space }   from 'antd'
import { sumBy }   from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Table, TableProps }             from '@acx-ui/components'
import { IncompatibleFeature }           from '@acx-ui/rc/utils'
import { WifiScopes }                    from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'

import { SimpleListTooltip } from '../../SimpleListTooltip'
import { getFeatureTypeTag } from '../CompatibilityDrawer/utils'



interface ApCompatibilityDetailTableProps {
  data: IncompatibleFeature[],
  requirementOnly?: boolean,
  venueId?: string,  // is required when `requirementOnly === false`
}


const useColumns = () => {
  const { $t } = useIntl()

  const defaultColumns: TableProps<IncompatibleFeature>['columns'] = [{
    title: $t({ defaultMessage: 'Incompatible Feature' }),
    key: 'featureName',
    dataIndex: 'featureName',
    defaultSortOrder: 'ascend',
    render: function (_, row) {
      const { featureName, featureType } = row
      return <Space>{featureName} {getFeatureTypeTag(featureType)}</Space>
    }
  }, {
    title: $t({ defaultMessage: 'Incompatible APs' }),
    key: 'incompatibleDevices',
    dataIndex: 'incompatibleDevices',
    align: 'center',
    render: function (_, row) {
      const { incompatibleDevices } = row
      const totalCount = sumBy(incompatibleDevices, (d) => d.count)
      return incompatibleDevices ?
        <SimpleListTooltip
          items={incompatibleDevices.map(d => `${d.model}: ${d.count}`)}
          displayText={totalCount}
        /> : ''
    }
  }, {
    title: $t({ defaultMessage: 'Min. Required Version' }),
    key: 'requirements',
    dataIndex: 'requirements',
    render: function (_, row) {
      const { requirements } = row
      const firmwareString = requirements?.map((req) => req.firmware).join(', ')
      return firmwareString
    }
  }]

  return defaultColumns
}
export const ApCompatibilityDetailTable = (props: ApCompatibilityDetailTableProps) => {
  const { $t } = useIntl()

  const { data, requirementOnly = false, venueId } = props
  const [updateNowFwVer, setUpdateNowFwVer] = useState<string|undefined>()
  const [scheduleUpdateFwVer, setScheduleUpdateFwVer] = useState<string|undefined>()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  console.log('ApCompatibilityDetailTable data: ', data)

  /*
  const [updateNow] = useUpdateApFirmwareNowMutation()
  const [updateSchedule] = useUpdateApVenueSchedulesMutation()
  const { latestReleaseVersion } = useGetLatestApFirmwareQuery({}, {
    skip: requirementOnly,
    selectFromResult: ({ data }) => ({
      latestReleaseVersion: data?.[0]
    })
  })
  const { data: availableVersions } = useGetAvailableApFirmwareVersionsQuery({},
    { skip: requirementOnly })
  const { venueFirmware } = useGetVenueApFirmwareListQuery({
    payload: {
      filter: { venueId }
    }
  }, {
    skip: requirementOnly,
    selectFromResult: ({ data }) => {
      return { venueFirmware: data?.[0] }
    }
  })
 */

  const columns = useColumns()

  /*
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

  const handleScheduleSubmit = async (value: ApUpdateScheduleRequest) => {
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
*/

  const rowActions: TableProps<IncompatibleFeature>['rowActions'] = [{
    label: $t({ defaultMessage: 'Update Version Now' }),
    scopeKey: [WifiScopes.UPDATE],
    visible: (selectedRows) => {
      if (!selectedRows?.length) return false

      return true

      /*
      return Boolean(latestReleaseVersion?.id &&
            ((venueFirmware?.versions?.[0].id
              && compareVersions(venueFirmware?.versions?.[0].id, latestReleaseVersion?.id) <= 0)
            || !venueFirmware?.versions?.[0].id))
      */
    },
    onClick: (selectedRows) => {
      //setUpdateNowFwVer(selectedRows[0].requiredFw)
    }
  }, {
    label: $t({ defaultMessage: 'Schedule Version Update' }),
    scopeKey: [WifiScopes.UPDATE],
    visible: (selectedRows) => {
      if (!selectedRows?.length) return false

      return true//!!venueFirmware?.nextSchedule
    },
    onClick: (selectedRows) => {
      //setScheduleUpdateFwVer(selectedRows[0].requiredFw)
    }
  }]

  /*
  const transformed = data.map(feature => ({
    ...feature.featureRequirement,
    incompatible: sumBy(feature.incompatibleDevices, (d) => d.count)
  })) as ApCompatibilityDetailTableData[]
   */

  const showCheckbox = hasPermission({ scopes: [WifiScopes.UPDATE] }) && !requirementOnly

  return <>
    <Table
      rowKey='featureName'
      //columns={columns.filter(i => requirementOnly ? i.dataIndex !== 'incompatible' : true)}
      columns={columns}
      dataSource={data}
      rowActions={filterByAccess(rowActions)}
      rowSelection={showCheckbox && {
        type: 'checkbox',
        selectedRowKeys
      }}
    />
    {/*
    <UpdateNowDialogSwitcher
      visible={!!updateNowFwVer}
      onCancel={() => setUpdateNowFwVer(undefined)}
      onSubmit={handleUpdateNowSubmit}
      availableVersions={availableVersions}
    />
    <ApChangeScheduleDialog
      visible={!!scheduleUpdateFwVer}
      onCancel={() => setScheduleUpdateFwVer(undefined)}
      onSubmit={handleScheduleSubmit}
      availableVersions={getFilteredScheduleVersions(availableVersions, venueFirmware)}
    />
    */}
  </>
}

// eslint-disable-next-line max-len
/*
const getFilteredScheduleVersions = (availableVersions?: EdgeFirmwareVersion[], venueFirmware?: EdgeVenueFirmware) => {
  if (!availableVersions || !venueFirmware) return availableVersions

  return availableVersions.filter(availableVersion => {
    return !venueFirmware.versions.some(version => version.id === availableVersion.id)
  })
}
*/
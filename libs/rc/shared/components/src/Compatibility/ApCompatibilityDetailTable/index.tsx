/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'

import { Space, Typography } from 'antd'
import { sumBy }             from 'lodash'
//import moment                from 'moment-timezone'
import { useIntl } from 'react-intl'

import { Table, TableProps, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { useGetApModelFamiliesQuery } from '@acx-ui/rc/services'
import {
  ApModelFamily,
  ApRequirement,
  CompatibilitySelectedApInfo,
  IncompatibleFeature
} from '@acx-ui/rc/utils'
import { WifiScopes }                    from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'

import { SimpleListTooltip }    from '../../SimpleListTooltip'
import { ApModelFamiliesItem }  from '../ApModelFamiliesItem'
import { getFeatureTypeTag }    from '../CompatibilityDrawer/utils'
import {
  ApInfoWrapper,
  MinReqVersionTooltipWrapper
} from '../styledComponents'


const RequiredVersionTooltips = (props: {
  requirements?: ApRequirement[],
  apModelFamilies?: ApModelFamily[]
}) => {
  const { $t } = useIntl()
  const { requirements, apModelFamilies } = props
  const firmwareString = requirements?.map((req) => req.firmware).join(', ') ?? ''
  const requirementsLen = requirements?.length ?? 0

  const context = (requirements && apModelFamilies) ? requirements.map(((req, index) => {
    const { firmware, models } = req
    return (
      <MinReqVersionTooltipWrapper key={`min_req_${index}`}>
        <div className='title' children={`Version ${firmware}`} />
        <div className='label' children={$t({ defaultMessage: 'Supported AP Models' })} />
        <div className='list'>
          <ApModelFamiliesItem
            apModelFamilies={apModelFamilies}
            models={models}
          />
        </div>
        {(requirementsLen > (index+1)) && <hr /> }
      </MinReqVersionTooltipWrapper>
    )
  })) : ''

  return (
    <Tooltip title={context} placement='rightTop' dottedUnderline>{firmwareString}</Tooltip>
  )
}

const useColumns = (apModelFamilies?: ApModelFamily[]) => {
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
      return <RequiredVersionTooltips
        requirements={requirements}
        apModelFamilies={apModelFamilies}
      />
    }
  }]

  return defaultColumns
}

interface ApCompatibilityDetailTableProps {
  data: IncompatibleFeature[],
  requirementOnly?: boolean,
  venueId?: string,  // is required when `requirementOnly === false`
  apInfo?: CompatibilitySelectedApInfo
}

export const ApCompatibilityDetailTable = (props: ApCompatibilityDetailTableProps) => {
  const isSupportedFwModels = useIsSplitOn(Features.WIFI_EDA_BRANCH_LEVEL_SUPPORTED_MODELS_TOGGLE)
  const { $t } = useIntl()

  const { data, requirementOnly = false, venueId, apInfo } = props
  const { model='', firmwareVersion='' } = apInfo ?? {}

  const { data: apModelFamilies } = useGetApModelFamiliesQuery({}, {
    skip: !isSupportedFwModels,
    refetchOnMountOrArgChange: false
  })

  //const [updateNowFwVer, setUpdateNowFwVer] = useState<string|undefined>()
  //const [scheduleUpdateFwVer, setScheduleUpdateFwVer] = useState<string|undefined>()
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

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

  const columns = useColumns(apModelFamilies)

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
    {requirementOnly ?
      <ApInfoWrapper>
        <Space>
          <div className='label' children={$t({ defaultMessage: 'Model:' })}/>
          <div children={model} />
        </Space>
        <br/>
        <Space>
          <div className='label' children={$t({ defaultMessage: 'Current Version:' })}/>
          <div children={firmwareVersion} />
        </Space>
      </ApInfoWrapper> :
      <Typography.Text children={
        $t({ defaultMessage: '* Note that not all features are available on all access points.' })
      }/>
    }
    <Table
      rowKey='featureName'
      columns={columns.filter(i => requirementOnly ? i.dataIndex !== 'incompatibleDevices' : true)}
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
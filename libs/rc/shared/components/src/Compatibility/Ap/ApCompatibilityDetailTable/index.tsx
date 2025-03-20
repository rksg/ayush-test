/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react'

import { Space, Typography } from 'antd'
import { sumBy }             from 'lodash'
import { useIntl }           from 'react-intl'

import { Table, TableProps, Tooltip }    from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import {
  useGetApModelFamiliesQuery,
  useGetVenueApModelFirmwareListQuery
} from '@acx-ui/rc/services'
import {
  ApModelFamily,
  ApRequirement,
  CompatibilitySelectedApInfo,
  FirmwareVenuePerApModel,
  IncompatibilityFeatureGroups,
  IncompatibilityFeatures,
  IncompatibleFeature,
  getCompatibilityFeatureDisplayName
} from '@acx-ui/rc/utils'
import { WifiScopes }                    from '@acx-ui/types'
import { filterByAccess, hasPermission } from '@acx-ui/user'

import {
  ChangeSchedulePerApModelDialog,
  UpdateNowPerApModelDialog,
  useChangeScheduleVisiblePerApModel,
  useUpdateNowPerApModel
} from '../../../ApFirmware/VenueFirmwareListPerApModel'
import { SimpleListTooltip }     from '../../../SimpleListTooltip'
import { ApModelFamiliesItem }   from '../../CompatibilityDrawer/CompatibilityItem/ApModelFamiliesItem'
import { getFeatureTypeTag }     from '../../CompatibilityDrawer/utils'
import {
  ApInfoWrapper,
  MinReqVersionTooltipWrapper
} from '../../styledComponents'

export const IsApModelSupported = (curApModel?: string, requirements?: ApRequirement[]) => {
  if (!curApModel || !requirements) return true // skip check
  const supportReq = requirements.find((req) => req.models.includes(curApModel))
  return !!supportReq
}

const RequiredVersionTooltips = (props: {
  requirements?: ApRequirement[],
  apModelFamilies?: ApModelFamily[],
  curApModel?: string
}) => {
  const { $t } = useIntl()
  const { requirements, apModelFamilies, curApModel } = props
  const isApModelSupported = IsApModelSupported(curApModel, requirements)
  const firmwareString = isApModelSupported
    ? requirements?.map((req) => req.firmware).join(', ') ?? ''
    : $t({ defaultMessage: 'Model unsupported' })
  const requirementsLen = requirements?.length ?? 0

  const context = (requirements && apModelFamilies) ? requirements.map((req, index) => {
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
  }) : ''

  return (
    <Tooltip title={context} placement='rightTop' dottedUnderline>{firmwareString}</Tooltip>
  )
}

const useColumns = (apModelFamilies?: ApModelFamily[], model?: string) => {
  const { $t } = useIntl()

  const defaultColumns: TableProps<IncompatibleFeature>['columns'] = [{
    title: $t({ defaultMessage: 'Incompatible Feature' }),
    key: 'featureName',
    dataIndex: 'featureName',
    defaultSortOrder: 'ascend',
    render: function (_, row) {
      const { featureName, featureType } = row
      const featureDisplayName = getCompatibilityFeatureDisplayName(
        featureName as IncompatibilityFeatures & IncompatibilityFeatureGroups)
      return <Space>{featureDisplayName} {getFeatureTypeTag(featureType)}</Space>
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
    title: $t({ defaultMessage: 'Min. Required Versions' }),
    key: 'requirements',
    dataIndex: 'requirements',
    render: function (_, row) {
      const { requirements } = row
      return <RequiredVersionTooltips
        requirements={requirements}
        apModelFamilies={apModelFamilies}
        curApModel={model}
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
  const isUpgradeByModelEnabled = useIsSplitOn(Features.AP_FW_MGMT_UPGRADE_BY_MODEL)

  const { $t } = useIntl()

  const { data, requirementOnly = false, venueId, apInfo } = props
  const { model, firmwareVersion='' } = apInfo ?? {}

  const { data: apModelFamilies } = useGetApModelFamiliesQuery({}, {
    skip: !isSupportedFwModels,
    refetchOnMountOrArgChange: false
  })

  const { data: venueFirmware } = useGetVenueApModelFirmwareListQuery({ payload: {
    fields: [
      'name', 'id', 'isApFirmwareUpToDate',
      'currentApFirmwares', 'lastApFirmwareUpdate', 'nextApFirmwareSchedules'
    ],
    filters: { id: [venueId] }
  } }, {
    skip: requirementOnly || !isUpgradeByModelEnabled
  })

  const [ selectedRowKeys, setSelectedRowKeys ] = useState([])
  const [ selectedRows, setSelectedRows ] = useState<FirmwareVenuePerApModel[]>([])
  const { updateNowVisible, setUpdateNowVisible, handleUpdateNowCancel } = useUpdateNowPerApModel()
  // eslint-disable-next-line max-len
  const { changeScheduleVisible, setChangeScheduleVisible, handleChangeScheduleCancel } = useChangeScheduleVisiblePerApModel()

  const clearSelection = () => {
    setSelectedRowKeys([])
  }

  const afterAction = () => {
    clearSelection()
  }

  const columns = useColumns(apModelFamilies, model)

  const rowActions: TableProps<IncompatibleFeature>['rowActions'] = [{
    label: $t({ defaultMessage: 'Update Version Now' }),
    scopeKey: [WifiScopes.UPDATE],
    visible: (rows) => {
      if (!rows?.length || !venueFirmware?.data[0] ||
        venueFirmware.data[0].isApFirmwareUpToDate === true) return false

      return true
      // return (!rows?.length) ? false : true
    },
    onClick: (rows) => {
      if (venueFirmware?.data) {
        setSelectedRows(venueFirmware.data)
        setUpdateNowVisible(true)
      }
    }
  }, {
    label: $t({ defaultMessage: 'Schedule Version Update' }),
    scopeKey: [WifiScopes.UPDATE],
    visible: (rows) => {
      if (!rows?.length || !venueFirmware?.data[0] ||
        venueFirmware.data[0].isApFirmwareUpToDate === true) return false

      return true
      // return (!rows?.length) ? false : true
    },
    onClick: (rows) => {
      if (venueFirmware?.data) {
        setSelectedRows(venueFirmware.data)
        setChangeScheduleVisible(true)
      }
    }
  }]

  const showCheckbox = hasPermission({ scopes: [WifiScopes.UPDATE] })
    && !requirementOnly
    && isUpgradeByModelEnabled

  return <>
    {requirementOnly ?
      <ApInfoWrapper>
        <Space>
          <div className='label' children={$t({ defaultMessage: 'Model:' })}/>
          <div children={model ?? ''} />
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
    {updateNowVisible && selectedRows && <UpdateNowPerApModelDialog
      onCancel={handleUpdateNowCancel}
      afterSubmit={afterAction}
      selectedVenuesFirmwares={selectedRows}
    />}
    {changeScheduleVisible && selectedRows && <ChangeSchedulePerApModelDialog
      onCancel={handleChangeScheduleCancel}
      afterSubmit={afterAction}
      selectedVenuesFirmwares={selectedRows}
    />}
  </>
}

/*
const getUpgradeFwModels = (rows: IncompatibleFeature[], venueFwData: FirmwareVenuePerApModel) => {
  const models = new Set<string>()
  rows.forEach(row => {
    row.incompatibleDevices?.forEach(device => {
      models.add(device.model)
    })
  })
}
*/

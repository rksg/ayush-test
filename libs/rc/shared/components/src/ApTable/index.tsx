/* eslint-disable max-len */
import { forwardRef, Ref } from 'react'

import { Badge, Space } from 'antd'
import { useIntl }      from 'react-intl'

import {
  ColumnType,
  deviceStatusColors,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import {
  Features,
  useIsSplitOn
} from '@acx-ui/feature-toggle'
import { LeafSolidIcon } from '@acx-ui/icons'
import {
  ApDeviceStatusEnum,
  APExtended,
  APExtendedGrouped,
  ApExtraParams,
  APMeshRole,
  APView,
  DeviceConnectionStatus,
  getPowerSavingStatusEnabledApStatus,
  NewAPExtendedGrouped,
  NewAPModelExtended,
  PowerSavingStatusEnum,
  TableQuery,
  TableResult,
  transformApStatus,
  transformDisplayText
} from '@acx-ui/rc/utils'
import { RequestPayload } from '@acx-ui/types'


import { NewApTable } from './NewApTable'
import { OldApTable } from './OldApTable'

export const defaultApPayload = {
  searchString: '',
  searchTargetFields: ['name', 'model', 'IP', 'apMac', 'tags', 'serialNumber'],
  fields: [
    'name', 'deviceStatus', 'model', 'IP', 'apMac', 'venueName',
    'switchName', 'meshRole', 'clients', 'deviceGroupName',
    'apStatusData', 'tags', 'serialNumber',
    'venueId', 'poePort', 'fwVersion', 'apRadioDeploy', 'powerSavingStatus'
  ]
}

const handleStatusColor = (status: DeviceConnectionStatus) => {
  return `var(${deviceStatusColors[status]})`
}

export const channelTitleMap: Record<keyof ApExtraParams, string> = {
  channel24: '2.4 GHz',
  channel50: '5 GHz',
  channelL50: 'LO 5 GHz',
  channelU50: 'HI 5 GHz',
  channel60: '6 GHz'
}
export const transformMeshRole = (value: APMeshRole) => {
  let meshRole = ''
  switch (value) {
    case APMeshRole.EMAP:
      meshRole = 'eMAP'
      break
    default:
      meshRole = value
      break
  }
  return transformDisplayText(meshRole)
}

export const retriedApIds = (
  result: TableResult<APExtended|NewAPModelExtended|APExtendedGrouped|NewAPExtendedGrouped, ApExtraParams>,
  hasGroupBy:boolean
) => {
  const apIds:string[] = []
  if (hasGroupBy) {
    result.data?.forEach(item => {
      (item as unknown as { aps: APExtended[] }).aps?.forEach(ap => apIds.push(ap.serialNumber))
    })
  } else {
    result.data?.forEach(ap => apIds.push(ap.serialNumber))
  }
  return apIds
}

export const APStatus = (
  { status, showText = true, powerSavingStatus = PowerSavingStatusEnum.NORMAL }: { status: ApDeviceStatusEnum, showText?: boolean, powerSavingStatus?: PowerSavingStatusEnum }
) => {
  const intl = useIntl()
  const { $t } = useIntl()
  const apStatus = transformApStatus(intl, status, APView.AP_LIST)
  const isSupportPowerSavingMode = useIsSplitOn(Features.WIFI_POWER_SAVING_MODE_TOGGLE)

  return (
    <Space>
      <Badge color={handleStatusColor(apStatus.deviceStatus)}
        text={showText ? apStatus.message : ''}
      />
      { isSupportPowerSavingMode &&
        getPowerSavingStatusEnabledApStatus(status, powerSavingStatus) &&
        <Tooltip
          title={$t({ defaultMessage: 'Device is controlled by Energy Saving AI. Radio may not be broadcasting.' })}
          placement='bottom'
        >
          <LeafSolidIcon/>
        </Tooltip>}
    </Space>
  )
}

export type ApTableRefType = { openImportDrawer: ()=>void }

export interface ApTableProps<T>
  extends Omit<TableProps<T>, 'columns'> {
  tableQuery?: TableQuery<T, RequestPayload<unknown>, ApExtraParams>
  searchable?: boolean
  enableActions?: boolean
  filterables?: { [key: string]: ColumnType['filterable'] }
  enableGroups?: boolean,
  enableApCompatibleCheck?: boolean
}

export const ApTable = forwardRef((props : ApTableProps<APExtended|NewAPModelExtended>, ref?: Ref<ApTableRefType>) => {
  const isUseWifiRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)

  return isUseWifiRbacApi ?
    <NewApTable {...(props as ApTableProps<NewAPModelExtended>)} ref={ref} /> :
    <OldApTable {...(props as ApTableProps<APExtended|APExtendedGrouped>)} ref={ref} />
})

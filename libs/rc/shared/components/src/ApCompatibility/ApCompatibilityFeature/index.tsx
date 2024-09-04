
import { ReactElement } from 'react'

import { MessageDescriptor, useIntl } from 'react-intl'

import { Button, cssStr }                     from '@acx-ui/components'
import { Features }                           from '@acx-ui/feature-toggle'
import { ApDeviceStatusEnum, EdgeStatusEnum } from '@acx-ui/rc/utils'

import { useIsEdgeFeatureReady }                                                            from '../../useEdgeActions'
import { CheckMarkCircleSolidIcon, WarningTriangleSolidIcon, UnknownIcon, UnavailableIcon } from '../styledComponents'

import { messageMapping } from './messageMapping'

export type ApCompatibilityFeatureProps = {
    count?: number,
    deviceStatus?: ApDeviceStatusEnum | EdgeStatusEnum | string
    onClick: () => void
  }

export const ApCompatibilityFeature = (props: ApCompatibilityFeatureProps) => {
  const { $t } = useIntl()
  const { count, deviceStatus, onClick } = props
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)

  if (!isEdgeCompatibilityEnabled) {
    if (count === undefined) {
      return (<><UnknownIcon/> {$t(messageMapping.unknown)}</>)
    } else if (count === 0) {
      return (<><CheckMarkCircleSolidIcon/> {$t(messageMapping.fullyCompatible)}</>)
    } else {
      return <>
        <WarningTriangleSolidIcon/>
        <Button
          type='link'
          style={{ fontSize: cssStr('--acx-body-4-font-size') }}
          onClick={onClick}>
          {$t(messageMapping.partiallyIncompatible)}
        </Button>
      </>
    }
  }

  const checkResult = getCompatibilityMessage(deviceStatus, count)

  const isPartialCompatible = !!count && ApDeviceStatusEnum.OPERATIONAL

  return (isPartialCompatible
    ? <>
      {checkResult.icon}
      <Button
        type='link'
        style={{ fontSize: cssStr('--acx-body-4-font-size') }}
        onClick={onClick}>
        {$t(checkResult.message)}
      </Button>
    </>
    : <>{checkResult.icon} {$t(checkResult.message)}</>
  )
}

const getCompatibilityMessage = (
  status: ApDeviceStatusEnum | EdgeStatusEnum | string | undefined,
  count: number | undefined
): {
  message: MessageDescriptor,
  icon: ReactElement
} => {

  switch(status) {
    case ApDeviceStatusEnum.OPERATIONAL:
      if (count === undefined)
        return {
          message: messageMapping.unknown,
          icon: <UnknownIcon/>
        }

      return count === 0
        ? {
          message: messageMapping.fullyCompatible,
          icon: <CheckMarkCircleSolidIcon/>
        }
        : {
          message: messageMapping.partiallyIncompatible,
          icon: <WarningTriangleSolidIcon/>
        }

    case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
    case ApDeviceStatusEnum.INITIALIZING:
    case ApDeviceStatusEnum.OFFLINE:
    case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
    case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
    case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
    case ApDeviceStatusEnum.HEARTBEAT_LOST:
      return {
        message: messageMapping.unavailable,
        icon: <UnavailableIcon/>
      }

    case ApDeviceStatusEnum.APPLYING_FIRMWARE:
    case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
    case ApDeviceStatusEnum.REBOOTING:
      return {
        message: messageMapping.checking,
        icon: <UnknownIcon/>
      }

    default:
      return {
        message: messageMapping.unknown,
        icon: <UnknownIcon/>
      }
  }
}
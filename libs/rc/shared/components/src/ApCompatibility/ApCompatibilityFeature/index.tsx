
import { ReactElement } from 'react'

import { Space }                      from 'antd'
import { MessageDescriptor, useIntl } from 'react-intl'

import { Button, cssStr }                     from '@acx-ui/components'
import { ApDeviceStatusEnum, EdgeStatusEnum } from '@acx-ui/rc/utils'

import {
  CheckMarkCircleSolidIcon,
  WarningTriangleSolidIcon,
  UnknownIcon,
  UnavailableIcon,
  CheckingIcon
} from '../styledComponents'

import { messageMapping } from './messageMapping'

export type ApCompatibilityFeatureProps = {
    count?: number,
    deviceStatus?: ApDeviceStatusEnum | EdgeStatusEnum | string,
    onClick: () => void
  }

export const ApCompatibilityFeature = (props: ApCompatibilityFeatureProps) => {
  const { $t } = useIntl()
  const { count, deviceStatus, onClick } = props

  const checkResult = getCompatibilityMessage(deviceStatus, count)
  const isPartialCompatible = !!count && (deviceStatus === ApDeviceStatusEnum.OPERATIONAL)

  return <Space size='small'>
    {isPartialCompatible
      ? <>
        {checkResult.icon}
        <Button
          type='link'
          style={{ fontSize: cssStr('--acx-body-4-font-size') }}
          onClick={onClick}>
          {$t(checkResult.message)}
        </Button>
      </>
      : <>{checkResult.icon}{$t(checkResult.message)}</>
    }
  </Space>
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
        icon: <CheckingIcon />
      }

    default:
      return {
        message: messageMapping.unknown,
        icon: <UnknownIcon/>
      }
  }
}
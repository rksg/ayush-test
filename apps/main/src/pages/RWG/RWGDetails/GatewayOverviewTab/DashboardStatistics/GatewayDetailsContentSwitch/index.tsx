import React from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  ContentSwitcher,
  ContentSwitcherProps
} from '@acx-ui/components'
import { useGetGatewayDetailsQuery }                                                                 from '@acx-ui/rc/services'
import { GatewayDetailsDiskMemory, GatewayDetailsGeneral, GatewayDetailsHardware, GatewayDetailsOs } from '@acx-ui/rc/utils'

import GatewayDetailsDiskMemoryContent from './GatewayDetailsDiskMemoryContent'
import GatewayDetailsGeneralContent    from './GatewayDetailsGeneralContent'
import GatewayDetailsHardwareContent   from './GatewayDetailsHardwareContent'
import GatewayDetailsOSContent         from './GatewayDetailsOSContent'


export default function GatewayDetailsContentSwitch () {
  const { $t } = useIntl()
  const { tenantId, gatewayId } = useParams()

  const { data: gatewayDetails } =
      useGetGatewayDetailsQuery({ params: { tenantId, gatewayId } }, { skip: !gatewayId })

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'General' }),
      value: 'general',
      children: <GatewayDetailsGeneralContent
        gatewayDetails={gatewayDetails?.gatewayDetailsGeneral as GatewayDetailsGeneral}
      />
    },
    {
      label: $t({ defaultMessage: 'Hardware' }),
      value: 'hardware',
      children: <GatewayDetailsHardwareContent
        gatewayDetails={gatewayDetails?.gatewayDetailsHardware as GatewayDetailsHardware}
      />
    },
    {
      label: $t({ defaultMessage: 'OS' }),
      value: 'os',
      children: <GatewayDetailsOSContent
        gatewayDetails={gatewayDetails?.gatewayDetailsOs as GatewayDetailsOs}
      />
    },
    {
      label: $t({ defaultMessage: 'Disk & Memory' }),
      value: 'diskMemory',
      children: <GatewayDetailsDiskMemoryContent
        gatewayDetails={gatewayDetails?.gatewayDetailsDiskMemory as GatewayDetailsDiskMemory}
      />
    }
  ]
  return (
    <ContentSwitcher
      tabDetails={tabDetails}
      size='small'
      align='left'
    />
  )
}

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  ContentSwitcher,
  ContentSwitcherProps,
  Loader
} from '@acx-ui/components'
import { useGetGatewayDetailsQuery }                                               from '@acx-ui/rc/services'
import { GatewayDetailsDiskMemory, GatewayDetailsGeneral, GatewayDetailsHardware } from '@acx-ui/rc/utils'

import GatewayDetailsDiskMemoryContent from './GatewayDetailsDiskMemoryContent'
import GatewayDetailsGeneralContent    from './GatewayDetailsGeneralContent'
import GatewayDetailsHardwareContent   from './GatewayDetailsHardwareContent'


export default function GatewayDetailsContentSwitch () {
  const { $t } = useIntl()
  const { tenantId, gatewayId, venueId, clusterNodeId } = useParams()

  const { data: gatewayDetails, isLoading: isDetailsLoading } =
      useGetGatewayDetailsQuery({ params: { tenantId, gatewayId, venueId, clusterNodeId } },
        { skip: !gatewayId })

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
      label: $t({ defaultMessage: 'Disk & Memory' }),
      value: 'diskMemory',
      children: <GatewayDetailsDiskMemoryContent
        gatewayDetails={gatewayDetails?.gatewayDetailsDiskMemory as GatewayDetailsDiskMemory}
      />
    }
  ]
  return (
    <Loader states={[{
      isLoading: isDetailsLoading
    }]}>
      <ContentSwitcher
        tabDetails={tabDetails}
        size='small'
        align='left'
      />
    </Loader>
  )
}

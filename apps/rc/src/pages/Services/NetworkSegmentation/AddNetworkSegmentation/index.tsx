import { useIntl } from 'react-intl'

import { PageHeader }                                                                  from '@acx-ui/components'
import { useCreateNetworkSegmentationGroupMutation }                                   from '@acx-ui/rc/services'
import { getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'

import { NetworkSegmentationForm } from '../NetworkSegmentationForm'
import { AccessSwitchForm }        from '../NetworkSegmentationForm/AccessSwitchForm'
import { DistributionSwitchForm }  from '../NetworkSegmentationForm/DistributionSwitchForm'
import { GeneralSettingsForm }     from '../NetworkSegmentationForm/GeneralSettingsForm'
import { SmartEdgeForm }           from '../NetworkSegmentationForm/SmartEdgeForm'
import { SummaryForm }             from '../NetworkSegmentationForm/SummaryForm'
import { WirelessNetworkForm }     from '../NetworkSegmentationForm/WirelessNetworkForm'

const AddNetworkSegmentation = () => {

  const { $t } = useIntl()
  const [createNetworkSegmentationGroup] = useCreateNetworkSegmentationGroupMutation()
  const tablePath = getServiceRoutePath(
    { type: ServiceType.NETWORK_SEGMENTATION, oper: ServiceOperation.LIST })

  const steps = [
    {
      title: $t({ defaultMessage: 'General Settings' }),
      content: <GeneralSettingsForm />
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      content: <SmartEdgeForm />
    },
    {
      title: $t({ defaultMessage: 'Wireless Network' }),
      content: <WirelessNetworkForm />
    },
    {
      title: $t({ defaultMessage: 'Dist. Switch' }),
      content: <DistributionSwitchForm />
    },
    {
      title: $t({ defaultMessage: 'Access Switch' }),
      content: <AccessSwitchForm />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    }
  ]

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Network Segmentation Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Network Segmentation' }), link: tablePath }
        ]}
      />
      <NetworkSegmentationForm
        steps={steps}
        initialValues={{
          vxlanTunnelProfileId: ''
        }}
        onFinish={createNetworkSegmentationGroup}
      />
    </>
  )
}

export default AddNetworkSegmentation

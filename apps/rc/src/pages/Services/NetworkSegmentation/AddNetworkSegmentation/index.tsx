
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'

import { PageHeader, showToast, StepsFormNew, useStepFormContext } from '@acx-ui/components'
import { useCreateNetworkSegmentationGroupMutation }               from '@acx-ui/rc/services'
import { useTenantLink }                                           from '@acx-ui/react-router-dom'

import { NetworkSegmentationGroupForm } from '../NetworkSegmentationForm'
import AccessSwitchSetting              from '../NetworkSegmentationForm/AccessSwitchForm/AccessSwitchSetting'
import DistributionSwitchSetting        from '../NetworkSegmentationForm/DistributionSwitchForm/DistributionSwitchSetting'
import { GeneralSettingsForm }          from '../NetworkSegmentationForm/GeneralSettingsForm'
import { SmartEdgeForm }                from '../NetworkSegmentationForm/SmartEdgeForm'
import { SummaryForm }                  from '../NetworkSegmentationForm/SummaryForm'
import { WirelessNetworkForm }          from '../NetworkSegmentationForm/WirelessNetworkForm'


const AddNetworkSegmentation = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const { form } = useStepFormContext<NetworkSegmentationGroupForm>()
  const [createNetworkSegmentationGroup] = useCreateNetworkSegmentationGroupMutation()

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
      content: <DistributionSwitchSetting />
    },
    {
      title: $t({ defaultMessage: 'Access Switch' }),
      content: <AccessSwitchSetting />
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <SummaryForm />
    }
  ]

  const handleFinish = async (formData: NetworkSegmentationGroupForm) => {
    const payload = {
      name: formData.name,
      vxlanTunnelProfileId: formData.vxlanTunnelProfileId,
      venueInfos: [{
        venueId: formData.venueId
      }],
      edgeInfos: [{
        edgeId: formData.edgeId,
        segments: formData.segments,
        devices: formData.devices,
        dhcpInfoId: formData.dhcpId,
        dhcpPoolId: formData.poolId
      }],
      networkIds: formData.networkIds
    }
    try{
      await createNetworkSegmentationGroup({ payload }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Network Segmentation Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <StepsFormNew
        form={form}
        onCancel={() => navigate(linkToServices)}
        onFinish={handleFinish}
      >
        {
          steps.map((item, index) =>
            <StepsFormNew.StepForm
              name={(index).toString()}
              title={item.title}
              onFinish={async () => true}
            >
              {item.content}
            </StepsFormNew.StepForm>)
        }
      </StepsFormNew>
    </>
  )
}

export default AddNetworkSegmentation

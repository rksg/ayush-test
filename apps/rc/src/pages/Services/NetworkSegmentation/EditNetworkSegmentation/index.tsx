
import { useEffect } from 'react'

import { Form }                   from 'antd'
import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { PageHeader, StepsFormNew }                                                           from '@acx-ui/components'
import { useGetNetworkSegmentationGroupByIdQuery, useUpdateNetworkSegmentationGroupMutation } from '@acx-ui/rc/services'
import { useTenantLink }                                                                      from '@acx-ui/react-router-dom'

import { NetworkSegmentationGroupForm } from '../NetworkSegmentationForm'
import { GeneralSettingsForm }          from '../NetworkSegmentationForm/GeneralSettingsForm'
import { SmartEdgeForm }                from '../NetworkSegmentationForm/SmartEdgeForm'
import { WirelessNetworkForm }          from '../NetworkSegmentationForm/WirelessNetworkForm'

const EditNetworkSegmentation = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const linkToServices = useTenantLink('/services')
  const [form] = Form.useForm()
  const { data: nsgData } = useGetNetworkSegmentationGroupByIdQuery({ params })
  const [updateNetworkSegmentationGroup] = useUpdateNetworkSegmentationGroupMutation()

  const steps = [
    {
      title: $t({ defaultMessage: 'General Settings' }),
      content: <GeneralSettingsForm editMode />
    },
    {
      title: $t({ defaultMessage: 'SmartEdge' }),
      content: <SmartEdgeForm />
    },
    {
      title: $t({ defaultMessage: 'Wireless Network' }),
      content: <WirelessNetworkForm />
    }
  ]

  useEffect(() => {
    if(nsgData) {
      form.setFieldValue('name', nsgData.name)
      // form.setFieldValue('tags', nsgData.ta)
      form.setFieldValue('venueId', nsgData.venueInfos[0]?.venueId)
      form.setFieldValue('edgeId', nsgData.edgeInfos[0]?.edgeId)
      form.setFieldValue('segments', nsgData.edgeInfos[0]?.segments)
      form.setFieldValue('devices', nsgData.edgeInfos[0]?.devices)
      form.setFieldValue('dhcpId', nsgData.edgeInfos[0]?.dhcpInfoId)
      form.setFieldValue('poolId', nsgData.edgeInfos[0]?.dhcpPoolId)
      form.setFieldValue('vxlanTunnelProfileId', nsgData.vxlanTunnelProfileId)
      form.setFieldValue('networkIds', nsgData.networkIds)
    }
  }, [nsgData])

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
      await updateNetworkSegmentationGroup({ params, payload }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit Network Segmentation Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <StepsFormNew
        form={form}
        onCancel={() => navigate(linkToServices)}
        onFinish={handleFinish}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
      >
        {
          steps.map((item, index) =>
            <StepsFormNew.StepForm
              key={`step-${index}`}
              name={index.toString()}
              title={item.title}
            >
              {item.content}
            </StepsFormNew.StepForm>)
        }
      </StepsFormNew>
    </>
  )
}

export default EditNetworkSegmentation

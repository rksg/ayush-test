import { useEffect } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { PageHeader }                                                                         from '@acx-ui/components'
import { useGetNetworkSegmentationGroupByIdQuery, useUpdateNetworkSegmentationGroupMutation } from '@acx-ui/rc/services'

import { NetworkSegmentationForm } from '../NetworkSegmentationForm'
import { AccessSwitchForm }        from '../NetworkSegmentationForm/AccessSwitchForm'
import { DistributionSwitchForm }  from '../NetworkSegmentationForm/DistributionSwitchForm'
import { GeneralSettingsForm }     from '../NetworkSegmentationForm/GeneralSettingsForm'
import { SmartEdgeForm }           from '../NetworkSegmentationForm/SmartEdgeForm'
import { WirelessNetworkForm }     from '../NetworkSegmentationForm/WirelessNetworkForm'

const EditNetworkSegmentation = () => {

  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const { data: nsgData } = useGetNetworkSegmentationGroupByIdQuery({ params })
  const [updateNetworkSegmentationGroup] = useUpdateNetworkSegmentationGroupMutation()

  useEffect(() => {
    form.resetFields()
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
      form.setFieldValue('distributionSwitchInfos', nsgData.distributionSwitchInfos)
      form.setFieldValue('accessSwitchInfos', nsgData.accessSwitchInfos)
      form.setFieldValue('originalAccessSwitchInfos', nsgData.accessSwitchInfos)
    }
  }, [nsgData])

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
    },
    {
      title: $t({ defaultMessage: 'Dist. Switch' }),
      content: <DistributionSwitchForm />
    },
    {
      title: $t({ defaultMessage: 'Access Switch' }),
      content: <AccessSwitchForm />
    }
  ]

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit Network Segmentation Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <NetworkSegmentationForm
        form={form}
        steps={steps}
        onFinish={updateNetworkSegmentationGroup}
        editMode
      />
    </>
  )
}

export default EditNetworkSegmentation
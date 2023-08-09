import { useEffect } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, PageHeader }                                                                 from '@acx-ui/components'
import { Features, useIsSplitOn }                                                             from '@acx-ui/feature-toggle'
import { useGetNetworkSegmentationGroupByIdQuery, useUpdateNetworkSegmentationGroupMutation } from '@acx-ui/rc/services'
import { getServiceListRoutePath, getServiceRoutePath, ServiceOperation, ServiceType }        from '@acx-ui/rc/utils'

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
  const {
    data: nsgData,
    isLoading: isNsgDataLoading
  } = useGetNetworkSegmentationGroupByIdQuery({ params })
  const [updateNetworkSegmentationGroup] = useUpdateNetworkSegmentationGroupMutation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tablePath = getServiceRoutePath(
    { type: ServiceType.NETWORK_SEGMENTATION, oper: ServiceOperation.LIST })

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
      form.setFieldValue('originalDistributionSwitchInfos', nsgData.distributionSwitchInfos)
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
      content: <SmartEdgeForm editMode />
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
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Network Segmentation' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <Loader states={[{ isLoading: isNsgDataLoading }]}>
        <NetworkSegmentationForm
          form={form}
          steps={steps}
          onFinish={updateNetworkSegmentationGroup}
          editMode
        />
      </Loader>
    </>
  )
}

export default EditNetworkSegmentation

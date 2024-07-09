import { useEffect } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, PageHeader }                                                                 from '@acx-ui/components'
import { useGetNetworkSegmentationGroupByIdQuery, useUpdateNetworkSegmentationGroupMutation } from '@acx-ui/rc/services'
import { ServiceOperation, ServiceType, getServiceListRoutePath, getServiceRoutePath }        from '@acx-ui/rc/utils'

import { PersonalIdentityNetworkForm }             from '../PersonalIdentityNetworkForm'
import { AccessSwitchForm }                        from '../PersonalIdentityNetworkForm/AccessSwitchForm'
import { DistributionSwitchForm }                  from '../PersonalIdentityNetworkForm/DistributionSwitchForm'
import { GeneralSettingsForm }                     from '../PersonalIdentityNetworkForm/GeneralSettingsForm'
import { PersonalIdentityNetworkFormDataProvider } from '../PersonalIdentityNetworkForm/PersonalIdentityNetworkFormContext'
import { SmartEdgeForm }                           from '../PersonalIdentityNetworkForm/SmartEdgeForm'
import { WirelessNetworkForm }                     from '../PersonalIdentityNetworkForm/WirelessNetworkForm'
const EditPersonalIdentityNetwork = () => {

  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const {
    data: nsgData,
    isLoading: isNsgDataLoading
  } = useGetNetworkSegmentationGroupByIdQuery({ params })
  const [updateNetworkSegmentationGroup] = useUpdateNetworkSegmentationGroupMutation()
  const tablePath = getServiceRoutePath(
    { type: ServiceType.NETWORK_SEGMENTATION, oper: ServiceOperation.LIST })

  useEffect(() => {
    if(nsgData) {
      form.resetFields()
      form.setFieldsValue({
        name: nsgData.name,
        venueId: nsgData.venueInfos[0]?.venueId,
        edgeId: nsgData.edgeInfos[0]?.edgeId,
        segments: nsgData.edgeInfos[0]?.segments,
        devices: nsgData.edgeInfos[0]?.devices,
        dhcpId: nsgData.edgeInfos[0]?.dhcpInfoId,
        poolId: nsgData.edgeInfos[0]?.dhcpPoolId,
        vxlanTunnelProfileId: nsgData.vxlanTunnelProfileId,
        networkIds: nsgData.networkIds,
        distributionSwitchInfos: nsgData.distributionSwitchInfos,
        accessSwitchInfos: nsgData.accessSwitchInfos,
        originalDistributionSwitchInfos: nsgData.distributionSwitchInfos,
        originalAccessSwitchInfos: nsgData.accessSwitchInfos,
        personaGroupId: nsgData.venueInfos[0]?.personaGroupId
      })
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
        title={$t({ defaultMessage: 'Edit Personal Identity Network Service' })}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'Personal Identity Network' }), link: tablePath }
        ]}
      />
      <PersonalIdentityNetworkFormDataProvider venueId={nsgData?.venueInfos[0]?.venueId}>
        <Loader states={[{ isLoading: isNsgDataLoading }]}>
          <PersonalIdentityNetworkForm
            form={form}
            steps={steps}
            onFinish={updateNetworkSegmentationGroup}
            editMode
          />
        </Loader>
      </PersonalIdentityNetworkFormDataProvider>
    </>
  )
}

export default EditPersonalIdentityNetwork

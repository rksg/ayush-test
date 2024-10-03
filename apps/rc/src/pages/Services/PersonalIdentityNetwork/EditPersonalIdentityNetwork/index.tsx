import { useMemo } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, PageHeader }                                                          from '@acx-ui/components'
import { useEdgePinActions }                                                           from '@acx-ui/rc/components'
import { useGetEdgePinByIdQuery }                                                      from '@acx-ui/rc/services'
import { ServiceOperation, ServiceType, getServiceListRoutePath, getServiceRoutePath } from '@acx-ui/rc/utils'

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
  const { editPin } = useEdgePinActions()

  const {
    data: nsgData,
    isLoading: isNsgDataLoading,
    isFetching: isNsgDataFetching
  } = useGetEdgePinByIdQuery({ params })

  const tablePath = getServiceRoutePath(
    { type: ServiceType.NETWORK_SEGMENTATION, oper: ServiceOperation.LIST })

  const initFormValues = useMemo(() => {
    return {
      id: nsgData?.id,
      name: nsgData?.name,
      venueId: nsgData?.venueId,
      edgeClusterId: nsgData?.edgeClusterInfo?.edgeClusterId,
      segments: nsgData?.edgeClusterInfo?.segments,
      devices: nsgData?.edgeClusterInfo?.devices,
      dhcpId: nsgData?.edgeClusterInfo?.dhcpInfoId,
      poolId: nsgData?.edgeClusterInfo?.dhcpPoolId,
      vxlanTunnelProfileId: nsgData?.vxlanTunnelProfileId,
      personaGroupId: nsgData?.personaGroupId,
      networkIds: nsgData?.tunneledWlans.map(nw => nw.networkId),
      distributionSwitchInfos: nsgData?.distributionSwitchInfos,
      accessSwitchInfos: nsgData?.accessSwitchInfos,
      originalDistributionSwitchInfos: nsgData?.distributionSwitchInfos,
      originalAccessSwitchInfos: nsgData?.accessSwitchInfos
    }
  }, [nsgData])

  const steps = [
    {
      title: $t({ defaultMessage: 'General Settings' }),
      content: <GeneralSettingsForm editMode />
    },
    {
      title: $t({ defaultMessage: 'RUCKUS Edge' }),
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
      <PersonalIdentityNetworkFormDataProvider
        venueId={nsgData?.venueId}
      >
        <Loader states={[{ isLoading: isNsgDataLoading || isNsgDataFetching }]}>
          <PersonalIdentityNetworkForm
            form={form}
            steps={steps}
            onFinish={editPin}
            editMode
            initialValues={initFormValues}
          />
        </Loader>
      </PersonalIdentityNetworkFormDataProvider>
    </>
  )
}

export default EditPersonalIdentityNetwork

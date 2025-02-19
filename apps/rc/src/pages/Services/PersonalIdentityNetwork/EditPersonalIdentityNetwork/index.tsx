import { useMemo } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, PageHeader }                                                                                    from '@acx-ui/components'
import { Features }                                                                                              from '@acx-ui/feature-toggle'
import { useEdgePinActions, useIsEdgeFeatureReady }                                                              from '@acx-ui/rc/components'
import { useGetEdgePinByIdQuery }                                                                                from '@acx-ui/rc/services'
import { getServiceListRoutePath, getServiceRoutePath, PersonalIdentityNetworks, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'

import {
  AccessSwitchStep,
  DistributionSwitchStep,
  GeneralSettingsStep,
  getStepsByTopologyType,
  NetworkTopologyStep,
  PersonalIdentityNetworkForm,
  PrerequisiteStep,
  SmartEdgeStep,
  SummaryStep,
  WirelessNetworkStep
} from '../PersonalIdentityNetworkForm'
import { NetworkTopologyType }                     from '../PersonalIdentityNetworkForm/NetworkTopologyForm'
import { PersonalIdentityNetworkFormDataProvider } from '../PersonalIdentityNetworkForm/PersonalIdentityNetworkFormContext'

const EditPersonalIdentityNetwork = () => {

  const { $t } = useIntl()
  const isEdgePinEnhanceReady = useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE)
  const params = useParams()
  const [form] = Form.useForm()
  const { editPin } = useEdgePinActions()

  const {
    data: pinData,
    isLoading: isPinDataLoading,
    isFetching: isPinDataFetching
  } = useGetEdgePinByIdQuery({ params })

  const tablePath = getServiceRoutePath(
    { type: ServiceType.PIN, oper: ServiceOperation.LIST })

  const initFormValues = useMemo(() => {
    return {
      id: pinData?.id,
      name: pinData?.name,
      venueId: pinData?.venueId,
      edgeClusterId: pinData?.edgeClusterInfo?.edgeClusterId,
      segments: pinData?.edgeClusterInfo?.segments,
      dhcpId: pinData?.edgeClusterInfo?.dhcpInfoId,
      poolId: pinData?.edgeClusterInfo?.dhcpPoolId,
      vxlanTunnelProfileId: pinData?.vxlanTunnelProfileId,
      personaGroupId: pinData?.personaGroupId,
      networkIds: pinData?.tunneledWlans.map(nw => nw.networkId),
      distributionSwitchInfos: pinData?.distributionSwitchInfos,
      accessSwitchInfos: pinData?.accessSwitchInfos,
      originalDistributionSwitchInfos: pinData?.distributionSwitchInfos,
      originalAccessSwitchInfos: pinData?.accessSwitchInfos
    }
  }, [pinData])

  const steps = useMemo(() => {
    return isEdgePinEnhanceReady ?
      getStepsByEditData(pinData):
      // eslint-disable-next-line max-len
      [GeneralSettingsStep, SmartEdgeStep, WirelessNetworkStep, DistributionSwitchStep, AccessSwitchStep]
  }, [pinData])

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
        venueId={pinData?.venueId}
      >
        <Loader states={[{ isLoading: isPinDataLoading || isPinDataFetching }]}>
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

const getStepsByEditData = (data?: PersonalIdentityNetworks) => {
  let steps = getStepsByTopologyType(NetworkTopologyType.Wireless)
  if(data?.distributionSwitchInfos?.length || data?.accessSwitchInfos?.length) {
    if(data?.tunneledWlans?.length) {
      steps = getStepsByTopologyType(NetworkTopologyType.ThreeTier)
    } else {
      steps = getStepsByTopologyType(NetworkTopologyType.TwoTier)
    }
  }
  return steps.filter(step => step.title !== PrerequisiteStep.title &&
    step.title !== NetworkTopologyStep.title &&
    step.title !== SummaryStep.title)
}

export default EditPersonalIdentityNetwork
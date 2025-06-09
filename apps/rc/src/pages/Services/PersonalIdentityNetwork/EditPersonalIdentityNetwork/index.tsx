import { useMemo } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, PageHeader }                                                                              from '@acx-ui/components'
import { Features }                                                                                        from '@acx-ui/feature-toggle'
import { useEdgePinActions, useIsEdgeFeatureReady }                                                        from '@acx-ui/rc/components'
import { PersonalIdentityNetworkApiVersion, useGetEdgePinByIdQuery, useGetTunnelProfileViewDataListQuery } from '@acx-ui/rc/services'
import { ServiceType, useServiceListBreadcrumb }                                                           from '@acx-ui/rc/utils'

import {
  AccessSwitchStep,
  DistributionSwitchStep,
  GeneralSettingsStep,
  PersonalIdentityNetworkForm,
  SmartEdgeStep,
  WirelessNetworkStep
} from '../PersonalIdentityNetworkForm'
import { PersonalIdentityNetworkFormDataProvider } from '../PersonalIdentityNetworkForm/PersonalIdentityNetworkFormContext'

// eslint-disable-next-line max-len
const pinWizardSteps = [GeneralSettingsStep, SmartEdgeStep, WirelessNetworkStep, DistributionSwitchStep, AccessSwitchStep]

const EditPersonalIdentityNetwork = () => {
  const isL2GreEnabled = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)

  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const { editPin } = useEdgePinActions()

  const {
    data: pinData,
    isLoading: isPinDataLoading,
    isFetching: isPinDataFetching
  } = useGetEdgePinByIdQuery({
    params,
    customHeaders: isL2GreEnabled ? PersonalIdentityNetworkApiVersion.v1001 : undefined
  })

  const getTunnelProfilePayload = {
    fields: ['destinationEdgeClusterId'],
    filters: { id: [params.serviceId] }
  }
  const { currentTunnelProfileData } = useGetTunnelProfileViewDataListQuery({
    payload: getTunnelProfilePayload
  }, {
    skip: !isL2GreEnabled || !pinData?.vxlanTunnelProfileId,
    selectFromResult: ({ data }) => ({
      currentTunnelProfileData: data?.data?.[0]
    })
  })

  const initFormValues = useMemo(() => {
    return {
      id: pinData?.id,
      name: pinData?.name,
      venueId: pinData?.venueId,
      // eslint-disable-next-line max-len
      edgeClusterId: pinData?.edgeClusterInfo?.edgeClusterId || currentTunnelProfileData?.destinationEdgeClusterId,
      segments: pinData?.edgeClusterInfo?.segments || pinData?.networkSegmentConfiguration.segments,
      // eslint-disable-next-line max-len
      dhcpId: pinData?.edgeClusterInfo?.dhcpInfoId || pinData?.networkSegmentConfiguration.dhcpInfoId,
      // eslint-disable-next-line max-len
      poolId: pinData?.edgeClusterInfo?.dhcpPoolId || pinData?.networkSegmentConfiguration.dhcpPoolId,
      vxlanTunnelProfileId: pinData?.vxlanTunnelProfileId,
      personaGroupId: pinData?.personaGroupId,
      networkIds: pinData?.tunneledWlans.map(nw => nw.networkId),
      distributionSwitchInfos: pinData?.distributionSwitchInfos,
      accessSwitchInfos: pinData?.accessSwitchInfos,
      originalDistributionSwitchInfos: pinData?.distributionSwitchInfos,
      originalAccessSwitchInfos: pinData?.accessSwitchInfos
    }
  }, [pinData, currentTunnelProfileData])

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit Personal Identity Network Service' })}
        breadcrumb={useServiceListBreadcrumb(ServiceType.PIN)}
      />
      <PersonalIdentityNetworkFormDataProvider
        venueId={pinData?.venueId}
      >
        <Loader states={[{ isLoading: isPinDataLoading || isPinDataFetching }]}>
          <PersonalIdentityNetworkForm
            form={form}
            steps={pinWizardSteps}
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

import { useMemo } from 'react'

import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Loader, PageHeader }                                                                              from '@acx-ui/components'
import { Features }                                                                                        from '@acx-ui/feature-toggle'
import { useEdgePinActions }                                                                               from '@acx-ui/rc/components'
import { PersonalIdentityNetworkApiVersion, useGetEdgePinByIdQuery, useGetTunnelProfileViewDataListQuery } from '@acx-ui/rc/services'
import { ServiceType, useIsEdgeFeatureReady, useServiceListBreadcrumb }                                    from '@acx-ui/rc/utils'

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
    isFetching: isPinDataFetching
  } = useGetEdgePinByIdQuery({
    params,
    customHeaders: isL2GreEnabled ? PersonalIdentityNetworkApiVersion.v1001 : undefined
  })

  const {
    currentTunnelProfileData,
    isFetching: isTunnelFetching
  } = useGetTunnelProfileViewDataListQuery({
    payload: {
      fields: ['destinationEdgeClusterId'],
      filters: { id: [pinData?.vxlanTunnelProfileId] }
    }
  }, {
    skip: !isL2GreEnabled || !pinData?.vxlanTunnelProfileId,
    selectFromResult: ({ data, isFetching }) => ({
      currentTunnelProfileData: data?.data?.[0],
      isFetching
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
        <Loader states={[{ isLoading: isPinDataFetching || isTunnelFetching }]}>
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

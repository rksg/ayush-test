import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader }                                                                                                                                         from '@acx-ui/components'
import { Features }                                                                                                                                       from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady, useTunnelProfileActions }                                                                                                 from '@acx-ui/rc/components'
import { useGetEdgeSdLanP2ViewDataListQuery, useGetEdgeSdLanViewDataListQuery, useGetNetworkSegmentationViewDataListQuery, useGetTunnelProfileByIdQuery } from '@acx-ui/rc/services'
import { getTunnelProfileFormDefaultValues, isDefaultTunnelProfile as getIsDefaultTunnelProfile, TunnelProfileFormType }                                  from '@acx-ui/rc/utils'
import { useParams }                                                                                                                                      from '@acx-ui/react-router-dom'

import { TunnelProfileForm } from '../TunnelProfileForm'

const EditTunnelProfile = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const [form] = Form.useForm()
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)

  const { data: tunnelProfileData, isFetching } = useGetTunnelProfileByIdQuery(
    { params: { id: policyId } }
  )
  const { updateTunnelProfile } = useTunnelProfileActions()

  const { isSdLanP1Used, isSdLanP1Fetching } = useGetEdgeSdLanViewDataListQuery(
    { payload: {
      filters: { tunnelProfileId: [policyId], guestTunnelProfileId: [policyId] }
    } },
    {
      skip: isEdgeSdLanHaReady || !isEdgeSdLanReady,
      selectFromResult: ({ data, isFetching }) => ({
        isSdLanP1Used: !!data?.data?.[0],
        isTestUsed: data?.data?.some(sdlan => !!sdlan.networkIds),
        isSdLanP1Fetching: isFetching
      })
    }
  )

  const { isSdLanHaUsed, isDMZUsed, isSdLanHaFetching } = useGetEdgeSdLanP2ViewDataListQuery(
    { payload: {
      filters: { tunnelProfileId: [policyId], guestTunnelProfileId: [policyId] }
    } },
    {
      skip: !isEdgeSdLanHaReady,
      selectFromResult: ({ data, isFetching }) => ({
        isSdLanHaUsed: !!data?.data[0],
        isDMZUsed: data?.data?.some(sdlan => sdlan.isGuestTunnelEnabled),
        isSdLanHaFetching: isFetching
      })
    }
  )

  const {
    nsgId,
    isNSGFetching
  } = useGetNetworkSegmentationViewDataListQuery({
    payload: {
      filters: { vxlanTunnelProfileId: [policyId] }
    }
  }, {
    skip: !(isEdgeSdLanReady || isEdgeSdLanHaReady),
    selectFromResult: ({ data, isFetching }) => {
      return {
        nsgId: data?.data[0]?.id,
        isNSGFetching: isFetching
      }
    }
  })

  const handelUpdate = (data: TunnelProfileFormType) =>
    updateTunnelProfile(policyId || '', data)

  const isSdLanUsed = isSdLanHaUsed || isSdLanP1Used
  const isDefaultTunnelProfile = getIsDefaultTunnelProfile(tunnelProfileData)
  const formInitValues = getTunnelProfileFormDefaultValues(tunnelProfileData)
  formInitValues.disabledFields = []
  if (nsgId || isSdLanUsed)
    formInitValues.disabledFields.push('type')

  if (isDMZUsed)
    formInitValues.disabledFields.push('mtuType')

  return (
    <Loader states={[{
      isLoading: isFetching || isSdLanP1Fetching || isSdLanHaFetching || isNSGFetching
    }]}>
      <TunnelProfileForm
        form={form}
        title={$t({ defaultMessage: 'Edit Tunnel Profile' })}
        submitButtonLabel={$t({ defaultMessage: 'Apply' })}
        onFinish={handelUpdate}
        isDefaultTunnel={isDefaultTunnelProfile}
        initialValues={formInitValues}
      />
    </Loader>
  )
}

export default EditTunnelProfile
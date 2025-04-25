import { useEffect, useMemo } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader }                                         from '@acx-ui/components'
import { Features }                                       from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady, useTunnelProfileActions } from '@acx-ui/rc/components'
import {
  useGetEdgeMvSdLanViewDataListQuery,
  useGetEdgePinViewDataListQuery,
  useGetEdgeSdLanViewDataListQuery,
  useGetTunnelProfileByIdQuery,
  useGetTunnelProfileViewDataListQuery
} from '@acx-ui/rc/services'
import {
  isDefaultTunnelProfile as getIsDefaultTunnelProfile,
  getTunnelProfileFormDefaultValues,
  TunnelProfileFormType,
  TunnelProfileViewData,
  TunnelTypeEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { TunnelProfileForm } from '../TunnelProfileForm'

const EditTunnelProfile = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const [form] = Form.useForm()
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)

  const { data: tunnelProfileData, isFetching } = useGetTunnelProfileByIdQuery(
    { params: { id: policyId } }
  )


  const { tunnelProfileViewData, isTunnelViewFetching } = useGetTunnelProfileViewDataListQuery(
    { payload: { filters: { id: [policyId] } } },
    {
      selectFromResult: ({ data, isFetching }) => ({
        tunnelProfileViewData: data?.data?.[0] || {} as TunnelProfileViewData,
        isTunnelViewFetching: isFetching
      })
    }
  )

  const { updateTunnelProfileOperation } = useTunnelProfileActions()

  const { isSdLanP1Used, isSdLanP1Fetching } = useGetEdgeSdLanViewDataListQuery(
    { payload: {
      fields: [
        'tunnelProfileId'
      ],
      filters: { tunnelProfileId: [policyId] }
    } },
    {
      skip: isEdgeSdLanHaReady || !isEdgeSdLanReady,
      selectFromResult: ({ data, isFetching }) => ({
        isSdLanP1Used: !!data?.data?.[0],
        isSdLanP1Fetching: isFetching
      })
    }
  )

  const { isSdLanHaUsed, isDMZUsed, isSdLanHaFetching } = useGetEdgeMvSdLanViewDataListQuery(
    { payload: {
      fields: [
        'isGuestTunnelEnabled',
        'tunnelProfileId',
        'guestTunnelProfileId',
        'tunneledWlans'
      ]
    } },
    {
      skip: !isEdgeSdLanHaReady,
      selectFromResult: ({ data, isFetching }) => ({
        isSdLanHaUsed: data?.data.some(sdlan => {
          return sdlan.tunnelProfileId === policyId
               || (sdlan.isGuestTunnelEnabled && sdlan.guestTunnelProfileId === policyId)
               || sdlan.tunneledWlans?.some(wlan => wlan.forwardingTunnelProfileId === policyId)
        }),
        isDMZUsed: data?.data?.some(sdlan =>
          (sdlan.isGuestTunnelEnabled && sdlan.guestTunnelProfileId === policyId)
          // eslint-disable-next-line max-len
          || (sdlan.tunneledWlans?.some(wlan => wlan.forwardingTunnelProfileId === policyId && wlan.forwardingTunnelType === TunnelTypeEnum.VXLAN_GPE ))
        ),
        isSdLanHaFetching: isFetching
      })
    }
  )

  const {
    pinId,
    isPinFetching
  } = useGetEdgePinViewDataListQuery({
    payload: {
      fields: ['id'],
      filters: { vxlanTunnelProfileId: [policyId] }
    }
  }, {
    skip: !(isEdgeSdLanReady || isEdgeSdLanHaReady) || !isEdgePinReady,
    selectFromResult: ({ data, isFetching }) => {
      return {
        pinId: data?.data[0]?.id,
        isPinFetching: isFetching
      }
    }
  })

  const isSdLanUsed = isSdLanHaUsed || isSdLanP1Used
  const isDefaultTunnelProfile = getIsDefaultTunnelProfile(tunnelProfileData) && !isEdgeL2greReady
  // eslint-disable-next-line max-len
  const loaderLoading = isFetching || isSdLanP1Fetching || isSdLanHaFetching || isPinFetching || isTunnelViewFetching
  const formInitValues = useMemo(() => {
    const initValues = getTunnelProfileFormDefaultValues(tunnelProfileData)
    initValues.disabledFields = []
    if (pinId || isSdLanUsed){
      initValues.disabledFields.push('type')
      if (isEdgeL2greReady) {
        initValues.disabledFields.push('tunnelType')
        initValues.disabledFields.push('destinationIpAddress')
        initValues.disabledFields.push('edgeClusterId')
      }
    }

    if (isDMZUsed)
      initValues.disabledFields.push('mtuType')

    if (pinId || isDMZUsed)
      initValues.disabledFields.push('natTraversalEnabled')

    if (!isTunnelViewFetching) {
      initValues.edgeClusterId = tunnelProfileViewData.destinationEdgeClusterId
    }

    return initValues
  }, [tunnelProfileData, tunnelProfileViewData, pinId, isSdLanUsed, isDMZUsed, isEdgeL2greReady])

  useEffect(() => {
    if (!loaderLoading) {
      form.resetFields()
      form.setFieldsValue(formInitValues)
    }
  }, [loaderLoading, formInitValues])

  const handelOnFinish = (data: TunnelProfileFormType) =>
    updateTunnelProfileOperation(policyId || '', data, formInitValues)

  return (
    <Loader states={[{
      isLoading: loaderLoading
    }]}>
      <TunnelProfileForm
        form={form}
        title={$t({ defaultMessage: 'Edit Tunnel Profile' })}
        submitButtonLabel={$t({ defaultMessage: 'Apply' })}
        onFinish={handelOnFinish}
        isDefaultTunnel={isDefaultTunnelProfile}
        editMode={true}
      />
    </Loader>
  )
}

export default EditTunnelProfile

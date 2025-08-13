import { useMemo } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader }                                              from '@acx-ui/components'
import { Features }                                            from '@acx-ui/feature-toggle'
import {
  useGetEdgeMvSdLanViewDataListQuery,
  useGetEdgePinViewDataListQuery,
  useGetTunnelProfileTemplateQuery,
  useGetTunnelProfileTemplateViewDataListSkipRecRewriteQuery
} from '@acx-ui/rc/services'
import {
  isDefaultTunnelProfile as getIsDefaultTunnelProfile,
  getTunnelProfileFormDefaultValues,
  TunnelProfileFormType,
  TunnelProfileViewData,
  TunnelTypeEnum,
  useIsEdgeFeatureReady
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { TunnelProfileForm }       from '../TunnelProfileForm'
import { useTunnelProfileActions } from '../TunnelProfileForm/useTunnelProfileActions'

export const EditTunnelProfileTemplate = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const [form] = Form.useForm()
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeL2greReady = useIsEdgeFeatureReady(Features.EDGE_L2OGRE_TOGGLE)

  const { data: tunnelProfileData, isFetching } = useGetTunnelProfileTemplateQuery(
    { params: { id: policyId } }
  )


  // eslint-disable-next-line max-len
  const { tunnelProfileViewData, isTunnelViewFetching } = useGetTunnelProfileTemplateViewDataListSkipRecRewriteQuery(
    { payload: { filters: { id: [policyId] } } },
    {
      selectFromResult: ({ data, isFetching }) => ({
        tunnelProfileViewData: data?.data?.[0] || {} as TunnelProfileViewData,
        isTunnelViewFetching: isFetching
      })
    }
  )

  const { updateTunnelProfileTemplateOperation } = useTunnelProfileActions()


  const { isSdLanHaUsed, isDMZUsed, isSdLanFetching } = useGetEdgeMvSdLanViewDataListQuery(
    { payload: {
      fields: [
        'isGuestTunnelEnabled',
        'tunnelProfileId',
        'guestTunnelProfileId',
        'tunneledWlans'
      ]
    } },
    {
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
        isSdLanFetching: isFetching
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
    skip: !isEdgePinReady,
    selectFromResult: ({ data, isFetching }) => {
      return {
        pinId: data?.data[0]?.id,
        isPinFetching: isFetching
      }
    }
  })

  const isSdLanUsed = isSdLanHaUsed
  const isDefaultTunnelProfile = getIsDefaultTunnelProfile(tunnelProfileData) && !isEdgeL2greReady
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

  const handelOnFinish = (data: TunnelProfileFormType) =>
    updateTunnelProfileTemplateOperation(policyId || '', data, formInitValues)

  // eslint-disable-next-line max-len
  const loaderLoading = isFetching || isSdLanFetching || isPinFetching || isTunnelViewFetching

  return (
    <Loader states={[{
      isLoading: loaderLoading
    }]}>
      <TunnelProfileForm
        form={form}
        title={$t({ defaultMessage: 'Edit Tunnel Profile Template' })}
        submitButtonLabel={$t({ defaultMessage: 'Apply' })}
        onFinish={handelOnFinish}
        isDefaultTunnel={isDefaultTunnelProfile}
        initialValues={formInitValues}
        editMode={true}
        isTemplate
      />
    </Loader>
  )
}

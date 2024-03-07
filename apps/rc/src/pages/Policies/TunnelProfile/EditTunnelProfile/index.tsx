import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader }                                                                                                        from '@acx-ui/components'
import { Features }                                                                                                      from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady, useTunnelProfileActions }                                                                from '@acx-ui/rc/components'
import { useGetEdgeSdLanViewDataListQuery, useGetNetworkSegmentationViewDataListQuery, useGetTunnelProfileByIdQuery }    from '@acx-ui/rc/services'
import { getTunnelProfileFormDefaultValues, isDefaultTunnelProfile as getIsDefaultTunnelProfile, TunnelProfileFormType } from '@acx-ui/rc/utils'
import { useParams }                                                                                                     from '@acx-ui/react-router-dom'

import { TunnelProfileForm } from '../TunnelProfileForm'

const EditTunnelProfile = () => {
  const { $t } = useIntl()
  const { policyId } = useParams()
  const [form] = Form.useForm()
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const {
    data: tunnelProfileData,
    isFetching
  } = useGetTunnelProfileByIdQuery(
    { params: { id: policyId } }
  )
  const { updateTunnelProfile } = useTunnelProfileActions()

  const { edgeSdLanData, isSdLanFetching } = useGetEdgeSdLanViewDataListQuery(
    { payload: {
      filters: { tunnelProfileId: [policyId] }
    } },
    {
      skip: !isEdgeSdLanReady,
      selectFromResult: ({ data, isFetching }) => ({
        edgeSdLanData: data?.data?.[0],
        isSdLanFetching: isFetching
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
    skip: !isEdgeSdLanReady,
    selectFromResult: ({ data, isFetching }) => {
      return {
        nsgId: data?.data[0]?.id,
        isNSGFetching: isFetching
      }
    }
  })

  const handelUpdate = (data: TunnelProfileFormType) =>
    updateTunnelProfile(policyId || '', data)

  const isDefaultTunnelProfile = getIsDefaultTunnelProfile(tunnelProfileData)
  const formInitValues = getTunnelProfileFormDefaultValues(tunnelProfileData)
  if (nsgId || edgeSdLanData)
    formInitValues.disabledFields = ['type']

  return (
    <Loader states={[{
      isLoading: isFetching || isSdLanFetching || isNSGFetching
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

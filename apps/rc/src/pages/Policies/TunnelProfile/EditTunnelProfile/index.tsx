
import { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader }                                         from '@acx-ui/components'
import { TunnelProfileFormType, useTunnelProfileActions } from '@acx-ui/rc/components'
import { useGetTunnelProfileByIdQuery }                   from '@acx-ui/rc/services'
import { useParams }                                      from '@acx-ui/react-router-dom'

import { TunnelProfileForm }     from '../TunnelProfileForm'
import { ageTimeUnitConversion } from '../util'

const EditTunnelProfile = () => {

  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const { data: tunnelProfileData, isLoading } = useGetTunnelProfileByIdQuery(
    { params: { id: params.policyId } }
  )
  const { updateTunnelProfile } = useTunnelProfileActions()

  const isDefaultTunnelProfile = params.tenantId === tunnelProfileData?.id

  useEffect(() => {
    const ageTime = tunnelProfileData?.ageTimeMinutes || 20
    const result = ageTimeUnitConversion(ageTime)
    form.setFieldsValue({
      name: tunnelProfileData?.name,
      mtuSize: tunnelProfileData?.mtuSize,
      mtuType: tunnelProfileData?.mtuType,
      forceFragmentation: tunnelProfileData?.forceFragmentation,
      ageTimeMinutes: result?.value,
      ageTimeUnit: result?.unit,
      type: tunnelProfileData?.type
    })
  }, [form, tunnelProfileData])

  const handelUpdate = (data: TunnelProfileFormType) =>
    updateTunnelProfile(params.policyId || '', data)

  return (
    <Loader states={[{ isLoading }]}>
      <TunnelProfileForm
        form={form}
        title={$t({ defaultMessage: 'Edit Tunnel Profile' })}
        submitButtonLabel={$t({ defaultMessage: 'Apply' })}
        onFinish={handelUpdate}
        isDefaultTunnel={isDefaultTunnelProfile}
      />
    </Loader>
  )
}

export default EditTunnelProfile

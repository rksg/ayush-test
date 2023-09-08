
import { useEffect } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Loader }                       from '@acx-ui/components'
import { useTunnelProfileActions }      from '@acx-ui/rc/components'
import { useGetTunnelProfileByIdQuery } from '@acx-ui/rc/services'
import { useParams }                    from '@acx-ui/react-router-dom'

import { TunnelProfileForm }     from '../TunnelProfileForm'
import { ageTimeUnitConversion } from '../util'

const EditTunnelProfile = () => {

  const { $t } = useIntl()
  const params = useParams()
  const [form] = Form.useForm()
  const { data: tunnelProfileData, isLoading } = useGetTunnelProfileByIdQuery(
    { params: { id: params.policyId } }
  )
  const { updateTunnelProfile } = useTunnelProfileActions(params)

  const isDefaultTunnelProfile = params.tenantId === tunnelProfileData?.id

  useEffect(() => {
    form.setFieldValue('name', tunnelProfileData?.name)
    form.setFieldValue('mtuSize', tunnelProfileData?.mtuSize)
    form.setFieldValue('mtuType', tunnelProfileData?.mtuType)
    form.setFieldValue('forceFragmentation', tunnelProfileData?.forceFragmentation)

    const ageTime = tunnelProfileData?.ageTimeMinutes || 20
    const result = ageTimeUnitConversion(ageTime)
    form.setFieldValue('ageTimeMinutes', result?.value)
    form.setFieldValue('ageTimeUnit', result?.unit)
  }, [form, tunnelProfileData])

  return (
    <Loader states={[{ isLoading }]}>
      <TunnelProfileForm
        form={form}
        title={$t({ defaultMessage: 'Edit Tunnel Profile' })}
        submitButtonLabel={$t({ defaultMessage: 'Apply' })}
        onFinish={updateTunnelProfile}
        isDefaultTunnel={isDefaultTunnelProfile}
      />
    </Loader>
  )
}

export default EditTunnelProfile

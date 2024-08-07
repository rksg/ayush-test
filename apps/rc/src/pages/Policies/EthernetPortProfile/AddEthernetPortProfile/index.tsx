import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { useCreateEthernetPortProfileMutation, useUpdateEthernetPortProfileRadiusIdMutation } from '@acx-ui/rc/services'
import { EthernetPortProfileFormType }                                                        from '@acx-ui/rc/utils'

import EthernetPortProfileForm, { requestPreProcess } from '../EthernetPortProfileForm'

const AddEthernetPortProfile = () => {
  const { $t } = useIntl()
  const [ createEthernetPortProfile ] = useCreateEthernetPortProfileMutation()
  const [ updateEthernetPortProfileRadiusId ] = useUpdateEthernetPortProfileRadiusIdMutation()
  const [form] = Form.useForm()

  const handleAddEthernetPortProfile = async (data: EthernetPortProfileFormType) => {
    try {
      const payload = requestPreProcess(data)
      const createResult =
        await createEthernetPortProfile({ payload }).unwrap()

      if (payload.authRadiusId) {
        updateEthernetPortProfileRadiusId({ params: {
          id: createResult.id,
          radiusId: payload.authRadiusId
        } })
      }

      if (payload.accountingRadiusId) {
        updateEthernetPortProfileRadiusId({ params: {
          id: createResult.id,
          radiusId: payload.accountingRadiusId
        } })
      }

    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <EthernetPortProfileForm
      title={$t({ defaultMessage: 'Add Ethernet Port Profile' })}
      submitButtonLabel={$t({ defaultMessage: 'Add' })}
      onFinish={handleAddEthernetPortProfile}
      form={form}
    />
  )
}

export default AddEthernetPortProfile
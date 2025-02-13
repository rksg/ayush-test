import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { useCreateEthernetPortProfileMutation, useUpdateEthernetPortProfileRadiusIdMutation } from '@acx-ui/rc/services'
import { EthernetPortProfileFormType }                                                        from '@acx-ui/rc/utils'

import { EthernetPortProfileForm, requestPreProcess } from '../EthernetPortProfileForm'

interface AddEthernetPortProfileFormProps {
  isEmbedded?: boolean
  onClose?: ()=>void
  updateInstance?: (createId:string)=>void
}


export const AddEthernetPortProfile = (props: AddEthernetPortProfileFormProps) => {
  const { $t } = useIntl()
  const [ createEthernetPortProfile ] = useCreateEthernetPortProfileMutation()
  const [ updateEthernetPortProfileRadiusId ] = useUpdateEthernetPortProfileRadiusIdMutation()
  const [form] = Form.useForm()
  const { onClose, isEmbedded, updateInstance } = props

  const handleAddEthernetPortProfile = async (data: EthernetPortProfileFormType) => {
    try {
      const payload = requestPreProcess(data)
      const createResult =
        await createEthernetPortProfile({ payload }).unwrap()
      const createId = createResult.response?.id
      if (createId) {
        if (payload.authRadiusId) {
          updateEthernetPortProfileRadiusId({ params: {
            id: createId,
            radiusId: payload.authRadiusId
          } })
        }

        if (payload.accountingRadiusId) {
          updateEthernetPortProfileRadiusId({ params: {
            id: createId,
            radiusId: payload.accountingRadiusId
          } })
        }

        updateInstance?.(createId)
      }

    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error)
    }
  }

  return (
    <Row>
      <Col span={12}>
        <EthernetPortProfileForm
          submitButtonLabel={$t({ defaultMessage: 'Add' })}
          onFinish={handleAddEthernetPortProfile}
          form={form}
          onCancel={onClose}
          isEmbedded={isEmbedded}
        />
      </Col>
    </Row>

  )
}
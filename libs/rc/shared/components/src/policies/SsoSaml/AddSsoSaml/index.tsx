import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import {  useCreateIdentityProviderProfileMutation } from '@acx-ui/rc/services'
import {  IdentityProviderProfileFormType }          from '@acx-ui/rc/utils'

import { SsoSamlForm, requestPreProcess } from '../SsoSamlForm'

interface AddSsoSamlProps {
  isEmbedded?: boolean
  onClose?: ()=>void
  updateInstance?: (createId:string)=>void
}


export const AddSsoSaml = (props: AddSsoSamlProps) => {
  const { $t } = useIntl()
  const [ createIdentityProviderProfileProfile ] = useCreateIdentityProviderProfileMutation()
  // const [ updateEthernetPortProfileRadiusId ] = useUpdateEthernetPortProfileRadiusIdMutation()
  const [form] = Form.useForm()
  const { onClose, isEmbedded, updateInstance } = props

  const handleAddSsoSaml = async (data: IdentityProviderProfileFormType) => {
    try {
      const payload = requestPreProcess(data)
      const createResult =
        await createIdentityProviderProfileProfile({ payload }).unwrap()
      const createId = createResult.response?.id
      if (createId) {
        // if (payload.authRadiusId) {
        //   updateEthernetPortProfileRadiusId({ params: {
        //     id: createId,
        //     radiusId: payload.authRadiusId
        //   } })
        // }

        // if (payload.accountingRadiusId) {
        //   updateEthernetPortProfileRadiusId({ params: {
        //     id: createId,
        //     radiusId: payload.accountingRadiusId
        //   } })
        // }

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
        <SsoSamlForm
          title={$t({ defaultMessage: 'Add SSO/SAML' })}
          form={form}
          submitButtonLabel={$t({ defaultMessage: 'Add' })}
          onFinish={handleAddSsoSaml}
          onCancel={onClose}
          isEmbedded={isEmbedded}
        />
      </Col>
    </Row>

  )
}
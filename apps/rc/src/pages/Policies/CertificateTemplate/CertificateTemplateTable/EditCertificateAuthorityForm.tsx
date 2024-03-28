import { Form, Input } from 'antd'

import { ModalRef }                                                                   from '@acx-ui/components'
import { MAX_CERTIFICATE_PER_TENANT }                                                 from '@acx-ui/rc/components'
import { useEditCertificateAuthorityMutation, useLazyGetCertificateAuthoritiesQuery } from '@acx-ui/rc/services'
import { CertificateAuthority, checkObjectNotExists, trailingNorLeadingSpaces }       from '@acx-ui/rc/utils'
import { getIntl }                                                                    from '@acx-ui/utils'





export default function EditCertificateAuthorityForm (props: {
  data: CertificateAuthority,
  modal: ModalRef
}) {
  const { $t } = getIntl()
  const { data, modal } = props
  const [form] = Form.useForm<CertificateAuthority>()
  const [editCA] = useEditCertificateAuthorityMutation()


  const handleEditCA = async () => {
    await form.validateFields()
    const params = { caId: data.id }
    const formData = form.getFieldsValue()
    const { name, description } = formData
    await editCA({ params, payload: { name, description } })
  }

  const onFieldsChange = () => {
    modal.update({
      okButtonProps: { disabled: form.getFieldsError().some(item => item.errors.length > 0) },
      onOk: handleEditCA
    })
  }

  const [getCertificateAuthorities] = useLazyGetCertificateAuthoritiesQuery()

  const nameValidator = async (value: string) => {
    const payload = { page: 1, pageSize: MAX_CERTIFICATE_PER_TENANT }
    const list = (await getCertificateAuthorities({ payload }).unwrap())
      .data.filter(n => n.id !== data.id).map(n => ({ name: n.name }))
    const entityName = $t({ defaultMessage: 'Certificate Authority' })
    return checkObjectNotExists(list, { name: value }, entityName)
  }

  return (
    <Form form={form} layout='vertical' onFieldsChange={onFieldsChange}>
      <Form.Item
        name='name'
        label={$t({ defaultMessage: 'CA Name' })}
        initialValue={data.name}
        rules={[
          { required: true },
          { min: 2 },
          { max: 32 },
          { validator: (_, value) => trailingNorLeadingSpaces(value) },
          { validator: (_, value) => nameValidator(value) }
        ]}
        validateTrigger={'onBlur'}
        validateFirst
      >
        <Input />
      </Form.Item>
      <Form.Item
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        initialValue={data.description}
        rules={[
          { max: 255 }
        ]}
        children={<Input />}
      />
    </Form>

  )
}

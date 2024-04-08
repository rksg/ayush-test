import { useState } from 'react'

import { Form, Input } from 'antd'

import { ModalRef }                    from '@acx-ui/components'
import { getIntl, validationMessages } from '@acx-ui/utils'

export default function RevokeForm (props: {
  modal: ModalRef,
  onFinish: (revocationReason: string) => Promise<void>
}) {
  const { $t } = getIntl()
  const { modal, onFinish } = props
  const [form] = Form.useForm()
  const [okButtonDisabled, setOkButtonDisabled] = useState(true)

  modal.update({
    onOk: async () => {
      await onFinish(form.getFieldValue('reason'))
    },
    okButtonProps: { disabled: okButtonDisabled }
  })

  const onFieldsChange = () => {
    setOkButtonDisabled(form.getFieldsError().some(item => item.errors.length > 0))
  }

  return (
    <Form form={form} layout='horizontal' onFieldsChange={onFieldsChange}>
      <Form.Item
        name='reason'
        label={$t({ defaultMessage: 'Type the reason to revoke' })}
        rules={[
          { required: true, message: $t({ defaultMessage: 'Reason is required' }) },
          { max: 255, message: $t(validationMessages.maxStr) }
        ]}
      >
        <Input />
      </Form.Item>
    </Form>
  )
}
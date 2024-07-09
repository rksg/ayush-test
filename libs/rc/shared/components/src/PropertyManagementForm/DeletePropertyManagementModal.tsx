import { Form, Input, Modal } from 'antd'

import { EditPropertyConfigMessages } from '@acx-ui/rc/utils'
import { getIntl }                    from '@acx-ui/utils'

export const showDeletePropertyManagementModal = (callback: () => void, confirmText?: string) => {
  const { $t } = getIntl()
  const modal = Modal.confirm({})

  const label = $t(
    { defaultMessage: 'Type the word "{text}" to confirm:' },
    { text: confirmText }
  )

  modal.update({
    title: $t({ defaultMessage: 'Delete Property Management?' }),
    content: <>
      {$t(EditPropertyConfigMessages.DISABLE_PROPERTY_MESSAGE)}
      <Form>
        <Form.Item name='name' label={label}>
          <Input onChange={(e) => {
            const disabled = e.target.value.toLowerCase() !== confirmText?.toLowerCase()
            modal.update({
              okButtonProps: { disabled: disabled }
            })
          }} />
        </Form.Item>
      </Form>
    </>,
    okText: $t({ defaultMessage: 'Delete' }),
    okButtonProps: { disabled: true },
    onOk: () => {callback()},
    icon: <> </>
  })
}

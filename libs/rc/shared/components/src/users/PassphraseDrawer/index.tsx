import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer }                   from '@acx-ui/components'
import { useUpdatePersonaMutation } from '@acx-ui/rc/services'
import { Persona }                  from '@acx-ui/rc/utils'

// eslint-disable-next-line max-len
export function PassphraseDrawer (props: { persona: Persona, visible: boolean, onClose: () => void }) {
  const { $t } = useIntl()
  const { persona, visible, onClose } = props
  const [form] = Form.useForm<{ passphrase? : string }>()

  const onSubmit = async () => {
    let passphrase = form.getFieldValue('passphrase')
    if (passphrase === '') {
      passphrase = null
    }
    await updatePersona({
      params: { groupId: persona.groupId, id: persona.id },
      payload: { dpskPassphrase: passphrase }
    }).then(() => {
      onClose()
    })
  }
  const [ updatePersona ] = useUpdatePersonaMutation()

  return <Drawer
    title={$t({ defaultMessage: 'Change Passphrase' })}
    visible={visible}
    onClose={() => onClose()}
    closable={true}
    forceRender={true}
    width={520}
    footer={<Drawer.FormFooter
      onCancel={onClose}
      onSave={onSubmit}
    />}>
    <Form layout='vertical' form={form} initialValues={{ passphrase: persona.dpskPassphrase }}>
      <Form.Item
        style={{ marginTop: 8 }}
        name='passphrase'
        label={$t({ defaultMessage: 'Passphrase' })}
        rules={[{ max: 63, min: 8 }]}
      >
        <Input.Password
          allowClear
          placeholder={$t({ defaultMessage: 'Auto Generate Passphrase' })} />
      </Form.Item>
    </Form>
  </Drawer>
}

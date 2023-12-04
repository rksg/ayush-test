import { useEffect } from 'react'

import { Form, FormInstance, Input } from 'antd'
import { useIntl }                   from 'react-intl'

import { Drawer }                  from '@acx-ui/components'
import {
  ClientIsolationClient,
  colonSeparatedMacAddressRegExp
} from '@acx-ui/rc/utils'

export interface AddNewClientDrawerProps {
  client?: ClientIsolationClient;
  setClient: (r: ClientIsolationClient) => void;
  editMode: boolean;
  visible: boolean;
  setVisible: (v: boolean) => void;
  isRuleUnique?: (r: ClientIsolationClient) => boolean
}

export function AddNewClientDrawer (props: AddNewClientDrawerProps) {
  const { $t } = useIntl()
  const {
    client,
    setClient,
    visible,
    setVisible,
    editMode,
    isRuleUnique
  } = props
  const [ form ] = Form.useForm<ClientIsolationClient>()

  const onClose = () => {
    setVisible(false)
  }

  const onSave = () => {
    setClient(form.getFieldsValue())
    form.resetFields()
  }

  return (
    <Drawer
      title={editMode
        ? $t({ defaultMessage: 'Edit Client' })
        : $t({ defaultMessage: 'Add Client' })
      }
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={
        <AddNewClientForm
          form={form}
          client={client}
          isClientUnique={isRuleUnique}
        />
      }
      footer={
        <Drawer.FormFooter
          showAddAnother={!editMode}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another client' }),
            save: editMode ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
          })}
          onCancel={onClose}
          onSave={async (addAnotherChecked: boolean) => {
            try {
              await form.validateFields()
              onSave()

              if (!addAnotherChecked) {
                onClose()
              }
            } catch (error) {
              // eslint-disable-next-line no-console
              console.log(error)
            }
          }}
        />
      }
      width={'400px'}
    />
  )
}


interface AddNewClientFormProps {
  form: FormInstance<ClientIsolationClient>
  client?: ClientIsolationClient
  isClientUnique?: (r: ClientIsolationClient) => boolean
}

function AddNewClientForm (props: AddNewClientFormProps) {
  const { $t } = useIntl()
  const {
    form,
    client = {},
    isClientUnique = () => true
  } = props

  useEffect(() => {
    form.setFieldsValue(client)
  }, [form, client])

  const macDuplicationValidator = async () => {
    return isClientUnique(form.getFieldsValue())
      ? Promise.resolve()
      : Promise.reject($t({ defaultMessage: 'The client already exists' }))
  }

  return (
    <Form layout='vertical'
      form={form}
      preserve={false}
    >
      <Form.Item
        label={$t({ defaultMessage: 'MAC Address' })}
        name='mac'
        rules={[
          { required: true },
          { validator: (_, value) => colonSeparatedMacAddressRegExp(value) },
          { validator: () => macDuplicationValidator() }
        ]}
        children={<Input />}
      />
      <Form.Item
        name='description'
        label={$t({ defaultMessage: 'Description' })}
        rules={[
          { max: 64 }
        ]}
        children={<Input.TextArea rows={2} maxLength={64} />}
      />
    </Form>
  )
}

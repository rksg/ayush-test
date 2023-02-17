import { Form, Input } from 'antd'
import moment          from 'moment-timezone'

import { Modal }                      from '@acx-ui/components'
import { useAddConfigBackupMutation } from '@acx-ui/rc/services'
import { excludeQuoteRegExp }         from '@acx-ui/rc/utils'
import { useParams }                  from '@acx-ui/react-router-dom'
import { getIntl }                    from '@acx-ui/utils'

export function BackupModal (props:{
  visible: boolean,
  handleCancel: () => void
}) {
  const { $t } = getIntl()
  const params = useParams()
  const { visible, handleCancel } = props
  const [form] = Form.useForm()
  const [addConfigBackup] = useAddConfigBackupMutation()

  const onOk = () => {
    form.submit()
  }

  const onFinish = async (value: { name:string }) => {
    await addConfigBackup({ params, payload: value }).unwrap()
    handleCancel()
  }

  return <Modal
    title={$t({ defaultMessage: 'Create Backup' })}
    visible={visible}
    destroyOnClose={true}
    okText={$t({ defaultMessage: 'Create' })}
    onOk={onOk}
    onCancel={handleCancel}
  >
    <Form
      form={form}
      onFinish={onFinish}
      layout='vertical'
      validateTrigger='onBlur'
    >
      <Form.Item
        label={$t({ defaultMessage: 'Configuration Name' })}
        name='name'
        rules={[
          { required: true },
          { min: 1 },
          { max: 64 },
          { validator: (_, value) => excludeQuoteRegExp(value) }
        ]}
        initialValue={'Manual_' + moment().format('YYYYMMDDHHmmss')}
        validateFirst
        children={<Input />}
      />
    </Form>
  </Modal>
}
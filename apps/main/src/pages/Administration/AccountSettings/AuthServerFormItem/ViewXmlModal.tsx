
import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Button, Modal, Subtitle } from '@acx-ui/components'

interface ViewXmlModalProps {
  visible: boolean
  viewText: string
  setVisible: (visible: boolean) => void
}

export const ViewXmlModal = (props: ViewXmlModalProps) =>{
  const { $t } = useIntl()
  const { visible, viewText, setVisible } = props

  const [form] = Form.useForm()

  const formContent = <Form
    form={form}
    layout='vertical'
  >
    <Subtitle level={3}>{$t({ defaultMessage: 'IdP Metadata' })}</Subtitle>
    <Form.Item
      name='description'
      children={<Input.TextArea defaultValue={viewText} rows={32} readOnly/>}
    />
  </Form>

  const handleOk = () => {
    setVisible(false)
    form.resetFields()
  }

  return (
    <Modal
      title='  '
      width={880}
      visible={visible}
      footer={
        <Button onClick={() => handleOk()}
          type={'primary'}
        >
          {$t({ defaultMessage: 'Ok' })}
        </Button>}
      onCancel={handleOk}
      maskClosable={false}
    >
      {formContent}
    </Modal>
  )
}


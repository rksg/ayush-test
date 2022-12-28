import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Drawer, showToast }          from '@acx-ui/components'
import { MdnsProxySelector }          from '@acx-ui/rc/components'
import { useAddMdnsProxyApsMutation } from '@acx-ui/rc/services'


export interface ChangeMdnsProxyDrawerProps {
  apSerialNumberList: string[];
  visible: boolean;
  setVisible: (v: boolean) => void;
  initialServiceId?: string;
}

export default function ChangeMdnsProxyDrawer (props: ChangeMdnsProxyDrawerProps) {
  const { $t } = useIntl()
  const params = useParams()
  const {
    apSerialNumberList,
    visible,
    setVisible,
    initialServiceId
  } = props
  const [ form ] = Form.useForm<{ serviceId: string }>()
  const [ addMdnsProxyAps ] = useAddMdnsProxyApsMutation()

  const onSave = async (data: { serviceId: string }) => {
    try {
      await addMdnsProxyAps({
        params: { ...params, serviceId: data.serviceId },
        payload: apSerialNumberList
      }).unwrap()

      onClose()
    } catch {
      showToast({
        type: 'error',
        content: $t({ defaultMessage: 'An error occurred' })
      })
    }
  }

  const onClose = () => {
    setVisible(false)
  }

  const content = (
    <Form layout='vertical'
      form={form}
      preserve={false}
    >
      <MdnsProxySelector
        formItemProps={{
          name: 'serviceId',
          rules: [{ required: true }],
          initialValue: initialServiceId
        }}
      />
    </Form>
  )

  return (
    <Drawer
      title={$t({ defaultMessage: 'Change mDNS Proxy Service' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={visible && content}
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          buttonLabel={({
            save: $t({ defaultMessage: 'Apply' })
          })}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              await onSave(form.getFieldsValue())
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
      width={'450px'}
    />
  )
}

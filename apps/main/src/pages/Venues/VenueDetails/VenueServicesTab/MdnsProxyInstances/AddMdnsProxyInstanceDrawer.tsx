import { Form }      from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Drawer, showToast }             from '@acx-ui/components'
import { ApSelector, MdnsProxySelector } from '@acx-ui/rc/components'
import { useAddMdnsProxyApsMutation }    from '@acx-ui/rc/services'


export interface AddMdnsProxyInstanceDrawerProps {
  visible: boolean
  setVisible: (v: boolean) => void
  venueId?: string
}

interface AddMdnsProxyInstanceForm {
  serviceId: string
  apSerialNumber: string
}

export default function AddMdnsProxyInstanceDrawer (props: AddMdnsProxyInstanceDrawerProps) {
  const { $t } = useIntl()
  const params = useParams()
  const { visible, setVisible, venueId } = props
  const [ form ] = Form.useForm<AddMdnsProxyInstanceForm>()
  const [ addMdnsProxyAps ] = useAddMdnsProxyApsMutation()

  const onSave = async (data: AddMdnsProxyInstanceForm) => {
    try {
      await addMdnsProxyAps({
        params: { ...params, serviceId: data.serviceId },
        payload: [data.apSerialNumber]
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

  return (
    <Drawer
      title={$t({ defaultMessage: 'Add Instance' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={
        <Form<AddMdnsProxyInstanceForm>
          layout='vertical'
          form={form}
          preserve={false}
        >
          <ApSelector
            formItemProps={{
              name: 'apSerialNumber',
              rules: [{ required: true }]
            }}
            venueId={venueId}
          />
          <MdnsProxySelector
            formItemProps={{
              name: 'serviceId',
              rules: [{ required: true }]
            }}
          />
        </Form>
      }
      footer={
        <Drawer.FormFooter
          showAddAnother={false}
          buttonLabel={({
            save: $t({ defaultMessage: 'Add' })
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

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer }                  from '@acx-ui/components'
import { useUpdateWidgetMutation } from '@acx-ui/rc/services'
import { WidgetListData }          from '@acx-ui/rc/utils'

import { WidgetProperty } from './Card'

export interface CustomizeWidgetDrawerProps {
  canvasId: string,
  widget: WidgetListData,
  visible: boolean
  setVisible: (v: boolean) => void
  changeWidgetProperty: (data: WidgetProperty)=> void
}

export default function CustomizeWidgetDrawer (props: CustomizeWidgetDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible, widget, canvasId, changeWidgetProperty } = props
  const [form] = Form.useForm()
  const [updateWidget] = useUpdateWidgetMutation()

  const onClose = () => {
    setVisible(false)
  }

  const handleSubmit = async () => {
    const formValues = form.getFieldsValue(true)
    await updateWidget({
      params: { canvasId, widgetId: widget.id },
      payload: {
        name: formValues.name
      }
    }).unwrap().then(()=> {
      changeWidgetProperty({
        // TODO: time range
        name: formValues.name
      })
    })
    onClose()
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Customize Widget' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      mask={true}
      maskClosable={true}
      width={400}
      children={
        <Form layout='vertical'
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item
            label={$t({ defaultMessage: 'Widget Title' })}
            name='name'
            initialValue={widget?.name}
            validateFirst
            rules={[
              { required: true },
              { min: 1 },
              { max: 64 }
            ]}
            children={<Input/>}
          />
        </Form>
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'OK' })
          }}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              form.submit()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    />
  )
}

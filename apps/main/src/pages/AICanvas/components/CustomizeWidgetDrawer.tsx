import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }         from '@acx-ui/components'
import { WidgetListData } from '@acx-ui/rc/utils'

export interface CustomizeWidgetDrawerProps {
  widget: WidgetListData,
  visible: boolean
  setVisible: (v: boolean) => void
}

export default function CustomizeWidgetDrawer (props: CustomizeWidgetDrawerProps) {
  const { $t } = useIntl()
  const { visible, setVisible } = props
  const [form] = Form.useForm()

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Customize Widget' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      width={400}
      children={
        <></>
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
              onClose()

            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    />
  )
}

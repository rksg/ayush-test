import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Drawer }                                    from '@acx-ui/components'
import { EdgeMdnsProxySelector, useEdgeMdnsActions } from '@acx-ui/rc/components'

import { EdgeMdnsProxyInstance } from './types'


export interface ChangeMdnsProxyDrawerProps {
  visible: boolean;
  onClose: () => void;
  row: EdgeMdnsProxyInstance | undefined;
  venueId: string;
}

export default function ChangeMdnsProxyDrawer (props: ChangeMdnsProxyDrawerProps) {
  const { $t } = useIntl()
  const {
    visible,
    onClose,
    row,
    venueId
  } = props
  const [ form ] = Form.useForm<{ serviceId: string }>()
  const { activateEdgeMdnsCluster } = useEdgeMdnsActions()

  const onSave = async (data: { serviceId: string }) => {
    try {
      await activateEdgeMdnsCluster(
        data.serviceId,
        venueId,
        row?.edgeClusterId ?? ''
      )

      onClose()
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const content = (
    <Form layout='vertical'
      form={form}
      preserve={false}
    >
      <EdgeMdnsProxySelector
        formItemProps={{
          name: 'serviceId',
          rules: [{ required: true }],
          initialValue: row?.serviceId
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
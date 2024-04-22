

import {
  Form,
  InputNumber,
  Space } from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Button,
  Drawer} from '@acx-ui/components'
import {
  useDebugRequestsMutation}                            from '@acx-ui/rc/services'
import { StackMember } from '@acx-ui/rc/utils'

export interface SwitchInfo {
  venueId: string
  switchId: string
  stackMembers?: StackMember
}

interface SwitchBlinkLEDsProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  switches: SwitchInfo[]
}

export const SwitchBlinkLEDsDrawer = (props: SwitchBlinkLEDsProps) => {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  const [applyBlinkLEDs] = useDebugRequestsMutation()


  const onClose = () => {
    setVisible(false)
  }


  const onApply = () => {
    setVisible(false)
  }


  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='edit-port-footer'>
      <Button key='cancelBtn' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        key='okBtn'
        type='primary'
        onClick={onApply}>
        {$t({ defaultMessage: 'Start' })}
      </Button>
    </Space>
  ]

  const [form] = Form.useForm()

  return (
    <Drawer
      title={$t({ defaultMessage: 'Blink LEDs' })}
      visible={visible}
      onClose={onClose}
      width={644}
      footer={footer}
      children={

        <Form
          layout='vertical'
          form={form}
          onFinish={onApply}
        >
          <Form.Item
            label={$t({ defaultMessage: 'Duration' })}
            name='duration'
            rules={[
              { required: true }]}
          >
            <InputNumber
              min={1}
              max={60}
            />
          </Form.Item>
        </Form>

      }
    />
  )
}

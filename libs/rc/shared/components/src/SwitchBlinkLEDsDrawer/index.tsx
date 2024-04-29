

import {
  Form,
  InputNumber,
  Space } from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  Drawer,
  Select } from '@acx-ui/components'
import { useBlinkLedsMutation } from '@acx-ui/rc/services'
import { StackMember }          from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

export interface SwitchInfo {
  venueId: string
  switchId: string
  stackMembers?: StackMember[]
}

interface SwitchBlinkLEDsProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  switches: SwitchInfo[]
  isStack: boolean
}

export const SwitchBlinkLEDsDrawer = (props: SwitchBlinkLEDsProps) => {
  const { $t } = useIntl()
  const { visible, setVisible, isStack } = props

  const [applyBlinkLEDs] = useBlinkLedsMutation()

  const onClose = () => {
    form.resetFields()
    setVisible(false)
  }

  const onApply = async () => {
    try {
      const requests = props.switches.map((item)=> {
        return applyBlinkLEDs({
          params: { venueId: item.venueId, switchId: item.switchId },
          payload: {
            troubleshootingPayload: {
              duration: form.getFieldValue('duration') || 60,
              ...(isStack ? { unit: form.getFieldValue('unit') } : {})
            },
            troubleshootingType: 'blink-led'
          }
        }).unwrap()
      })
      await Promise.all(requests)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
    onClose()
  }

  const footer = [
    <Space style={{ display: 'flex', marginLeft: 'auto' }} key='edit-port-footer'>
      <Button key='cancelBtn' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        key='okBtn'
        type='primary'
        onClick={() => form.submit()}
      >
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
      width={400}
      footer={footer}
      children={
        <Form
          layout='vertical'
          form={form}
          onFinish={onApply}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
            <UI.LabelOfInput style={{ left: '165px' }}>
              { $t({ defaultMessage: 'Seconds' }) }
            </UI.LabelOfInput>
            <Form.Item
              name='duration'
              label={$t({ defaultMessage: 'Duration' })}
              extra={$t({ defaultMessage: `The duration of the blink of LED with a
              minimum 15 seconds to a maximum 120 seconds` })}
              initialValue={60}
              rules={[{
                required: true
              }, {
                type: 'number', max: 120, min: 15,
                message: $t({
                  defaultMessage: 'The duration must be between 15 and 120'
                })
              }]}
              style={{ marginBottom: '15px' }}
              children={<InputNumber style={{ width: '150px' }} />}
            />
          </div>
          {isStack && props.switches[0]?.stackMembers &&
              <Form.Item
                name='unit'
                label={$t({ defaultMessage: 'Unit' })}
                initialValue={'all'}
                style={{ marginBottom: '15px' }} >
                <Select style={{ width: '150px' }}>
                  <Select.Option value={'all'} key={'all'} children={'All'} />
                  {props.switches[0].stackMembers.map((item: StackMember) =>
                    (<Select.Option
                      value={item.unitId}
                      key={item.unitId}
                      children={`${item.unitId} - ${item.model}`} />)
                  )}
                </Select>
              </Form.Item>
          }

        </Form>

      }
    />
  )
}

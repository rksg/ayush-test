

import { useEffect, useState } from 'react'

import { Form, InputNumber, Space } from 'antd'
import { useIntl }                  from 'react-intl'

import {
  Button,
  Drawer,
  Loader,
  Select } from '@acx-ui/components'
import {
  useSwitchDetailHeaderQuery,
  usePortDisableRecoverySettingQuery,
  useUpdatePortDisableRecoverySettingMutation
} from '@acx-ui/rc/services'
import { PortDisableRecoverySetting, PortDisableRecoverySettingForm } from '@acx-ui/rc/utils'
import { useParams }                                                  from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'


interface ErrorDisableRecoveryProps {
  visible: boolean
  setVisible: (visible: boolean) => void
}

export const ErrorDisableRecoveryDrawer = (props: ErrorDisableRecoveryProps) => {
  const { $t } = useIntl()
  const { tenantId, switchId } = useParams()
  const { visible, setVisible } = props
  const [value, setValue] = useState<string[]>([])

  const [ updatePortDisableRecoverySetting ] = useUpdatePortDisableRecoverySettingMutation()
  const { data: switchDetail, isLoading: isSwitchDetailLoading }
    = useSwitchDetailHeaderQuery({ params: { tenantId, switchId } })
  const { data, isLoading } = usePortDisableRecoverySettingQuery({
    params: { switchId, venueId: switchDetail?.venueId }
  }, {
    skip: !switchDetail?.venueId || isSwitchDetailLoading
  })

  useEffect(() => {
    if (data) {
      const { recoveryInterval, ...errorDisableRecoveryData } = data
      form.setFieldValue('recoveryInterval', recoveryInterval)

      const errorDisableRecoveryDataArray = Object.entries(errorDisableRecoveryData)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => value === true)
        .map(([key]) => key)

      handleChange(errorDisableRecoveryDataArray)
    }
  }, [data])

  function transformConfig (input: PortDisableRecoverySettingForm) {
    const output: PortDisableRecoverySetting = {
      recoveryInterval: input.recoveryInterval,
      bpduGuard: false,
      loopDetection: false,
      packetInError: false,
      loamRemoteCriticalEvent: false,
      pvstplusProtect: false,
      bpduTunnelThreshold: false,
      lagOperationalSpeedMismatch: false
    }

    const recoverySetting = Object.values(input.recoverySetting)
    recoverySetting.forEach((setting: string) => {
      if (setting !== 'all' && setting !== 'recoveryInterval' && setting in output) {
        output[setting as keyof Omit<PortDisableRecoverySetting, 'recoveryInterval'>] = true
      }
    })

    return output
  }

  const handleChange = (selectedValues: string[]) => {
    const allOptionsValues = options.map(opt => opt.value)
    const hasAll = selectedValues.includes('all')
    const hasAllPreviously = value.includes('all')

    let newValues: string[]

    if (hasAll && !hasAllPreviously) {
      newValues = ['all', ...allOptionsValues]
    } else if (!hasAll && hasAllPreviously) {
      newValues = []
    } else if (!hasAll && selectedValues.length === options.length) {
      newValues = ['all', ...selectedValues]
    } else if (hasAll) {
      newValues = selectedValues.filter(item => item !== 'all')
    } else {
      newValues = selectedValues
    }

    form.setFieldValue('recoverySetting', newValues)
    setValue(newValues)
  }

  const onClose = () => {
    form.resetFields()
    setVisible(false)
  }

  const onApply = async () => {
    try {
      const payload = transformConfig(form.getFieldsValue())
      await updatePortDisableRecoverySetting({
        payload,
        params: { switchId, venueId: switchDetail?.venueId }
      }).unwrap()
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
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    </Space>
  ]

  const [form] = Form.useForm()

  const options = [
    { label: $t({ defaultMessage: 'BPDU Guard' }), value: 'bpduGuard' },
    { label: $t({ defaultMessage: 'Loop Detect' }), value: 'loopDetection' },
    { label: $t({ defaultMessage: 'Packet InError' }), value: 'packetInError' },
    { label: $t({ defaultMessage: 'LOAM Remote Critical Event' }),
      value: 'loamRemoteCriticalEvent' },
    { label: $t({ defaultMessage: 'PVST Plus Protect' }), value: 'pvstplusProtect' },
    { label: $t({ defaultMessage: 'BPDU Tunnel Threshold' }), value: 'bpduTunnelThreshold' },
    { label: $t({ defaultMessage: 'LAG Operational Speed Mismatch' }),
      value: 'lagOperationalSpeedMismatch' }
  ]

  return (
    <Drawer
      title={$t({ defaultMessage: 'Error Disable Recovery' })}
      visible={visible}
      onClose={onClose}
      width={400}
      footer={footer}
      children={
        <Loader
          states={[
            { isLoading: isLoading || isSwitchDetailLoading }
          ]}
        >
          <Form
            layout='vertical'
            form={form}
            onFinish={onApply}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '0px 1fr' }}>
              <UI.LabelOfInput style={{ left: '315px' }}>
                { $t({ defaultMessage: 'Seconds' }) }
              </UI.LabelOfInput>
              <Form.Item
                name='recoveryInterval'
                label={$t({ defaultMessage: 'Timeout' })}
                initialValue={300}
                rules={[{
                  required: true,
                  message: $t({
                    defaultMessage: 'Please enter the value for the Timeout.'
                  })
                }, {
                  type: 'number', max: 65535, min: 10,
                  message: $t({
                    defaultMessage: 'Valid range is between 10 and 65535 seconds.'
                  })
                }]}
                style={{ marginBottom: '15px' }}
                children={
                  <InputNumber
                    data-testid='recoveryInterval'
                    style={{ width: '300px' }}
                    placeholder={$t({ defaultMessage: 'ex: 10 - 65535' })}
                  />}
              />
            </div>
            <Form.Item
              name='recoverySetting'
              label={$t({ defaultMessage: 'Error Disable Recovery' })}
              style={{ marginBottom: '15px' }}
            >
              <Select
                data-testid='recoverySetting'
                value={value}
                onChange={handleChange}
                mode='multiple'
                optionFilterProp='label'
                style={{ width: '300px' }}
                maxTagCount={value.some(item => item === 'all') || value.length >= 2
                  ? 0 : 'responsive'}
                // eslint-disable-next-line max-len
                maxTagPlaceholder={() => <span>{value.filter(item => item !== 'all').length} {$t({ defaultMessage: 'selected' })}</span>}
                showSearch={false}
                showArrow
                listHeight={500}
              >
                <Select.Option
                  key={'all'}
                  value={'all'}
                  style={{ borderBottom: '1px solid var(--acx-neutrals-25)' }}
                >
                  {$t({ defaultMessage: 'Select All' })}
                </Select.Option>
                {options.map((option) => (
                  <Select.Option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Loader>
      }
    />
  )
}

import { useEffect } from 'react'

import { Form, InputNumber, Modal, Select } from 'antd'
import { IntlShape, useIntl }               from 'react-intl'

import { Drawer }                               from '@acx-ui/components'
import { DdosAttackType, DdosRateLimitingRule } from '@acx-ui/rc/utils'

export const getDDoSAttackTypeString = ($t: IntlShape['$t'], type: DdosAttackType) => {
  switch (type) {
    case DdosAttackType.ALL:
      return $t({ defaultMessage: 'All' })
    case DdosAttackType.ICMP:
      return $t({ defaultMessage: 'ICMP' })
    case DdosAttackType.TCP_SYN:
      return $t({ defaultMessage: 'TCP SYN' })
    case DdosAttackType.IP_FRAGMENT:
      return $t({ defaultMessage: 'IP FRAGMENT' })
    case DdosAttackType.DNS_RESPONSE:
      return $t({ defaultMessage: 'DNS Response' })
    case DdosAttackType.NTP_REFLECTION:
      return $t({ defaultMessage: 'NTP Reflection' })
    default:
      return ''
  }
}

export const getDDoSAttackTypes = ($t: IntlShape['$t'])
  : Array<{ label: string, value: DdosAttackType }> => {
  return Object.keys(DdosAttackType)
    .map(key => ({
      label: getDDoSAttackTypeString($t, key as DdosAttackType),
      value: key as DdosAttackType
    }))
}

export interface DDoSRuleDialogProps {
  className?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editMode: boolean;
  editData: DdosRateLimitingRule;
  onSubmit: (newData: DdosRateLimitingRule, isEdit: boolean) => void
}

export const DDoSRuleDialog = (props: DDoSRuleDialogProps) => {
  const { visible, setVisible, editMode, editData, onSubmit } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const attackTypes = getDDoSAttackTypes($t)

  const handleSubmit = () => {
    const data = form.getFieldsValue(true)
    onSubmit(data, editMode)
    form.resetFields()
  }

  const handleClose = () => {
    setVisible(false)
  }

  const footer = [
    <Drawer.FormFooter
      buttonLabel={({
        addAnother: $t({ defaultMessage: 'Add another rule' }),
        save: $t({ defaultMessage: 'Apply' })
      })}
      showAddAnother={!editMode}
      onCancel={handleClose}
      onSave={async (addAnotherRuleChecked: boolean) => {
        form.submit()

        if (!addAnotherRuleChecked) {
          handleClose()
        }
      }}
    />
  ]

  useEffect(() => {
    if (editMode && visible) {
      form.setFieldsValue(editData)
    }
  }, [form, editMode, visible, editData])

  // const disableSubmitBtn = false

  return (
    <Modal
      title={editMode ?
        $t({ defaultMessage: 'Edit DDoS Rule' }) :
        $t({ defaultMessage: 'Add DDoS Rule' })}
      width={500}
      visible={visible}
      onCancel={handleClose}
      footer={footer}
    >
      <Form
        form={form}
        layout='vertical'
        onFinish={handleSubmit}
      >
        <Form.Item
          name='ddosAttackType'
          label={$t({ defaultMessage: 'DDoS Attack Type' })}
          rules={[{ required: true }]}
        >
          <Select
            options={attackTypes}
            placeholder={$t({ defaultMessage: 'DDoS Attack Type' })}
          />
        </Form.Item>

        <Form.Item
          label={$t({ defaultMessage: 'Rate-limit Value' })}
          // eslint-disable-next-line max-len
          tooltip={$t({ defaultMessage: 'A value of 100 kbps for ICMP Attack means ICMP traffic beyond 100kbps will be dropped.' })}
        >
          <Form.Item name='rateLimiting' noStyle>
            <InputNumber min={0} max={100} />
          </Form.Item>
          <span className='ant-form-text' style={{ marginLeft: 8 }}>
            {$t({ defaultMessage: 'kps' })}
          </span>
        </Form.Item>
      </Form>
    </Modal>
  )
}
import { useEffect } from 'react'

import { Form, InputNumber, Modal, Select } from 'antd'
import _                                    from 'lodash'
import { IntlShape, useIntl }               from 'react-intl'
import styled                               from 'styled-components'

import { Drawer }                                                        from '@acx-ui/components'
import { DdosAttackType, DdosRateLimitingRule, getDDoSAttackTypeString } from '@acx-ui/rc/utils'

import { ModalStyles } from '../styledComponents'

export const getDDoSAttackTypes = ($t: IntlShape['$t'])
  : Array<{ label: string, value: DdosAttackType }> => {
  return Object.keys(DdosAttackType)
    .map(key => ({
      label: getDDoSAttackTypeString($t, key as DdosAttackType),
      value: key as DdosAttackType
    }))
}

const isAllSelected = (rules: DdosRateLimitingRule[] | undefined) => {
  return _.findIndex(rules, { ddosAttackType: DdosAttackType.ALL }) !== -1
}

export interface DDoSRuleDialogProps {
  className?: string;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  editMode: boolean;
  editData: DdosRateLimitingRule;
  onSubmit: (newData: DdosRateLimitingRule, isEdit: boolean) => void
}

export const DDoSRuleDialog = styled((props: DDoSRuleDialogProps) => {
  const { className, visible, setVisible, editMode, editData, onSubmit } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const drawerForm = Form.useFormInstance()
  const attackTypes = getDDoSAttackTypes($t)
  const rules = drawerForm.getFieldValue('rules')
  const ddosAttackType = Form.useWatch('ddosAttackType', form)
  const allSelected = isAllSelected(rules)

  const handleSubmit = () => {
    const data = form.getFieldsValue()
    const addAnotherRuleChecked = form.getFieldValue('addAnotherRuleChecked')
    onSubmit(data, editMode)

    if (addAnotherRuleChecked && !editMode) {
      form.resetFields()
    } else {
      handleClose()
    }
  }

  const handleClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const isCreatedRuleType = (type: DdosAttackType) => {
    if (!rules) return false

    return allSelected
      ? allSelected
      : type === DdosAttackType.ALL
        ? rules.length
        : _.findIndex(rules, { ddosAttackType: type }) !== -1
  }

  const footer = <Drawer.FormFooter
    buttonLabel={({
      addAnother: $t({ defaultMessage: 'Add another rule' }),
      save: editMode ? $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' })
    })}
    showAddAnother={!editMode}
    showAddAnotherProps={allSelected || ddosAttackType === DdosAttackType.ALL
      ? { disabled: true }
      : undefined
    }
    onCancel={handleClose}
    onSave={async (addAnotherRuleChecked: boolean) => {
      form.setFieldValue('addAnotherRuleChecked', addAnotherRuleChecked)
      form.submit()
    }}
  />

  useEffect(() => {
    if (editMode && visible) {
      form.setFieldsValue(editData)
    }
  }, [form, editMode, visible, editData])

  return (
    <Modal
      className={className}
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
            placeholder={$t({ defaultMessage: 'DDoS Attack Type' })}
          >
            {attackTypes.map(({ label, value }) => {
              const disabled = isCreatedRuleType(value)

              return <Select.Option
                key={value}
                value={value}
                disabled={disabled}
                title={disabled ? $t({ defaultMessage: 'this rule is already created.' }) : label}
              >
                {label}
              </Select.Option>
            })}
          </Select>
        </Form.Item>
        <Form.Item
          label={$t({ defaultMessage: 'Rate-limit Value' })}
          // eslint-disable-next-line max-len
          tooltip={$t({ defaultMessage: 'A value of 100 kbps for ICMP Attack means ICMP traffic beyond 100kbps will be dropped.' })}
        >
          <Form.Item name='rateLimiting'
            noStyle
            rules={[
              { required: true, message: $t({ defaultMessage: 'Please enter rate-limit' }) },
              { type: 'number', min: 0 }
            ]}
            initialValue={256}
          >
            <InputNumber min={0} />
          </Form.Item>
          <span className='ant-form-text' style={{ marginLeft: 8 }}>
            {$t({ defaultMessage: 'kbps' })}
          </span>
        </Form.Item>
      </Form>
    </Modal>
  )
})`${ModalStyles}`
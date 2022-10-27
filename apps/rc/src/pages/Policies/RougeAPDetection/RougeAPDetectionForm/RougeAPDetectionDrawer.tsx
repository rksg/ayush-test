import { useContext, useState } from 'react'

import { Form, Input, Select, Tooltip } from 'antd'
import { useIntl }                      from 'react-intl'

import { Drawer }                                                                 from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                                             from '@acx-ui/icons'
import { RougeAPDetectionActionTypes, RougeAPRule, RougeCategory, RougeRuleType } from '@acx-ui/rc/utils'

import RougeAPDetectionContext from '../RougeAPDetectionContext'

const { Option } = Select


interface RougeAPDetectionDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  queryRuleName: string
}

const RougeAPDetectionDrawer = (props: RougeAPDetectionDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode, queryRuleName } = props
  const [resetField, setResetField] = useState(false)
  const { state, dispatch } = useContext(RougeAPDetectionContext)

  let ruleObj = {
    name: '',
    type: RougeRuleType.AD_HOC_RULE,
    classification: RougeCategory.MALICIOUS
  } as RougeAPRule

  const stateIdx = state.rules.findIndex(rules => rules.name === queryRuleName)
  if (isEditMode && stateIdx !== -1) {
    ruleObj = state.rules[stateIdx]
  }

  const [ruleName, setRuleName] = useState(ruleObj.name)
  const [ruleType, setRuleType] = useState(ruleObj.type)
  const [category, setCategory] = useState(ruleObj.classification)

  const [form] = Form.useForm()
  const title = isEditMode
    ? $t({ defaultMessage: 'Edit Classification Rule' })
    : $t({ defaultMessage: 'Add Classification Rule' })

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const selectRule = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Select
        data-testid='selectRougeRule'
        defaultValue={ruleObj.type}
        style={{ width: '70%', marginRight: '5px' }}
        onChange={(options) => setRuleType(options.toString() as RougeRuleType)}>
        <Option value={RougeRuleType.AD_HOC_RULE}>
          {$t({ defaultMessage: 'Ad Hoc' })}
        </Option>
        <Option value={RougeRuleType.CTS_ABUSE_RULE}>
          {$t({ defaultMessage: 'CTS Abuse' })}
        </Option>
        <Option value={RougeRuleType.DEAUTH_FLOOD_RULE}>
          {$t({ defaultMessage: 'Deauth Flood' })}
        </Option>
        <Option value={RougeRuleType.DISASSOC_FLOOD_RULE}>
          {$t({ defaultMessage: 'Disassoc Flood' })}
        </Option>
        <Option value={RougeRuleType.EXCESSIVE_POWER_RULE}>
          {$t({ defaultMessage: 'Excessive Power' })}
        </Option>
        <Option value={RougeRuleType.LOW_SNR_RULE}>
          {$t({ defaultMessage: 'Low SNR' })}
        </Option>
        <Option value={RougeRuleType.MAC_OUI_RULE}>
          {$t({ defaultMessage: 'MAC OUI' })}
        </Option>
        <Option value={RougeRuleType.MAC_SPOOFING_RULE}>
          {$t({ defaultMessage: 'MAC Spoofing' })}
        </Option>
        <Option value={RougeRuleType.NULL_SSID_RULE}>
          {$t({ defaultMessage: 'Null SSID' })}
        </Option>
        <Option value={RougeRuleType.RTS_ABUSE_RULE}>
          {$t({ defaultMessage: 'RTS Abuse' })}
        </Option>
        <Option value={RougeRuleType.SAME_NETWORK_RULE}>
          {$t({ defaultMessage: 'Same Network' })}
        </Option>
        <Option value={RougeRuleType.SSID_RULE}>
          {$t({ defaultMessage: 'SSID' })}
        </Option>
        <Option value={RougeRuleType.SSID_SPOOFING_RULE}>
          {$t({ defaultMessage: 'SSID Spoofing' })}
        </Option>
      </Select>
      <Tooltip
        title={$t({ defaultMessage: 'The type of rule to match for this category policy.' })}
        placement='bottom'
      >
        <QuestionMarkCircleOutlined />
      </Tooltip>
    </div>
  )

  const selectCategory = (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Select
        data-testid='selectRougeCategory'
        defaultValue={ruleObj.classification}
        style={{ width: '70%', marginRight: '5px' }}
        onChange={(options) => setCategory(options.toString() as RougeCategory)}>
        <Option value={RougeCategory.IGNORED}>
          {$t({ defaultMessage: 'Ignored' })}
        </Option>
        <Option value={RougeCategory.KNOWN}>
          {$t({ defaultMessage: 'Known' })}
        </Option>
        <Option value={RougeCategory.UNCLASSIFIED}>
          {$t({ defaultMessage: 'Unclassified' })}
        </Option>
        <Option value={RougeCategory.MALICIOUS}>
          {$t({ defaultMessage: 'Malicious' })}
        </Option>
      </Select>
      <Tooltip
        title={$t({ defaultMessage: 'Classify rouge APs when the above rule type is matched.' })}
        placement='bottom'
      >
        <QuestionMarkCircleOutlined />
      </Tooltip>
    </div>
  )

  const content = <Form layout='vertical'>
    <Form.Item
      name='ruleName'
      label={$t({ defaultMessage: 'Rule Name' })}
      rules={[
        { required: true },
        { validator: async (rule, value) => {
          return new Promise<void>((resolve, reject) => {
            if (!isEditMode && value && state.rules.findIndex(e => e.name === value) !== -1) {
              return reject(
                $t({ defaultMessage: 'A Rule with that name already exists in the Policy' })
              )
            }
            return resolve()
          })
        } }
      ]}
      initialValue={isEditMode ? ruleObj.name : queryRuleName}
      children={<Input
        style={{ width: '70%' }}
        defaultValue={queryRuleName}
        onChange={(event) => setRuleName(event.target.value)}
        placeholder={$t({ defaultMessage: 'Please enter the Rule name' })} />}
    />
    <Form.Item
      name='type'
      label={$t({ defaultMessage: 'Rule Type' })}
      rules={[{ required: true }]}
      initialValue={ruleObj.type}
      children={selectRule}
    />
    <Form.Item
      name='classification'
      label={$t({ defaultMessage: 'Category' })}
      rules={[{ required: true }]}
      initialValue={ruleObj.classification}
      children={selectCategory}
    />
  </Form>

  return (
    <Drawer
      title={title}
      visible={visible}
      onClose={resetFields}
      children={content}
      footer={<Drawer.FormFooter
        showAddAnother={!isEditMode}
        buttonLabel={({
          addAnother: $t({ defaultMessage: 'Add another rule' }),
          save: isEditMode ? $t({ defaultMessage: 'Save' }) : $t({ defaultMessage: 'Add' })
        })}
        onCancel={resetFields}
        onSave={async (addAnotherRuleChecked: boolean) => {
          try {
            await form.validateFields()
            if (!isEditMode && !state.rules.filter(rule => rule.name === ruleName).length) {
              dispatch({
                type: RougeAPDetectionActionTypes.ADD_RULE,
                payload: {
                  rule: {
                    name: ruleName,
                    type: ruleType,
                    classification: category
                  }
                }
              })
            }

            if (isEditMode) {
              dispatch({
                type: RougeAPDetectionActionTypes.UPDATE_RULE,
                payload: {
                  rule: {
                    name: ruleName,
                    type: ruleType,
                    classification: category,
                    priority: ruleObj.priority
                  }
                }
              })
            }

            if (!addAnotherRuleChecked) {
              resetFields()
            }
          } catch (error) {
            if (error instanceof Error) throw error
          }
        }}
      />}
      destroyOnClose={resetField}
      width={'600px'}
    />
  )
}

export default RougeAPDetectionDrawer

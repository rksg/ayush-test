import { useContext, useState } from 'react'

import { Form, Input, Select, Tooltip } from 'antd'
import { useIntl }                      from 'react-intl'

import { Drawer }                                                                 from '@acx-ui/components'
import { QuestionMarkCircleOutlined }                                             from '@acx-ui/icons'
import { RogueAPDetectionActionTypes, RogueAPRule, RogueCategory, RogueRuleType } from '@acx-ui/rc/utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'

const { Option } = Select


interface RogueAPDetectionDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  queryRuleName: string
}

const RogueAPDetectionDrawer = (props: RogueAPDetectionDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode, queryRuleName } = props
  const [resetField, setResetField] = useState(false)
  const { state, dispatch } = useContext(RogueAPDetectionContext)

  let ruleObj = {
    name: '',
    type: RogueRuleType.AD_HOC_RULE,
    classification: RogueCategory.MALICIOUS
  } as RogueAPRule

  console.log(state, queryRuleName)
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
        data-testid='selectRogueRule'
        defaultValue={ruleObj.type}
        style={{ width: '70%', marginRight: '5px' }}
        onChange={(options) => setRuleType(options.toString() as RogueRuleType)}>
        <Option value={RogueRuleType.AD_HOC_RULE}>
          {$t({ defaultMessage: 'Ad Hoc' })}
        </Option>
        <Option value={RogueRuleType.CTS_ABUSE_RULE}>
          {$t({ defaultMessage: 'CTS Abuse' })}
        </Option>
        <Option value={RogueRuleType.DEAUTH_FLOOD_RULE}>
          {$t({ defaultMessage: 'Deauth Flood' })}
        </Option>
        <Option value={RogueRuleType.DISASSOC_FLOOD_RULE}>
          {$t({ defaultMessage: 'Disassoc Flood' })}
        </Option>
        <Option value={RogueRuleType.EXCESSIVE_POWER_RULE}>
          {$t({ defaultMessage: 'Excessive Power' })}
        </Option>
        <Option value={RogueRuleType.LOW_SNR_RULE}>
          {$t({ defaultMessage: 'Low SNR' })}
        </Option>
        <Option value={RogueRuleType.MAC_OUI_RULE}>
          {$t({ defaultMessage: 'MAC OUI' })}
        </Option>
        <Option value={RogueRuleType.MAC_SPOOFING_RULE}>
          {$t({ defaultMessage: 'MAC Spoofing' })}
        </Option>
        <Option value={RogueRuleType.NULL_SSID_RULE}>
          {$t({ defaultMessage: 'Null SSID' })}
        </Option>
        <Option value={RogueRuleType.RTS_ABUSE_RULE}>
          {$t({ defaultMessage: 'RTS Abuse' })}
        </Option>
        <Option value={RogueRuleType.SAME_NETWORK_RULE}>
          {$t({ defaultMessage: 'Same Network' })}
        </Option>
        <Option value={RogueRuleType.SSID_RULE}>
          {$t({ defaultMessage: 'SSID' })}
        </Option>
        <Option value={RogueRuleType.SSID_SPOOFING_RULE}>
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
        data-testid='selectRogueCategory'
        defaultValue={ruleObj.classification}
        style={{ width: '70%', marginRight: '5px' }}
        onChange={(options) => setCategory(options.toString() as RogueCategory)}>
        <Option value={RogueCategory.IGNORED}>
          {$t({ defaultMessage: 'Ignored' })}
        </Option>
        <Option value={RogueCategory.KNOWN}>
          {$t({ defaultMessage: 'Known' })}
        </Option>
        <Option value={RogueCategory.UNCLASSIFIED}>
          {$t({ defaultMessage: 'Unclassified' })}
        </Option>
        <Option value={RogueCategory.MALICIOUS}>
          {$t({ defaultMessage: 'Malicious' })}
        </Option>
      </Select>
      <Tooltip
        title={$t({ defaultMessage: 'Classify rogue APs when the above rule type is matched.' })}
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
                type: RogueAPDetectionActionTypes.ADD_RULE,
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
              console.log(isEditMode, ruleObj, ruleName)
              dispatch({
                type: RogueAPDetectionActionTypes.UPDATE_RULE,
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

export default RogueAPDetectionDrawer

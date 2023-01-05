import { useContext, useEffect, useState } from 'react'

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

  useEffect(() => {
    if (isEditMode && queryRuleName) {
      setRuleName(queryRuleName)
      form.setFieldValue('ruleName', queryRuleName)
    }
  }, [isEditMode, queryRuleName])

  const selectRule = (
    <Select
      data-testid='selectRogueRule'
      defaultValue={ruleObj.type}
      style={{ width: '100%', marginRight: '5px' }}
      onChange={(options) => {
        setRuleType(options.toString() as RogueRuleType)
        form.setFieldValue('type', options)
      }}>
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
  )

  const selectCategory = (
    <Select
      data-testid='selectRogueCategory'
      defaultValue={ruleObj.classification}
      style={{ width: '100%', marginRight: '5px' }}
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
  )

  const content = <Form layout='vertical' form={form}>
    <Form.Item
      name='ruleName'
      label={$t({ defaultMessage: 'Rule Name' })}
      style={{ width: '90%' }}
      rules={[
        { required: true },
        { max: 32 },
        { validator: (rule, value) => {
          if (!isEditMode && value && state.rules.findIndex(e => e.name === value) !== -1) {
            return Promise.reject(
              $t({ defaultMessage: 'A Rule with that name already exists in the Policy' })
            )
          }
          return Promise.resolve()
        } }
      ]}
      initialValue={isEditMode ? ruleObj.name : queryRuleName}
      children={<Input
        defaultValue={queryRuleName}
        onChange={(event) => setRuleName(event.target.value)}
        placeholder={$t({ defaultMessage: 'Please enter the Rule name' })} />}
    />
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Form.Item
        name='type'
        label={$t({ defaultMessage: 'Rule Type' })}
        style={{ width: '90%' }}
        rules={[
          { required: true },
          { validator: (rule, value) => {
            if (value && state.rules
              .filter(e => isEditMode ? (e.type !== ruleObj.type) : true)
              .findIndex(e => e.type === value) !== -1) {
              return Promise.reject(
                $t({ defaultMessage: 'A Rule with that type already exists in this Policy' })
              )
            }
            return Promise.resolve()
          } }
        ]}
        validateFirst
        validateTrigger={['onChange']}
        initialValue={ruleObj.type}
        children={selectRule}
      />
      <Tooltip
        title={$t({ defaultMessage: 'The type of rule to match for this category policy.' })}
        placement='bottom'
      >
        <QuestionMarkCircleOutlined />
      </Tooltip>
    </div>

    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Form.Item
        name='classification'
        label={$t({ defaultMessage: 'Category' })}
        style={{ width: '90%' }}
        rules={[{ required: true }]}
        initialValue={ruleObj.classification}
        children={selectCategory}
      />
      <Tooltip
        title={$t({ defaultMessage: 'Classify rogue APs when the above rule type is matched.' })}
        placement='bottom'
      >
        <QuestionMarkCircleOutlined />
      </Tooltip>
    </div>

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

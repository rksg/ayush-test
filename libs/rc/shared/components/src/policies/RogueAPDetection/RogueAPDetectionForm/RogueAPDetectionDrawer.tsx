import { useContext, useEffect, useState } from 'react'

import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'

import { Drawer, Tooltip }                                                        from '@acx-ui/components'
import { RogueAPDetectionActionTypes, RogueAPRule, RogueCategory, RogueRuleType } from '@acx-ui/rc/utils'
import { getIntl, validationMessages }                                            from '@acx-ui/utils'

import RogueAPDetectionContext from '../RogueAPDetectionContext'


const { useWatch } = Form
const { Option } = Select


interface RogueAPDetectionDrawerProps {
  visible: boolean
  setVisible: (visible: boolean) => void
  isEditMode: boolean
  queryRuleName: string
  setRuleName?: (name: string) => void
}

export function SsidRogueRegExp (value: string){
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp(/[^`\\s]([^`\\t\\r\\n]){0,30}[^`\\s]/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export function MacOuiRogueRegExp (value: string){
  const { $t } = getIntl()
  // eslint-disable-next-line max-len
  const re = new RegExp(/^([0-9a-fA-F][0-9a-fA-F]:){2}([0-9a-fA-F][0-9a-fA-F])$/)
  if (value && !re.test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export const RogueAPDetectionDrawer = (props: RogueAPDetectionDrawerProps) => {
  const { $t } = useIntl()

  const { visible, setVisible, isEditMode, queryRuleName, setRuleName } = props
  const [resetField, setResetField] = useState(false)
  const { state, dispatch } = useContext(RogueAPDetectionContext)
  const [drawerForm] = Form.useForm()

  const [
    ruleName,
    type,
    classification
  ] = [
    useWatch<string>('ruleName', drawerForm),
    useWatch<RogueRuleType>('type', drawerForm),
    useWatch<RogueCategory>('classification', drawerForm)
  ]

  const title = isEditMode
    ? $t({ defaultMessage: 'Edit Classification Rule' })
    : $t({ defaultMessage: 'Add Classification Rule' })

  const onClose = () => {
    setVisible(false)
    drawerForm.resetFields()
    if (setRuleName) {
      setRuleName('')
    }
  }

  const resetFields = () => {
    setResetField(true)
    onClose()
  }

  const updateFieldsValue = (ruleObj: RogueAPRule) => {
    drawerForm.setFieldValue('ruleName', ruleObj.name)
    drawerForm.setFieldValue('type', ruleObj.type)
    drawerForm.setFieldValue('classification', ruleObj.classification)

    if (ruleObj.type === RogueRuleType.CUSTOM_SNR_RULE) {
      drawerForm.setFieldValue('signalThreshold', ruleObj.moreInfo)
    }

    if (ruleObj.type === RogueRuleType.CUSTOM_SSID_RULE) {
      drawerForm.setFieldValue('ssid', ruleObj.moreInfo)
    }

    if (ruleObj.type === RogueRuleType.CUSTOM_MAC_OUI_RULE) {
      drawerForm.setFieldValue('macOUI', ruleObj.moreInfo)
    }
  }

  const getRuleObj = (queryRuleName: string) => {
    const editRuleObjIdx = state.rules.findIndex(rule => rule.name === queryRuleName)
    return state.rules[editRuleObjIdx]
  }

  useEffect(() => {
    if (queryRuleName) {
      const editRuleObj = getRuleObj(queryRuleName)
      updateFieldsValue(editRuleObj)
    }
  }, [queryRuleName])

  const selectRule = (
    <Select
      data-testid='selectRogueRule'
      style={{ width: '100%', marginRight: '5px' }}>
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
      <Option value={RogueRuleType.CUSTOM_SNR_RULE}>
        {$t({ defaultMessage: 'Low SNR' })}
      </Option>
      <Option value={RogueRuleType.CUSTOM_MAC_OUI_RULE}>
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
      <Option value={RogueRuleType.CUSTOM_SSID_RULE}>
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
      onChange={() => drawerForm.validateFields()}
      style={{ width: '100%', marginRight: '5px' }}>
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

  const content = <Form layout='vertical' form={drawerForm}>
    <Form.Item
      name='ruleName'
      label={$t({ defaultMessage: 'Rule Name' })}
      style={{ width: '90%' }}
      rules={[
        { required: true },
        { min: 2 },
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
      initialValue={isEditMode ? queryRuleName : ''}
      children={<Input
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
              .filter(e => isEditMode ? (e.type !== type) : true)
              .filter(e => ![
                RogueRuleType.CUSTOM_MAC_OUI_RULE,
                RogueRuleType.CUSTOM_SNR_RULE,
                RogueRuleType.CUSTOM_SSID_RULE
              ].includes(e.type))
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
        initialValue={isEditMode ? type : RogueRuleType.AD_HOC_RULE}
        children={selectRule}
      />
      <Tooltip.Question
        title={$t({ defaultMessage: 'The type of rule to match for this category policy.' })}
        placement='bottom'
      />
    </div>

    { type === RogueRuleType.CUSTOM_SNR_RULE &&
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Form.Item
        name='signalThreshold'
        label={$t({ defaultMessage: 'Signal Threshold' })}
        style={{ width: '90%' }}
        rules={[
          { required: true },
          { min: 0 },
          { max: 100 }
        ]}
        validateFirst
        children={<Input
          placeholder={$t({ defaultMessage: '0-100' })} />}
      />
      <div style={{ margin: '10px' }}>dB</div>
      <Tooltip.Question
        title={$t({ defaultMessage: 'SNR cutoff for rogue classification.' })}
        placement='bottom'
      />
    </div> }

    { type === RogueRuleType.CUSTOM_SSID_RULE &&
    <Form.Item
      name='ssid'
      label={$t({ defaultMessage: 'SSID' })}
      style={{ width: '90%' }}
      rules={[
        { required: true },
        { validator: (_, value) => SsidRogueRegExp(value) }
      ]}
      validateFirst
      children={<Input />}
    /> }

    { type === RogueRuleType.CUSTOM_MAC_OUI_RULE &&
    <Form.Item
      name='macOUI'
      label={$t({ defaultMessage: 'MAC OUI' })}
      style={{ width: '90%' }}
      rules={[
        { required: true },
        { validator: (_, value) => {
          if (state.rules.length && state.rules.findIndex(rule => {
            return rule.moreInfo === value
              && rule.classification === drawerForm.getFieldValue('classification')
          }) !== -1) {
            return Promise.reject($t({
              // eslint-disable-next-line max-len
              defaultMessage: 'There is the same value in another macOUI rule setting with same category.'
            }))
          }
          return MacOuiRogueRegExp(value)
        } }
      ]}
      validateFirst
      children={<Input
        placeholder={$t({ defaultMessage: 'e.g.: 11:22:33' })} />}
    /> }

    <div style={{ display: 'flex', alignItems: 'center' }}>
      <Form.Item
        name='classification'
        label={$t({ defaultMessage: 'Category' })}
        style={{ width: '90%' }}
        rules={[
          { required: true }
        ]}
        initialValue={isEditMode ? classification : RogueCategory.MALICIOUS}
        children={selectCategory}
      />
      <Tooltip.Question
        title={$t({ defaultMessage: 'Classify rogue APs when the above rule type is matched.' })}
        placement='bottom'
      />
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
            await drawerForm.validateFields()
            if (!isEditMode && !state.rules.filter(rule => rule.name === ruleName).length) {
              let info = {} as { moreInfo: string | number }
              if (type === RogueRuleType.CUSTOM_SNR_RULE) {
                info.moreInfo = drawerForm.getFieldValue('signalThreshold')
              }

              if (type === RogueRuleType.CUSTOM_SSID_RULE) {
                info.moreInfo = drawerForm.getFieldValue('ssid')
              }

              if (type === RogueRuleType.CUSTOM_MAC_OUI_RULE) {
                info.moreInfo = drawerForm.getFieldValue('macOUI')
              }

              dispatch({
                type: RogueAPDetectionActionTypes.ADD_RULE,
                payload: {
                  rule: {
                    ...info,
                    name: ruleName,
                    type: type,
                    classification: classification
                  }
                }
              })
            }

            if (isEditMode) {
              let ruleObj = getRuleObj(queryRuleName)
              let info = {} as { moreInfo: string | number }
              if (type === RogueRuleType.CUSTOM_SNR_RULE) {
                info.moreInfo = drawerForm.getFieldValue('signalThreshold')
              }

              if (type === RogueRuleType.CUSTOM_SSID_RULE) {
                info.moreInfo = drawerForm.getFieldValue('ssid')
              }

              if (type === RogueRuleType.CUSTOM_MAC_OUI_RULE) {
                info.moreInfo = drawerForm.getFieldValue('macOUI')
              }

              dispatch({
                type: RogueAPDetectionActionTypes.UPDATE_RULE,
                payload: {
                  rule: {
                    ...info,
                    name: ruleName,
                    type: type,
                    classification: classification,
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

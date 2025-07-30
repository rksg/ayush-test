import { useContext, useEffect, useState } from 'react'

import { Form, Input, Select } from 'antd'
import { cloneDeep }           from 'lodash'
import { useIntl }             from 'react-intl'

import { Drawer, Tooltip, PasswordInput, PasswordInputStrength }                        from '@acx-ui/components'
import { ApSnmpActionType, SnmpAuthProtocolEnum, SnmpPrivacyProtocolEnum, SnmpV3Agent } from '@acx-ui/rc/utils'

import PrivilegeForm, { HasReadPrivilegeEnabled, HasTrapPrivilegeEnabled } from './PrivilegeForm'
import SnmpAgentFormContext                                                from './SnmpAgentFormContext'

const { useWatch } = Form

const initSnmpV3Agent = {
  userName: '',
  authProtocol: SnmpAuthProtocolEnum.SHA,
  authPassword: '',
  privacyProtocol: SnmpPrivacyProtocolEnum.None,
  readPrivilege: false,
  trapPrivilege: false
}

type SnmpV3AgentDrawerProps = {
  visible: boolean
  setVisible: (visible: boolean) => void
  editIndex: number
}

const SnmpV3AgentDrawer = (props: SnmpV3AgentDrawerProps) => {
  const { $t } = useIntl()
  const { state, dispatch } = useContext(SnmpAgentFormContext)
  const [ forceFocusOn, setForceFocusOn ] = useState<boolean>(false)
  const [ othersData, setOthersData ] = useState<SnmpV3Agent[]>([])
  const usedUserName = othersData.map(d => d.userName) ?? []
  const hasOtherReadPrivilegeEnabled = HasReadPrivilegeEnabled(othersData)
  const hasOtherTrapPrivilegeEnabled = HasTrapPrivilegeEnabled(othersData)

  const [form] = Form.useForm()
  const privacyProtocol = useWatch<string>('privacyProtocol', form)

  const { visible, setVisible, editIndex } = props
  const isEditMode = (editIndex !== -1)

  const title = isEditMode
    ? $t({ defaultMessage: 'Edit SNMPv3 Agent' })
    : $t({ defaultMessage: 'Add SNMPv3 Agent' })

  const saveButtonText = isEditMode
    ? $t({ defaultMessage: 'Apply' })
    : $t({ defaultMessage: 'Add' })

  const RULE_REGEX = [
    /^[A-Za-z\d~!@#\$%^&*_\-+=|\(\)\{\}\[\]:;\"'<>,.?/]{1,}$/, // No invalid characters
    /^(?!~).{1,}/,                                            // ~ cannot be the first character
    /^(?!.*[`]).{1,}/,                                        // ` is not valid in the password
    /^(?!.*\$\().{1,}/                                        // $( is not valid in the password
  ]

  const RULE_MESSAGES = [
    // eslint-disable-next-line
    $t({ defaultMessage: 'Please use only letters, digits, and these special characters: ~!@#$%^&*_-+=|()\'{}[]:;"<>,.?/. Other characters are not allowed.' }),
    $t({ defaultMessage: '~ cannot be used as the first character of the password' }),
    $t({ defaultMessage: '` is not valid to be part of the password' }),
    $t({ defaultMessage: 'The sequence of $( is not valid to be part of the password' })
  ]

  const RULE_REGEX_NO_MESSAGE = [
    /^.{8,32}$/,
    /(?=.*[a-z])(?=.*[A-Z])/,
    /(?=.*\d)/,
    /(?=.*[~!@#\$%^&*_\-+=|\(\)\{\}\[\]:;\"'<>,.?/]).{1,}/   // At least one valid special character
  ]

  useEffect(() => {
    if (visible && form) {
      const { snmpV3Agents } = state
      const snmpV3Agent = cloneDeep(isEditMode? snmpV3Agents?.[editIndex] : initSnmpV3Agent)

      setOthersData(snmpV3Agents?.filter((s, index) => ( index !== editIndex)) ?? [])

      form.setFieldsValue(snmpV3Agent)
    }
  }, [editIndex, visible, form, isEditMode, state])

  const userNameValidator = async (value: string) => {
    const re = new RegExp('^[^\'#" ]*$')

    return (value && !re.test(value))
      // eslint-disable-next-line max-len
      ? Promise.reject($t({ defaultMessage: 'The User name cannot contain spaces, single quotes(\'), double quotes("), or pound signs(#).' }))
      : Promise.resolve()
  }

  const userNameDuplicationValidator = async (value: string) => {
    return (usedUserName.includes(value))
      ? Promise.reject($t({ defaultMessage: 'The User name already exists' }))
      : Promise.resolve()
  }


  const content = (
    <Form layout='vertical' form={form} >
      <Form.Item
        name='userName'
        label={<>
          {$t({ defaultMessage: 'User Name' })}
          <Tooltip.Question
            placement='bottom'
            title={$t({ defaultMessage: 'Length is limited to 3-32 characters.' })}
          />
        </>}
        style={{ width: '350px' }}
        rules={[
          { required: true, message: $t({ defaultMessage: 'Please enter User Name' }) },
          { min: 3 },
          { max: 32 },
          { validator: (_, value) => userNameValidator(value) },
          { validator: (_, value) => userNameDuplicationValidator(value) }
        ]}
        children={<Input />}
      />
      <Form.Item
        name='authProtocol'
        label={$t({ defaultMessage: 'Authentication Mode' })}
        style={{ width: '350px' }}
        initialValue={SnmpAuthProtocolEnum.SHA}
        children={
          <Select
            options={Object.keys(SnmpAuthProtocolEnum).map((key) => {
              return (
                { value: key, label: key }
              )
            })}
          />
        }
      />
      <Form.Item
        name='authPassword'
        label={$t({ defaultMessage: 'Authentication Password' })}
        style={{ width: '350px' }}
        rules={[
          { required: true },
          /* eslint-disable */
            {
              validator: (_ : any, value: string) => {
                const errors: number[] = []
                RULE_REGEX.forEach((regex, index) => {
                  if(value && !regex.test(value)) {
                    errors.push(index)
                  }
                })
                if(errors.length > 0 || !value) {
                  return Promise.reject(RULE_MESSAGES[errors[0]])
                }
                return Promise.resolve()
              } },
              {
                validator: (_ : any, value: string) => {
                  const errors: number[] = []
                  RULE_REGEX_NO_MESSAGE.forEach((regex, index) => {
                    if(value && !regex.test(value)) {
                      errors.push(index)
                    }
                  })
                  if(errors.length > 0 || !value) {
                    return Promise.reject()
                  }
                  return Promise.resolve()
                } }
          /* eslint-enable */
        ]}
        children={
          <PasswordInputStrength
            forceFocusOn={forceFocusOn}
            setForceFocusOn={setForceFocusOn}
            data-testid={'password-input-strength'}
          />
        }
      />
      <Form.Item
        name='privacyProtocol'
        label={$t({ defaultMessage: 'Privacy' })}
        style={{ width: '350px' }}
        initialValue={SnmpPrivacyProtocolEnum.None}
        children={
          <Select
            options={Object.keys(SnmpPrivacyProtocolEnum).map((key) => {
              return (
                { value: key, label: key }
              )
            })}
          />
        }
      />
      {privacyProtocol && (privacyProtocol !== SnmpPrivacyProtocolEnum.None) &&
      <Form.Item
        name='privacyPassword'
        label={$t({ defaultMessage: 'Privacy Phrase' })}
        style={{ width: '350px' }}
        rules={[
          { required: true },
          { min: 8 },
          { max: 32 }
        ]}
        children={<PasswordInput />}
      />
      }
      <PrivilegeForm
        hasOtherReadPrivilegeEnabled={hasOtherReadPrivilegeEnabled}
        hasOtherTrapPrivilegeEnabled={hasOtherTrapPrivilegeEnabled} />
    </Form>)

  const resetData = () => {
    form.resetFields()
  }

  const onClose = () => {
    resetData()
    setVisible(false)
  }

  const onSave = async (addAnotherRuleChecked: boolean) => {
    try {
      const valid = await form.validateFields()
      if (valid) {
        const formData = form.getFieldsValue()
        const { readPrivilege, trapPrivilege } = formData

        if (readPrivilege || trapPrivilege) {
          const type = isEditMode? ApSnmpActionType.UPDATE_SNMP_V3 : ApSnmpActionType.ADD_SNMP_V3
          const payload = isEditMode? { ...formData, editIndex } : { ...formData }
          dispatch({ type, payload })

          form.submit()

          const allPrivilegeEnabled = (readPrivilege || hasOtherReadPrivilegeEnabled)
          && (trapPrivilege || hasOtherTrapPrivilegeEnabled)

          if (!addAnotherRuleChecked || allPrivilegeEnabled ) {
            onClose()
          } else {
            resetData()
          }
        }
      }
    } catch (error) {
      form.validateFields(['authPassword']).catch(() => setForceFocusOn(true))
      if (error instanceof Error) throw error
    }
  }

  return (
    <Drawer
      title={title}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={content}
      width={'500px'}
      footer={
        <Drawer.FormFooter
          showAddAnother={!isEditMode}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another SNMPv3 agent' }),
            save: saveButtonText
          })}
          onCancel={onClose}
          onSave={onSave}
        />
      }
    />
  )
}


export default SnmpV3AgentDrawer
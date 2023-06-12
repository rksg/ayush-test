import { useEffect } from 'react'

import { Form, Input, Select } from 'antd'
import { useIntl }             from 'react-intl'

import { Drawer, Tooltip, PasswordInput }                             from '@acx-ui/components'
import { SnmpAuthProtocolEnum, SnmpPrivacyProtocolEnum, SnmpV3Agent } from '@acx-ui/rc/utils'

import PrivilegeForm, { HasReadPrivilegeEnabled, HasTrapPrivilegeEnabled } from './PrivilegeForm'

const { useWatch } = Form

type SnmpV3AgentDrawerProps = {
  visible: boolean,
  isEditMode: boolean,
  curData: SnmpV3Agent,
  othersData: SnmpV3Agent[],
  onDataChanged: (d: SnmpV3Agent) => void,
  onCancel: () => void
}

const SnmpV3AgentDrawer = (props: SnmpV3AgentDrawerProps) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()

  const privacyProtocol = useWatch<string>('privacyProtocol', form)

  const { visible, isEditMode, curData, othersData=[], onDataChanged } = props
  const usedUserName = othersData.map(d => d.userName)
  const hasOtherReadPrivilegeEnabled = HasReadPrivilegeEnabled(othersData)
  const hasOtherTrapPrivilegeEnabled = HasTrapPrivilegeEnabled(othersData)

  const title = isEditMode
    ? $t({ defaultMessage: 'Edit SNMPv3 Agent' })
    : $t({ defaultMessage: 'Add SNMPv3 Agent' })

  const saveButtonText = isEditMode
    ? $t({ defaultMessage: 'Apply' })
    : $t({ defaultMessage: 'Add' })

  useEffect(() => {
    if (curData) {
      form.setFieldsValue(curData)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curData])

  const content = <Form layout='vertical'
    form={form}
  >
    <Form.Item
      name='userName'
      label={
        <>
          {$t({ defaultMessage: 'User Name' })}
          <Tooltip.Question
            placement='bottom'
            title={$t({ defaultMessage: 'Length is limited to 3-32 characters.' })}
          />
        </>
      }
      style={{ width: '350px' }}
      rules={[
        { required: true,
          message: $t({ defaultMessage: 'Please enter User Name' }) },
        { min: 3 },
        { max: 32 },
        { validator: (_, value) => {
          const userNameRegExp = (value: string) => {
            const re = new RegExp('^[^\'#" ]*$')
            if (value && !re.test(value)) {
              return Promise.reject($t(
                { defaultMessage:
                  // eslint-disable-next-line max-len
                  'The User name cannot contain spaces, single quotes(\'), double quotes("), or pound signs(#).'
                }))
            }
            return Promise.resolve()
          }

          if (usedUserName && usedUserName.includes(value)) {
            return Promise.reject($t({ defaultMessage: 'The User name already exists' }))
          }

          return userNameRegExp(value)
        } }
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
        { min: 8 },
        { max: 32 }
      ]}
      children={<PasswordInput />}
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
  </Form>

  // reset form fields when drawer is closed
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      form.resetFields()
    }
  }

  return (
    <Drawer
      title={title}
      visible={visible}
      onClose={props.onCancel}
      children={content}
      destroyOnClose={true}
      width={'500px'}
      afterVisibleChange={handleOpenChange}
      footer={
        <Drawer.FormFooter
          showAddAnother={!isEditMode}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another SNMPv3 agent' }),
            save: saveButtonText
          })}
          onCancel={props.onCancel}
          onSave={async (addAnotherRuleChecked: boolean) => {
            try {
              const valid = await form.validateFields()
              if (valid) {
                const newData = form.getFieldsValue()
                const { readPrivilege, trapPrivilege } = newData

                if (readPrivilege || trapPrivilege) {
                  onDataChanged(newData)
                  //form.submit()
                  const allPrivilegeEnabled = (readPrivilege || hasOtherReadPrivilegeEnabled)
                    && (trapPrivilege || hasOtherTrapPrivilegeEnabled)

                  if (!addAnotherRuleChecked || allPrivilegeEnabled) {
                    props.onCancel()
                  } else {
                    form.resetFields()
                  }
                }
              }
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }

    />
  )
}


export default SnmpV3AgentDrawer

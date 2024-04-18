import { useContext, useEffect, useState } from 'react'

import { Form, Input } from 'antd'
import { cloneDeep }   from 'lodash'
import { useIntl }     from 'react-intl'

import { Drawer, Tooltip }               from '@acx-ui/components'
import { ApSnmpActionType, SnmpV2Agent } from '@acx-ui/rc/utils'

import PrivilegeForm, { HasReadPrivilegeEnabled, HasTrapPrivilegeEnabled } from './PrivilegeForm'
import SnmpAgentFormContext                                                from './SnmpAgentFormContext'


const initSnmpV2Agent = {
  communityName: '',
  readPrivilege: false,
  trapPrivilege: false
}

type SnmpV2AgentDrawerProps = {
  visible: boolean
  setVisible: (visible: boolean) => void
  editIndex: number
}

const SnmpV2AgentDrawer = (props: SnmpV2AgentDrawerProps) => {
  const { $t } = useIntl()
  const { state, dispatch } = useContext(SnmpAgentFormContext)

  const [ othersData, setOthersData ] = useState<SnmpV2Agent[]>([])
  const usedCommunityNames = othersData.map(s => s.communityName) ?? []
  const hasOtherReadPrivilegeEnabled = HasReadPrivilegeEnabled(othersData)
  const hasOtherTrapPrivilegeEnabled = HasTrapPrivilegeEnabled(othersData)

  const [form] = Form.useForm()

  const { visible, setVisible, editIndex } = props
  const isEditMode = (editIndex !== -1)

  const title = isEditMode
    ? $t({ defaultMessage: 'Edit SNMPv2 Agent' })
    : $t({ defaultMessage: 'Add SNMPv2 Agent' })

  const saveButtonText = isEditMode
    ? $t({ defaultMessage: 'Apply' })
    : $t({ defaultMessage: 'Add' })


  useEffect(() => {
    if (visible && form) {
      const { snmpV2Agents } = state
      const snmpV2Agent = cloneDeep(isEditMode? snmpV2Agents?.[editIndex] : initSnmpV2Agent)

      setOthersData(snmpV2Agents?.filter((s, index) => ( index !== editIndex)) ?? [])

      form.setFieldsValue(snmpV2Agent)
    }
  }, [editIndex, visible, form, isEditMode, state])

  const communityNameValidator = async (value: string) => {
    const re = new RegExp('^[^\'#" ]*$')

    return (value && !re.test(value))
      // eslint-disable-next-line max-len
      ? Promise.reject($t({ defaultMessage: 'The Community name cannot contain spaces, single quotes(\'), double quotes("), or pound signs(#).' }))
      : Promise.resolve()
  }

  const communityNameDuplicationValidator = async (value: string) => {
    return (usedCommunityNames.includes(value))
      ? Promise.reject($t({ defaultMessage: 'The Community name already exists' }))
      : Promise.resolve()
  }

  const content = (
    <Form layout='vertical' form={form}>
      <Form.Item
        name='communityName'
        label={<>
          {$t({ defaultMessage: 'Community Name' })}
          <Tooltip.Question
            placement='bottom'
            title={$t({ defaultMessage: 'Length is limited to 1-32 characters.' })}
          />
        </>}
        style={{ width: '350px' }}
        rules={[
          { required: true, message: $t({ defaultMessage: 'Please enter Community Name' }) },
          { min: 1 },
          { max: 32 },
          { validator: (_, value) => communityNameValidator(value) },
          { validator: (_, value) => communityNameDuplicationValidator(value) }
        ]}
        children={<Input />}
      />
      <PrivilegeForm
        hasOtherReadPrivilegeEnabled={hasOtherReadPrivilegeEnabled}
        hasOtherTrapPrivilegeEnabled={hasOtherTrapPrivilegeEnabled} />
    </Form>
  )

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
        const payload = form.getFieldsValue()
        const { readPrivilege, trapPrivilege } = payload

        if (readPrivilege || trapPrivilege) {
          const type = isEditMode? ApSnmpActionType.UPDATE_SNMP_V2 : ApSnmpActionType.ADD_SNMP_V2
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
            addAnother: $t({ defaultMessage: 'Add another SNMPv2 agent' }),
            save: saveButtonText
          })}
          onCancel={onClose}
          onSave={onSave}
        />
      }
    />
  )
}

export default SnmpV2AgentDrawer

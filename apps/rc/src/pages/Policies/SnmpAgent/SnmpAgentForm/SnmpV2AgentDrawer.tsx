import { useEffect } from 'react'

import { Form, Input } from 'antd'
import { useIntl }     from 'react-intl'

import { Drawer, Tooltip } from '@acx-ui/components'
import { SnmpV2Agent }     from '@acx-ui/rc/utils'

import PrivilegeForm, { HasReadPrivilegeEnabled, HasTrapPrivilegeEnabled } from './PrivilegeForm'


type SnmpV2AgentDrawerProps = {
  visible: boolean,
  setVisible: (visible: boolean) => void,
  isEditMode: boolean,
  data: SnmpV2Agent,
  othersData: SnmpV2Agent[],
  onDataChanged: (d: SnmpV2Agent) => void
}

const SnmpV2AgentDrawer = (props: SnmpV2AgentDrawerProps) => {
  const { $t } = useIntl()
  const [form] = Form.useForm()

  const { visible, setVisible, isEditMode, data, othersData=[], onDataChanged } = props
  const usedCommunityName = othersData.map(d => d.communityName)
  const hasOtherReadPrivilegeEnabled = HasReadPrivilegeEnabled(othersData)
  const hasOtherTrapPrivilegeEnabled = HasTrapPrivilegeEnabled(othersData)

  const title = isEditMode
    ? $t({ defaultMessage: 'Edit SNMPv2 Agent' })
    : $t({ defaultMessage: 'Add SNMPv2 Agent' })

  const saveButtonText = isEditMode
    ? $t({ defaultMessage: 'Apply' })
    : $t({ defaultMessage: 'Add' })

  const onClose = () => {
    setVisible(false)
    form.resetFields()
  }

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const content = <Form layout='vertical'
    form={form}
  >
    <Form.Item
      name='communityName'
      label={
        <>
          {$t({ defaultMessage: 'Community Name' })}
          <Tooltip.Question
            placement='bottom'
            title={$t({ defaultMessage: 'Length is limited to 1-32 characters.' })}
          />
        </>
      }
      style={{ width: '350px' }}
      rules={[
        { required: true },
        { min: 1 },
        { max: 32 },
        { validator: (_, value) => {
          const communityNameRegExp = (value: string) => {
            const re = new RegExp('^[^\'#" ]*$')
            if (value && !re.test(value)) {
              return Promise.reject($t(
                { defaultMessage:
                  // eslint-disable-next-line max-len
                  'The Community name cannot contain spaces, single quotes(\'), double quotes("), or pound signs(#).'
                }))
            }
            return Promise.resolve()
          }

          if (usedCommunityName && usedCommunityName.includes(value)) {
            return Promise.reject($t({ defaultMessage: 'The Community name already exists' }))
          }

          return communityNameRegExp(value)
        } }
      ]}
      children={<Input />}
    />
    <PrivilegeForm
      hasOtherReadPrivilegeEnabled={hasOtherReadPrivilegeEnabled}
      hasOtherTrapPrivilegeEnabled={hasOtherTrapPrivilegeEnabled} />
  </Form>

  return (
    <Drawer
      title={title}
      visible={visible}
      onClose={onClose}
      children={content}
      destroyOnClose={true}
      width={'500px'}
      footer={
        <Drawer.FormFooter
          showAddAnother={!isEditMode}
          buttonLabel={({
            addAnother: $t({ defaultMessage: 'Add another SNMPv2 agent' }),
            save: saveButtonText
          })}
          onCancel={onClose}
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
                    onClose()
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


export default SnmpV2AgentDrawer

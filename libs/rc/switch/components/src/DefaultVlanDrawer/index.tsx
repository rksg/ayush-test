/* eslint-disable max-len */
import { useEffect } from 'react'

import {
  Form,
  FormInstance,
  Input,
  InputNumber,
  Select
} from 'antd'
import { useIntl } from 'react-intl'

import { Drawer, Alert, Tooltip }                                                           from '@acx-ui/components'
import { Features, useIsSplitOn }                                                           from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                                                       from '@acx-ui/icons'
import { validateDuplicateVlanId, validateVlanExcludingReserved, Vlan, versionAbove10020a } from '@acx-ui/rc/utils'

export interface DefaultVlanDrawerProps {
  defaultVlan?: Vlan
  setDefaultVlan: (r: Vlan) => void
  visible: boolean
  setVisible: (v: boolean) => void
  isRuleUnique?: (r: Vlan) => boolean
  isSwitchLevel?: boolean
  isAppliedACL?: boolean
  vlansList: Vlan[]
  switchFirmware?: string
}

export function DefaultVlanDrawer (props: DefaultVlanDrawerProps) {
  const { $t } = useIntl()
  const { defaultVlan, setDefaultVlan, visible, setVisible, vlansList, isSwitchLevel, isAppliedACL, switchFirmware } = props
  const [form] = Form.useForm<Vlan>()

  const onClose = () => {
    setVisible(false)
  }

  return (
    <Drawer
      title={$t({ defaultMessage: 'Default VLAN settings' })}
      visible={visible}
      onClose={onClose}
      destroyOnClose={true}
      children={
        <DefaultVlanForm
          form={form}
          defaultVlan={defaultVlan}
          setDefaultVlan={setDefaultVlan}
          vlansList={vlansList}
          isSwitchLevel={isSwitchLevel}
          isAppliedACL={isAppliedACL}
          switchFirmware={switchFirmware}
        />
      }
      footer={
        <Drawer.FormFooter
          buttonLabel={{
            save: $t({ defaultMessage: 'Save' })
          }}
          onCancel={onClose}
          onSave={async () => {
            try {
              await form.validateFields()
              form.submit()
              onClose()
            } catch (error) {
              if (error instanceof Error) throw error
            }
          }}
        />
      }
    />
  )
}

interface DefaultVlanFormProps {
  form: FormInstance<Vlan>
  defaultVlan?: Vlan
  setDefaultVlan: (r: Vlan) => void
  vlansList: Vlan[]
  isSwitchLevel?: boolean
  isAppliedACL?: boolean
  switchFirmware?: string
}

function DefaultVlanForm (props: DefaultVlanFormProps) {
  const { Option } = Select
  const { $t } = useIntl()
  const is10020aSwitchOnlyRstpEnabled = useIsSplitOn(Features.SWITCH_UPDATE_RSTP_ABOVE_10020A)
  const { form, defaultVlan, setDefaultVlan, vlansList, isSwitchLevel, isAppliedACL, switchFirmware } = props
  const hideStp = is10020aSwitchOnlyRstpEnabled && isSwitchLevel && versionAbove10020a(switchFirmware ?? '')

  useEffect(() => {
    if(defaultVlan){
      form.setFieldsValue(defaultVlan)
    //   setRuleList(defaultVlan.aclRules as AclStandardRule[] | AclExtendedRule[])
    }
  }, [form, defaultVlan])

  const onSaveVlan = (values: Vlan) => {
    values.title = `Default VLAN (${values.vlanId}) settings`
    setDefaultVlan(values)
  }

  return (
    <Form
      layout='vertical'
      form={form}
      onFinish={(data: Vlan) => {
        onSaveVlan(data)
        form.resetFields()
      }}
    >
      <Alert type='info'
        message={
          $t({ defaultMessage: '{profileMsg}Changing the default VLAN may cause network disruption unless the VLAN-ID already exists on the switch(es)' }, {
            profileMsg: !isSwitchLevel
              ? $t({ defaultMessage: 'Default VLAN change will be applied to all the switches linked to this profile. ' })
              : ''
          })
        } />
      <Form.Item
        label={<>
          {$t({ defaultMessage: 'VLAN ID' })}
          <Tooltip
            title={$t({
              defaultMessage: 'Default VLAN settings won\'t be applied if there is the same VLAN ID in switch'
            })}
            placement='bottom'
          >
            <QuestionMarkCircleOutlined />
          </Tooltip>
        </>}
        name='vlanId'
        rules={[
          { required: true },
          { validator: (_, value) => validateVlanExcludingReserved(value) },
          { validator: (_, value) => validateDuplicateVlanId(
            value, vlansList.filter(v => v.vlanId !== defaultVlan?.vlanId)
          ) }
        ]}
        children={<InputNumber disabled={isAppliedACL} />}
      />
      <Form.Item
        name='spanningTreeProtocol'
        label={<>
          {$t({ defaultMessage: 'Spanning tree protocol' })}
          {is10020aSwitchOnlyRstpEnabled && !isSwitchLevel &&
          <Tooltip
            title={$t({
              defaultMessage: 'Beginning with firmware version FI 10.0.20a and later, only RSTP will be applied even if STP is selected.'
            })}
            placement='bottom'
          >
            <QuestionMarkCircleOutlined />
          </Tooltip>
          }
        </>}
        initialValue={defaultVlan?.spanningTreeProtocol ||
          (is10020aSwitchOnlyRstpEnabled && versionAbove10020a(switchFirmware ?? '') ? 'rstp' : 'stp')
        }
        children={
          <Select>
            <Option value={'rstp'}>
              {$t({ defaultMessage: 'RSTP' })}</Option>
            {!hideStp &&
              <Option value={'stp'}>
                {$t({ defaultMessage: 'STP' })}</Option>
            }
            <Option value={'none'}>
              {$t({ defaultMessage: 'NONE' })}</Option>
          </Select>
        }
      />
      <Form.Item
        name='vlanName'
        initialValue={'DEFAULT-VLAN'}
        hidden={true}
        children={<Input />}
      />
    </Form>
  )
}

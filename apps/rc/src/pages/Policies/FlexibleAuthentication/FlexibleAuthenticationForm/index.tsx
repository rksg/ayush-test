import { useState, useEffect } from 'react'

import { Form, FormInstance, Typography, Input, Select, Space, Switch } from 'antd'
import { useIntl }                                                      from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsForm,
  Tooltip
} from '@acx-ui/components'
import {
  redirectPreviousPage,
  LocationExtended,
  normalNameRegExp,
  validateVlanExceptReservedVlanId
} from '@acx-ui/rc/utils'
import {
  useLocation,
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

export enum ProfileType {
  _802_1X = '802.1x',
  MACAUTH = 'macauth',
  _802_1X_AND_MACAUTH = '802.1x_and_macauth'
}

export enum PortControl {
  AUTO = 'auto',
  FORCE_AUTHORIZED = 'force-authorized',
  FORCE_UNAUTHORIZED = 'force-unauthorized'
}

export enum FailAction {
  RESTRICTED_VLAN = 'restricted-vlan',
  BLOCK = 'block'
}

export enum TimeoutAction {
  CRITICAL_VLAN = 'critical-vlan',
  SUCCESS = 'success',
  FAILURE = 'failure',
  NONE = 'none'
}

export interface FlexibleAuthentication {
  type: string
  portControl: string
  authDefaultVlan?: number
  failAction?: string
  timeoutAction?: string
}

export const FlexibleAuthenticationForm = (props: {
  editMode?: boolean
  form: FormInstance
  onFinish: (values: FlexibleAuthentication) => Promise<boolean | void>

}) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const basePath = useTenantLink('/policies/')
  const { useWatch } = Form

  const [form] = Form.useForm()
  // const params = useParams()
  const { editMode, onFinish } = props

  // const [selectType, setSelectType] = useState('')
  const [previousPath, setPreviousPath] = useState('')

  const [type, portControl, authDefaultVlan, failAction, timeoutAction] = [
    useWatch<string>('type', form),
    useWatch<string>('portControl', form),
    useWatch<string>('authDefaultVlan', form),
    useWatch<string>('failAction', form),
    useWatch<string>('timeoutAction', form)
  ]

  // console.log(type, portControl, authDefaultVlan, failAction, timeoutAction)
  const getFieldDisabled = (field: string) => {
    const isPortControlNotAuto = portControl !== PortControl.AUTO
    switch (field) {
      case 'authDefaultVlan': return isPortControlNotAuto
      case 'authOrder': return type !== ProfileType._802_1X_AND_MACAUTH
      case 'portControl': return type !== ProfileType._802_1X
      case 'failAction': return isPortControlNotAuto
      case 'restrictedVlan': return isPortControlNotAuto || failAction === FailAction.BLOCK
      case 'timeoutAction': return isPortControlNotAuto
      case 'criticalVlan': return isPortControlNotAuto || timeoutAction !== TimeoutAction.CRITICAL_VLAN
      default:
        return false
    }
  }

  useEffect(() => {
    if (editMode) { // TODO
      form.setFieldsValue({
        authDefaultVlan: 99
      })
    }

    setPreviousPath((location as LocationExtended)?.state?.from?.pathname)
  }, [])

  return (
    <>
      <PageHeader
        title={
          $t({ defaultMessage: '{action} Flexible Authentication' }, {
            action: editMode ? $t({ defaultMessage: 'Edit' }) : $t({ defaultMessage: 'Add' })
          })
        }
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'Policies & Profiles' }) }
        ]}
      />

      <StepsForm
        form={form}
        // formRef={formRef}
        onFinish={onFinish}
        onCancel={() =>
          redirectPreviousPage(navigate, previousPath, `${basePath.pathname}/flexibleAuthentication/list`)
        }
        style={{ width: '280px' }}
        buttonLabel={{
          submit: editMode ?
            $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' }),
          cancel: $t({ defaultMessage: 'Cancel' })
        }}
      >
        <StepsForm.StepForm
          onFinishFailed={({ errorFields }) => {
            // const detailsFields = ['venueId', 'name', 'description']
            // const hasErrorFields = !!errorFields.length
            // const isSettingsTabActive = currentTab === 'settings'
            // const isDetailsFieldsError = errorFields.filter(field => {
            //   const errorFieldName = field.name[0] as string
            //   return detailsFields.includes(errorFieldName)
            //     || errorFieldName.includes('serialNumber')
            // }).length > 0

            // if (deviceOnline && hasErrorFields && !isDetailsFieldsError && !isSettingsTabActive) {
            //   setCurrentTab('settings')
            //   showToast({
            //     type: 'error',
            //     content: readOnly
            //       ? $t(SwitchMessages.PLEASE_CHECK_INVALID_VALUES_AND_MODIFY_VIA_CLI)
            //       : $t(SwitchMessages.PLEASE_CHECK_INVALID_VALUES)
            //   })
            // }
          }}
        >
          <Loader
            states={[]}
          >
            <Form.Item
              name='name'
              label={$t({ defaultMessage: 'Profile Name' })}
              rules={[
                { required: true },
                { validator: (_, value) => normalNameRegExp(value) }
              ]}
              children={
                <Input maxLength={64} />
              }
            />
            <Form.Item
              name='type'
              label={$t({ defaultMessage: 'Type' })}
              initialValue={ProfileType._802_1X}
              children={<Select
                data-testid='profile-type'
                options={[
                  { label: $t({ defaultMessage: '802.1x' }), value: ProfileType._802_1X },
                  { label: $t({ defaultMessage: 'MAC-AUTH' }), value: ProfileType.MACAUTH },
                  { label: $t({ defaultMessage: '802.1x and MAC-AUTH' }), value: ProfileType._802_1X_AND_MACAUTH }
                ]}
                onChange={(value) => {
                  // setSelectType(value)
                  if (value !== ProfileType._802_1X) {
                    const values = form.getFieldsValue()
                    form.setFieldsValue({
                      ...values,
                      portControl: PortControl.AUTO
                    })
                  }

                }}
              />}
            />
            <Space style={{ display: 'flex', margin: '14px 0 30px', justifyContent: 'space-between' }}>
              <Typography.Text style={{ display: 'flex', fontSize: '12px' }}>
                {$t({ defaultMessage: 'Change Authentication Order' })}
                <Tooltip.Question
                  title={$t({ defaultMessage: 'The default order is Type 802.1x followed by Type MAC-AUTH. Enable this option will change the order.' })}
                  iconStyle={{ width: '16px', height: '16px', marginLeft: '4px' }}
                />
              </Typography.Text>
              <Form.Item
                noStyle
                name='authOrder'
                children={
                  <Switch
                    disabled={getFieldDisabled('authOrder')}
                  />
                }
              />
            </Space>
            {/* <Form.Item
                name='authOrder'
                label={$t({ defaultMessage: 'Change Authentication Order' })}
                children={
                  <Switch
                    disabled={getFieldDisabled('authOrder')}
                  />
                }
              /> */}
            <Form.Item
              name='portControl'
              label={$t({ defaultMessage: 'Port Control' })}
              initialValue={PortControl.AUTO}
              children={<Select
                data-testid='port-control-type'
                options={[
                  { label: $t({ defaultMessage: 'Auto' }), value: PortControl.AUTO },
                  { label: $t({ defaultMessage: 'Force Authorized' }), value: PortControl.FORCE_AUTHORIZED },
                  { label: $t({ defaultMessage: 'Force Unauthorized' }), value: PortControl.FORCE_UNAUTHORIZED }
                ]}
                disabled={getFieldDisabled('portControl')}
                onChange={(value) => {
                  if (value !== PortControl.AUTO) {
                    const values = form.getFieldsValue()
                    form.setFieldsValue({
                      ...values,
                      authDefaultVlan: '',
                      failAction: FailAction.BLOCK,
                      restrictedVlan: '',
                      timeoutAction: TimeoutAction.NONE,
                      criticalVlan: ''
                    })
                  }
                }}
              />}
            />
            <Form.Item
              name='authDefaultVlan'
              label={$t({ defaultMessage: 'Auth Default VLAN' })}
              rules={[
                { required: true },
                { validator: (_, value) => validateVlanExceptReservedVlanId(value) }
              ]}
              children={
                <Input
                  disabled={getFieldDisabled('authDefaultVlan')}
                />
              }
            />
            <Form.Item
              name='failAction'
              label={$t({ defaultMessage: 'Fail Action' })}
              initialValue={FailAction.BLOCK}
              children={<Select
                data-testid='fail-action'
                disabled={getFieldDisabled('failAction')}
                options={[
                  { label: $t({ defaultMessage: 'Restricted VLAN' }), value: FailAction.RESTRICTED_VLAN },
                  { label: $t({ defaultMessage: 'Block' }), value: FailAction.BLOCK }
                ]}
                onChange={(value) => {
                  if (value === FailAction.BLOCK) {
                    const values = form.getFieldsValue()
                    form.setFieldsValue({
                      ...values,
                      restrictedVlan: ''
                    })
                  }
                }}
              />}
            />
            <Form.Item
              name='restrictedVlan'
              label={$t({ defaultMessage: 'Restricted VLAN' })}
              rules={[
                ...(failAction === FailAction.RESTRICTED_VLAN
                  ? [
                    { validator: (_:unknown, value: string) => validateVlanExceptReservedVlanId(value) },
                    { validator: (_:unknown, value: string) => {
                      if (Number(value) === Number(authDefaultVlan)) {
                        return Promise.reject(
                          $t({ defaultMessage: 'VLAN ID Can not be same as Auth Default VLAN' })
                        )
                      }
                      return Promise.resolve()
                    }
                    }] : []
                )
              ]}
              children={
                <Input
                  disabled={getFieldDisabled('restrictedVlan')}
                />
              }
            />
            <Form.Item
              name='timeoutAction'
              label={$t({ defaultMessage: 'Timeout Action' })}
              initialValue={TimeoutAction.NONE}
              children={<Select
                data-testid='fail-action'
                disabled={getFieldDisabled('timeoutAction')}
                options={[
                  { label: $t({ defaultMessage: 'Critical VLAN' }), value: TimeoutAction.CRITICAL_VLAN },
                  { label: $t({ defaultMessage: 'Success' }), value: TimeoutAction.SUCCESS },
                  { label: $t({ defaultMessage: 'Failure' }), value: TimeoutAction.FAILURE },
                  { label: $t({ defaultMessage: 'None' }), value: TimeoutAction.NONE }
                ]}
                onChange={(value) => {
                  if (value !== TimeoutAction.CRITICAL_VLAN) {
                    const values = form.getFieldsValue()
                    form.setFieldsValue({
                      ...values,
                      criticalVlan: ''
                    })
                  }
                }}
              />}
            />
            <Form.Item
              name='criticalVlan'
              label={$t({ defaultMessage: 'Critical VLAN' })}
              rules={[
                ...(timeoutAction === TimeoutAction.CRITICAL_VLAN
                  ? [
                    { validator: (_:unknown, value: string) => validateVlanExceptReservedVlanId(value) },
                    { validator: (_:unknown, value: string) => {
                      if (Number(value) === Number(authDefaultVlan)) {
                        return Promise.reject(
                          $t({ defaultMessage: 'VLAN ID Can not be same as Auth Default VLAN' })
                        )
                      }
                      return Promise.resolve()
                    }
                    }] : []
                )
              ]}
              children={
                <Input
                  disabled={getFieldDisabled('criticalVlan')}
                />
              }
            />
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
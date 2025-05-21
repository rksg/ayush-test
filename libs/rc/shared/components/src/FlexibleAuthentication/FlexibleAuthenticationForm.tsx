import { useEffect } from 'react'

import { Form, FormInstance, Typography, Input, Select, Space, Switch } from 'antd'
import { useIntl }                                                      from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsForm,
  Tooltip
} from '@acx-ui/components'
import { useGetFlexAuthenticationProfilesQuery } from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  FlexibleAuthentication,
  FlexAuthMessages,
  FlexAuthVlanLabel,
  whitespaceOnlyRegExp,
  PolicyType,
  validateVlanExcludingReserved,
  usePolicyListBreadcrumb,
  usePolicyPageHeaderTitle,
  PolicyOperation,
  usePolicyPreviousPath
} from '@acx-ui/rc/utils'
import {
  useNavigate
} from '@acx-ui/react-router-dom'

import {
  AuthenticationType,
  authenticationTypeLabel,
  AuthFailAction,
  authFailActionTypeLabel,
  AuthTimeoutAction,
  authTimeoutActionTypeLabel,
  handleAuthFieldChange,
  getAuthFieldDisabled,
  shouldHideAuthField,
  PortControl,
  portControlTypeLabel,
  checkVlanDiffFromTargetVlan
} from './index'

export const FlexibleAuthenticationForm = (props: {
  editMode?: boolean
  data?: FlexibleAuthentication
  form: FormInstance
  onFinish: (values: FlexibleAuthentication) => Promise<boolean | void>

}) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { useWatch } = Form
  const [form] = Form.useForm()
  const { editMode, onFinish } = props
  const pageTitle = usePolicyPageHeaderTitle(editMode ?? false, PolicyType.FLEX_AUTH)
  const previousPath = usePolicyPreviousPath(PolicyType.FLEX_AUTH, PolicyOperation.LIST)

  const authFormWatchValues = [
    useWatch<string>('authenticationType', form),
    useWatch<string>('dot1xPortControl', form),
    useWatch<string>('authDefaultVlan', form),
    useWatch<string>('authFailAction', form),
    useWatch<string>('authTimeoutAction', form)
  ]

  const [
    , , authDefaultVlan, authFailAction, authTimeoutAction
  ] = authFormWatchValues

  const { authenticationProfiles, isProfileListLoading } = useGetFlexAuthenticationProfilesQuery(
    { payload: {
      pageSize: 10000
    } }, {
      selectFromResult: ( { data, isLoading } ) => {
        return {
          authenticationProfiles: data?.data ?? [],
          isProfileListLoading: isLoading
        }
      }
    }
  )

  useEffect(() => {
    if (editMode && props.data) {
      form.setFieldsValue({
        ...props.data,
        dot1xPortControl: props.data?.dot1xPortControl ?? ''
      })
    }
  }, [editMode, props.data])

  return (
    <>
      <PageHeader
        title={pageTitle}
        breadcrumb={usePolicyListBreadcrumb(PolicyType.FLEX_AUTH)}
      />

      <StepsForm
        form={form}
        onFinish={onFinish}
        onCancel={() => navigate(previousPath)}
        style={{ width: '280px' }}
        buttonLabel={{
          submit: editMode ?
            $t({ defaultMessage: 'Apply' }) : $t({ defaultMessage: 'Add' }),
          cancel: $t({ defaultMessage: 'Cancel' })
        }}
      >
        <StepsForm.StepForm>
          <Loader
            states={[{
              isLoading: editMode ? (!props.data || isProfileListLoading) : isProfileListLoading
            }]}
          >
            <Form.Item
              name='profileName'
              label={$t({ defaultMessage: 'Profile Name' })}
              validateFirst
              rules={[
                { required: true },
                { validator: (_, value) => whitespaceOnlyRegExp(value) },
                {
                  validator: (rule, value) => {
                    const profileNameObjList = authenticationProfiles
                      .filter(p => editMode ? (p.id !== props?.data?.id) : p)
                      .map(p => ({ profileName: p.profileName }))

                    return checkObjectNotExists(
                      profileNameObjList, { profileName: value }, $t({ defaultMessage: 'Profile' })
                    )
                  }
                }
              ]}
              children={
                <Input maxLength={64} />
              }
            />
            <Form.Item
              name='authenticationType'
              label={$t({ defaultMessage: 'Type' })}
              initialValue={AuthenticationType._802_1X}
              children={<Select
                data-testid='authentication-type-select'
                options={Object.values(AuthenticationType).map(authType => ({
                  label: $t(authenticationTypeLabel[authType]),
                  value: authType
                }))}
                onChange={(value) => handleAuthFieldChange({
                  field: 'authenticationType', value, form
                })}
              />}
            />
            { !shouldHideAuthField('changeAuthOrder', authFormWatchValues) && <Space style={{
              display: 'flex', margin: '14px 0 30px', justifyContent: 'space-between'
            }}>
              <Typography.Text style={{ display: 'flex', fontSize: '12px' }}>
                {$t({ defaultMessage: 'Change Authentication Order' })}
                <Tooltip.Question
                  // eslint-disable-next-line max-len
                  title={$t({ defaultMessage: 'The default order is Type 802.1x followed by Type MAC-AUTH. Enable this option will change the order.' })}
                  iconStyle={{ width: '16px', height: '16px', marginLeft: '4px' }}
                />
              </Typography.Text>
              <Form.Item
                noStyle
                name='changeAuthOrder'
                valuePropName='checked'
                children={
                  <Switch
                    data-testid='change-auth-order-switch'
                    disabled={getAuthFieldDisabled('changeAuthOrder', authFormWatchValues)}
                  />
                }
              />
            </Space>}
            <Form.Item
              name='dot1xPortControl'
              label={$t({ defaultMessage: '802.1x Port Control' })}
              initialValue={PortControl.AUTO}
              children={<Select
                data-testid='port-control-select'
                options={Object.values(PortControl).map(controlType => ({
                  label: $t(portControlTypeLabel[controlType]),
                  value: controlType,
                  disabled: controlType !== PortControl.AUTO
                }))}
                disabled={getAuthFieldDisabled('dot1xPortControl', authFormWatchValues)}
                onChange={(value) => handleAuthFieldChange({
                  field: 'dot1xPortControl', value, form
                })}
              />}
            />
            <Form.Item
              name='authDefaultVlan'
              label={$t({ defaultMessage: 'Auth Default VLAN' })}
              validateFirst
              rules={[
                { required: true },
                { validator: (_, value) => validateVlanExcludingReserved(value) }
              ]}
              children={
                <Input data-testid='auth-vlan-input' />
              }
            />
            <Form.Item
              name='authFailAction'
              label={$t({ defaultMessage: 'Fail Action' })}
              initialValue={AuthFailAction.BLOCK}
              children={<Select
                data-testid='fail-action-select'
                disabled={getAuthFieldDisabled('authFailAction', authFormWatchValues)}
                options={Object.values(AuthFailAction).map(failType => ({
                  label: $t(authFailActionTypeLabel[failType]),
                  value: failType
                }))}
                onChange={(value) => handleAuthFieldChange({
                  field: 'authFailAction', value, form
                })}
              />}
            />
            <Form.Item
              name='restrictedVlan'
              label={$t({ defaultMessage: 'Restricted VLAN' })}
              hidden={shouldHideAuthField('restrictedVlan', authFormWatchValues)}
              validateFirst
              rules={[
                ...(authFailAction === AuthFailAction.RESTRICTED_VLAN
                  ? [{
                    validator: (_:unknown, value: string) =>
                      validateVlanExcludingReserved(value)
                  },
                  { validator: (_:unknown, value: string) =>
                    checkVlanDiffFromTargetVlan(
                      value, authDefaultVlan,
                      $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                        sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                        targetVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN)
                      })
                    )
                  }] : []
                )
              ]}
              children={
                <Input
                  data-testid='restricted-vlan-input'
                  disabled={getAuthFieldDisabled('restrictedVlan', authFormWatchValues)}
                />
              }
            />
            <Form.Item
              name='authTimeoutAction'
              label={$t({ defaultMessage: 'Timeout Action' })}
              initialValue={AuthTimeoutAction.NONE}
              children={<Select
                data-testid='timeout-action-select'
                disabled={getAuthFieldDisabled('authTimeoutAction', authFormWatchValues)}
                options={Object.values(AuthTimeoutAction).map(timeoutType => ({
                  label: $t(authTimeoutActionTypeLabel[timeoutType]),
                  value: timeoutType
                }))}
                onChange={(value) => handleAuthFieldChange({
                  field: 'authTimeoutAction', value, form
                })}
              />}
            />
            <Form.Item
              name='criticalVlan'
              label={$t({ defaultMessage: 'Critical VLAN' })}
              hidden={shouldHideAuthField('criticalVlan', authFormWatchValues)}
              validateFirst
              rules={[
                ...(authTimeoutAction === AuthTimeoutAction.CRITICAL_VLAN
                  ? [{
                    validator: (_:unknown, value: string) =>
                      validateVlanExcludingReserved(value)
                  },
                  { validator: (_:unknown, value: string) =>
                    checkVlanDiffFromTargetVlan(
                      value, authDefaultVlan,
                      $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                        sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                        targetVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN)
                      })
                    )
                  }] : []
                )
              ]}
              children={
                <Input
                  data-testid='critical-vlan-input'
                  disabled={getAuthFieldDisabled('criticalVlan', authFormWatchValues)}
                />
              }
            />
            <Form.Item
              name='guestVlan'
              label={$t({ defaultMessage: 'Guest VLAN' })}
              hidden={shouldHideAuthField('guestVlan', authFormWatchValues)}
              validateFirst
              rules={[{
                validator: (_:unknown, value: string) => {
                  if (!value) {
                    return Promise.resolve()
                  }
                  return validateVlanExcludingReserved(value)
                }
              },
              { validator: (_:unknown, value: string) =>
                checkVlanDiffFromTargetVlan(
                  value, authDefaultVlan,
                  $t(FlexAuthMessages.VLAN_CANNOT_SAME_AS_TARGET_VLAN, {
                    sourceVlan: $t(FlexAuthVlanLabel.VLAN_ID),
                    targetVlan: $t(FlexAuthVlanLabel.AUTH_DEFAULT_VLAN)
                  })
                )
              }]}
              children={
                <Input
                  disabled={getAuthFieldDisabled('guestVlan', authFormWatchValues)}
                />
              }
            />
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

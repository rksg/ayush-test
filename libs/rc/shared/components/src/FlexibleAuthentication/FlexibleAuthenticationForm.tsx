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
  getPolicyListRoutePath,
  getPolicyRoutePath,
  whitespaceOnlyRegExp,
  PolicyOperation,
  PolicyType,
  validateVlanExceptReservedVlanId
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink
} from '@acx-ui/react-router-dom'

import {
  AuthenticationType,
  authenticationTypeLabel,
  AuthFailAction,
  authFailActionTypeLabel,
  AuthTimeoutAction,
  authTimeoutActionTypeLabel,
  handleAuthFieldChange,
  getAuthfieldDisabled,
  shouldHideAuthField,
  PortControl,
  portControlTypeLabel,
  validateVlanDiffFromAuthDefault
} from './index'

export const FlexibleAuthenticationForm = (props: {
  editMode?: boolean
  data?: FlexibleAuthentication
  form: FormInstance
  onFinish: (values: FlexibleAuthentication) => Promise<boolean | void>

}) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/policies/')
  const flexAuthRoute = getPolicyRoutePath({
    type: PolicyType.FLEX_AUTH,
    oper: PolicyOperation.LIST
  })

  const { useWatch } = Form
  const [form] = Form.useForm()
  const { editMode, onFinish } = props

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
      form.setFieldsValue(props.data)
    }
  }, [editMode, props.data])

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
          { text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          { text: $t({ defaultMessage: 'Flexible Authentication' }), link: flexAuthRoute }
        ]}
      />

      <StepsForm
        form={form}
        onFinish={onFinish}
        onCancel={() =>
          navigate(`${basePath.pathname}/flexibleAuthentication/list`)
        }
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
                data-testid='authenticationType'
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
                children={
                  <Switch
                    disabled={getAuthfieldDisabled('changeAuthOrder', authFormWatchValues)}
                  />
                }
              />
            </Space>}
            <Form.Item
              name='dot1xPortControl'
              label={$t({ defaultMessage: 'Port Control' })}
              initialValue={PortControl.AUTO}
              children={<Select
                data-testid='dot1xPortControl'
                options={Object.values(PortControl).map(controlType => ({
                  label: $t(portControlTypeLabel[controlType]),
                  value: controlType
                }))}
                disabled={getAuthfieldDisabled('dot1xPortControl', authFormWatchValues)}
                onChange={(value) => handleAuthFieldChange({
                  field: 'dot1xPortControl', value, form
                })}
              />}
            />
            <Form.Item
              name='authDefaultVlan'
              label={$t({ defaultMessage: 'Auth Default VLAN' })}
              hidden={shouldHideAuthField('authDefaultVlan', authFormWatchValues)}
              validateFirst
              rules={[
                { required: true },
                { validator: (_, value) => validateVlanExceptReservedVlanId(value) }
              ]}
              children={
                <Input
                  disabled={getAuthfieldDisabled('authDefaultVlan', authFormWatchValues)}
                />
              }
            />
            <Form.Item
              name='authFailAction'
              label={$t({ defaultMessage: 'Fail Action' })}
              initialValue={AuthFailAction.BLOCK}
              hidden={shouldHideAuthField('authFailAction', authFormWatchValues)}
              children={<Select
                data-testid='authFailAction'
                disabled={getAuthfieldDisabled('authFailAction', authFormWatchValues)}
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
                      validateVlanExceptReservedVlanId(value)
                  },
                  { validator: (_:unknown, value: string) => {
                    if (Number(value) === Number(authDefaultVlan)) {
                      return Promise.reject(
                        $t(FlexAuthMessages.CANNOT_SAME_AS_AUTH_DEFAULT_VLAN)
                      )
                    }
                    return Promise.resolve()
                  }
                  }] : []
                )
              ]}
              children={
                <Input
                  disabled={getAuthfieldDisabled('restrictedVlan', authFormWatchValues)}
                />
              }
            />
            <Form.Item
              name='authTimeoutAction'
              label={$t({ defaultMessage: 'Timeout Action' })}
              initialValue={AuthTimeoutAction.NONE}
              hidden={shouldHideAuthField('authTimeoutAction', authFormWatchValues)}
              children={<Select
                data-testid='authTimeoutAction'
                disabled={getAuthfieldDisabled('authTimeoutAction', authFormWatchValues)}
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
                      validateVlanExceptReservedVlanId(value)
                  },
                  { validator: (_:unknown, value: string) => {
                    if (Number(value) === Number(authDefaultVlan)) {
                      return Promise.reject(
                        $t(FlexAuthMessages.CANNOT_SAME_AS_AUTH_DEFAULT_VLAN)
                      )
                    }
                    return Promise.resolve()
                  }
                  }] : []
                )
              ]}
              children={
                <Input
                  disabled={getAuthfieldDisabled('criticalVlan', authFormWatchValues)}
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
                  if (!value) {//TODO
                    return Promise.resolve()
                  }
                  return validateVlanExceptReservedVlanId(value)
                }
              },
              { validator: (_:unknown, value: string) => {
                if (!value) {
                  return Promise.resolve()
                }
                return validateVlanDiffFromAuthDefault(value, authDefaultVlan)
              }
              }]}
              children={
                <Input
                  disabled={getAuthfieldDisabled('guestVlan', authFormWatchValues)}
                />
              }
            />
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
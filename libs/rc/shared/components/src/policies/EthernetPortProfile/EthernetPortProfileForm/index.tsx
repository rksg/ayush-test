import { useEffect } from 'react'

import { Col, Form, FormInstance, Input, InputNumber, Row, Select, Space, Switch } from 'antd'
import { cloneDeep }                                                               from 'lodash'
import { useIntl }                                                                 from 'react-intl'
import { useLocation, useNavigate }                                                from 'react-router-dom'

import { Alert, PageHeader, PasswordInput, StepsForm, Subtitle, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import {
  LocationExtended,
  PolicyOperation,
  PolicyType,
  WifiNetworkMessages,
  checkVlanMember,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  redirectPreviousPage,
  EthernetPortAuthType,
  EthernetPortSupplicantType,
  EthernetPortProfileMessages,
  EthernetPortProfileFormType,
  getEthernetPortTypeOptions,
  getEthernetPortAuthTypeOptions,
  getEthernetPortCredentialTypeOptions,
  EthernetPortType,
  usePolicyListBreadcrumb,
  usePolicyPageHeaderTitle,
  useConfigTemplate
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { EthernetPortAAASettings } from '../AAASettings/EthernetPortAAASettings'

interface EthernetPortProfileFormProps {
  submitButtonLabel: string
  onFinish: (values: EthernetPortProfileFormType) => void
  form: FormInstance
  onCancel?: () => void
  isEditMode?: boolean
  isEmbedded?: boolean
}

export const EthernetPortProfileForm = (props: EthernetPortProfileFormProps) => {
  const {
    submitButtonLabel,
    onFinish,
    form: formRef,
    onCancel,
    isEditMode = false,
    isEmbedded = false
  } = props
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()

  const { useWatch } = Form
  const portType = useWatch('type', formRef)
  const untagId = useWatch('untagId', formRef)
  const authTypeRole = useWatch('authTypeRole', formRef)
  const supplicantType = useWatch(['supplicantAuthenticationOptions', 'type'], formRef)
  const dynamicVlanEnabled = useWatch('dynamicVlanEnabled', formRef)
  const authEnabled = useWatch('authEnabled', formRef)
  const clientVisibilityEnabled = useWatch('clientVisibilityEnabled', formRef)

  const isDynamicVLANEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_DVLAN_TOGGLE)
  const isSwitchPortProfileEnabled = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)
  const isWiredClientVisibilityEnabled = useIsSplitOn(Features.WIFI_WIRED_CLIENT_VISIBILITY_TOGGLE)

  const wifiBreadcrumb = usePolicyListBreadcrumb(PolicyType.ETHERNET_PORT_PROFILE)
  const switchBreadcrumb = [
    { text: $t({ defaultMessage: 'Network Control' }) },
    {
      text: $t({ defaultMessage: 'Policies & Profiles' }),
      link: getPolicyListRoutePath(true)
    },
    {
      text: $t({ defaultMessage: 'Ethernet Port Profile' }),
      link: '/policies/portProfile/wifi'
    }
  ]
  const breadcrumb = (isSwitchPortProfileEnabled && !isTemplate)? switchBreadcrumb : wifiBreadcrumb
  const pageTitle = usePolicyPageHeaderTitle(isEditMode, PolicyType.ETHERNET_PORT_PROFILE)

  const tablePath = getPolicyRoutePath({
    type: PolicyType.ETHERNET_PORT_PROFILE,
    oper: PolicyOperation.LIST
  })
  const navigate = useNavigate()
  const location = useLocation()
  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const linkToTableView = useTenantLink(tablePath)
  const linkToTableViewWithSwitch = useTenantLink('/policies/portProfile/wifi')

  const handleFinish = async () => {
    try{
      await onFinish(formRef.getFieldsValue())
    } catch(error) {
      console.log(error) // eslint-disable-line no-console
    }

    handleCancel()
  }

  const handleCancel = () => {
    (onCancel)? onCancel() : redirectPreviousPage(navigate, previousPath,
      isSwitchPortProfileEnabled ? linkToTableViewWithSwitch : linkToTableView)
  }

  // const ethernetPortProfileListPayload = {
  //   searchString: '',
  //   fields: ['name', 'id'],
  //   searchTargetFields: ['name'],
  //   filters: {},
  //   pageSize: 10000
  // }

  // const [ getInstanceList ] = useLazyGetEthernetPortProfileViewDataListQuery()


  // const nameValidator = async (value: string) => {
  //   const payload = { ...ethernetPortProfileListPayload, searchString: value }
  //   const list = (await getInstanceList({ params, payload }, true).unwrap()).data
  //     .filter(n => n.id !== params.policyId)
  //     .map(n => n.name)

  //   return checkObjectNotExists(list, value, $t({ defaultMessage: 'Profile Name' }))
  // }

  const portTypeAndAuthTypeMapping = {
    [EthernetPortAuthType.SUPPLICANT]: [EthernetPortType.TRUNK],
    [EthernetPortAuthType.PORT_BASED]: [
      EthernetPortType.TRUNK,
      EthernetPortType.ACCESS,
      EthernetPortType.SELECTIVE_TRUNK
    ],
    [EthernetPortAuthType.MAC_BASED]: [EthernetPortType.ACCESS]
  }

  const authTypeRoleOptionsArray = getEthernetPortAuthTypeOptions()
    .filter((element) => {
      return portTypeAndAuthTypeMapping[element.value as keyof typeof portTypeAndAuthTypeMapping]
        .includes(portType)
    })

  const onPortTypeChanged = (currentPortType:EthernetPortType) => {
    if(currentPortType === EthernetPortType.TRUNK) {
      formRef.setFieldsValue({
        untagId: 1,
        vlanMembers: '1-4094',
        authTypeRole: EthernetPortAuthType.SUPPLICANT
      })
    }

    if(currentPortType === EthernetPortType.ACCESS) {
      formRef.setFieldsValue({
        vlanMembers: untagId,
        authTypeRole: EthernetPortAuthType.PORT_BASED
      })
    }

    if(currentPortType === EthernetPortType.SELECTIVE_TRUNK) {
      formRef.setFieldValue('authTypeRole', EthernetPortAuthType.PORT_BASED)
    }
  }

  useEffect(()=>{
    if (!isEditMode) {
      if(portType === EthernetPortType.TRUNK) {
        formRef.setFieldsValue({
          untagId: 1,
          vlanMembers: '1-4094',
          authTypeRole: EthernetPortAuthType.SUPPLICANT
        })
      }

      if(portType === EthernetPortType.ACCESS) {
        formRef.setFieldsValue({
          vlanMembers: untagId,
          authTypeRole: EthernetPortAuthType.PORT_BASED
        })
      }

      if(portType === EthernetPortType.SELECTIVE_TRUNK) {
        formRef.setFieldValue('authTypeRole', EthernetPortAuthType.PORT_BASED)
      }
    }

  }, [portType])

  useEffect(()=>{
    if(portType === EthernetPortType.ACCESS) {
      formRef.setFieldValue('vlanMembers', untagId)
    }
  }, [untagId])

  useEffect(()=>{
    if (authTypeRole === EthernetPortAuthType.PORT_BASED ||
      authTypeRole === EthernetPortAuthType.MAC_BASED) {
      formRef.setFieldValue('clientVisibilityEnabled', true)
    }
  }, [authTypeRole])

  return (
    <>
      {!isEmbedded &&
        <PageHeader
          title={pageTitle}
          breadcrumb={breadcrumb}
        />
      }
      <StepsForm
        form={formRef}
        onFinish={handleFinish}
        onCancel={handleCancel}
        buttonLabel={{ submit: submitButtonLabel }}
      >
        <StepsForm.StepForm>
          <Row>
            <Col span={12}>
              <Form.Item
                name='name'
                label={$t({ defaultMessage: 'Profile Name' })}
                rules={[
                  { required: true },
                  { min: 2 },
                  { max: 32 }
                  //TODO: validate duplicate
                  // { validator: (_, value) => nameValidator(value) }
                ]}
                validateFirst
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                name='type'
                label={<>
                  {$t({ defaultMessage: 'Port Type' })}
                  <Tooltip.Question
                    title={$t(WifiNetworkMessages.LAN_PORTS_PORT_TOOLTIP)}
                    placement='bottom'
                  />
                </>
                }
                initialValue={EthernetPortType.TRUNK}
              >
                <Select
                  options={getEthernetPortTypeOptions()}
                  onChange={onPortTypeChanged}
                  disabled={isEditMode}
                >
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Subtitle level={3}>
            { $t({ defaultMessage: 'VLAN' }) }
          </Subtitle>
          <Row>
            <Col span={12}>
              <Form.Item
                name='untagId'
                label={<>
                  {$t({ defaultMessage: 'VLAN Untag ID' })}
                  <Tooltip.Question
                    title={$t(WifiNetworkMessages.LAN_PORTS_VLAN_UNTAG_TOOLTIP)}
                    placement='bottom'
                  />
                </>
                }
                rules={[
                  { required: true }
                ]}
              >
                <InputNumber
                  min={1}
                  max={4094}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Form.Item
                name='vlanMembers'
                label={<>
                  {$t({ defaultMessage: 'VLAN Members' })}
                  <Tooltip.Question
                    title={$t(WifiNetworkMessages.LAN_PORTS_VLAN_MEMBERS_TOOLTIP)}
                    placement='bottom'
                  />
                </>
                }
                rules={[
                  { required: true },
                  { validator: (_, value) => checkVlanMember(value) }
                ]}
              >
                <Input
                  disabled={
                    portType === EthernetPortType.TRUNK ||
                    portType === EthernetPortType.ACCESS
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          {!isTemplate &&
          <>
            <Subtitle level={3}>
              {$t({ defaultMessage: '802.1X' })}
            </Subtitle>
            <StepsForm.FieldLabel width={'280px'}>
              {$t({ defaultMessage: '802.1X Authentication' })}
              <Form.Item
                name='authEnabled'
                valuePropName={'checked'}
              >
                <Switch disabled={isEditMode} />
              </Form.Item>
            </StepsForm.FieldLabel>
            {isWiredClientVisibilityEnabled && authTypeRole !== EthernetPortAuthType.SUPPLICANT &&
              <>
                <StepsForm.FieldLabel width={'280px'}>
                  <Space>
                    {$t({ defaultMessage: 'Client Visibility' })}
                    <Tooltip.Question
                      title={$t(EthernetPortProfileMessages.CLIENT_VISIBILITY)}
                      placement='bottom'
                      iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }} />
                  </Space>
                  <Form.Item
                    name='clientVisibilityEnabled'
                    valuePropName={'checked'}
                  >
                    <Switch disabled={
                      authTypeRole === EthernetPortAuthType.PORT_BASED ||
                      authTypeRole === EthernetPortAuthType.MAC_BASED} />
                  </Form.Item>
                </StepsForm.FieldLabel>
                {clientVisibilityEnabled &&
                  <Alert
                    showIcon={true}
                    style={{ verticalAlign: 'middle', width: '16vw' }}
                    message={$t(EthernetPortProfileMessages.ALERT_CLIENT_VISIBILITY)} />
                }
              </>
            }
            {authEnabled && <>
              <Row>
                <Col span={12}>
                  <Form.Item
                    name='authTypeRole'
                    label={<>
                      {$t({ defaultMessage: '802.1X Role' })}
                      <Tooltip.Question
                        title={
                          (portType === EthernetPortType.TRUNK) ?
                            $t(EthernetPortProfileMessages.AUTH_TYPE_ROLE_TRUNK):
                            $t(EthernetPortProfileMessages.AUTH_TYPE_ROLE_ACCESS)
                        }
                        placement='bottom'
                      />
                    </>
                    }
                  >
                    <Select
                      options={authTypeRoleOptionsArray}
                      disabled={isEditMode}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {authTypeRole === EthernetPortAuthType.SUPPLICANT &&
              <Row>
                <Col span={12}>
                  <Form.Item
                    name={['supplicantAuthenticationOptions', 'type']}
                    label={<>
                      {$t({ defaultMessage: 'Credential Type' })}
                    </>
                    }
                    initialValue={EthernetPortSupplicantType.MAC_AUTH}
                  >
                    <Select
                      disabled={!(authEnabled || authTypeRole === EthernetPortAuthType.SUPPLICANT)}
                      options={getEthernetPortCredentialTypeOptions()}
                    />
                  </Form.Item>
                </Col>
              </Row>
              }
              {supplicantType === EthernetPortSupplicantType.CUSTOM &&
              <>
                <Row>
                  <Col span={12}>
                    <Form.Item
                      name={['supplicantAuthenticationOptions', 'username']}
                      label={<>
                        {$t({ defaultMessage: 'Username' })}
                      </>
                      }
                      rules={[
                        { required: true }
                      ]}
                    >
                      <Input
                        disabled={
                          supplicantType !== EthernetPortSupplicantType.CUSTOM
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <Form.Item
                      name={['supplicantAuthenticationOptions', 'password']}
                      label={<>
                        {$t({ defaultMessage: 'Password' })}
                      </>
                      }
                      rules={[
                        { required: true }
                      ]}
                    >
                      <PasswordInput
                        disabled={
                          supplicantType !== EthernetPortSupplicantType.CUSTOM
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
              }
              {authTypeRole !== EthernetPortAuthType.SUPPLICANT &&
              <>
                <EthernetPortAAASettings />
                <Row>
                  <Col span={12}>
                    <StepsForm.FieldLabel width={'280px'}>
                      <Space >
                        {$t({ defaultMessage: 'Use MAC auth bypass' })}
                        <Tooltip.Question
                          title={$t(EthernetPortProfileMessages.MAC_AUTH_BYPASS)}
                          placement='bottom'
                          iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
                        />
                      </Space>
                      <Form.Item
                        name='bypassMacAddressAuthentication'
                        valuePropName={'checked'}
                      >
                        <Switch />
                      </Form.Item>
                    </StepsForm.FieldLabel>
                  </Col>
                </Row>
              </>
              }
              {(authTypeRole === EthernetPortAuthType.MAC_BASED && isDynamicVLANEnabled) &&
            <StepsForm.FieldLabel width={'280px'}>
              <Space >
                {$t({ defaultMessage: 'Dynamic VLAN' })}
                <Tooltip.Question
                  title={$t(EthernetPortProfileMessages.DYNAMIC_VLAN)}
                  placement='bottom'
                />
              </Space>

              <Form.Item
                name='dynamicVlanEnabled'
                valuePropName={'checked'}
              >
                <Switch />
              </Form.Item>
            </StepsForm.FieldLabel>
              }
            </>
            }
            {dynamicVlanEnabled &&
          <Row>
            <Col span={12}>
              <Form.Item
                name='unauthenticatedGuestVlan'
                label={<>
                  {$t({ defaultMessage: 'Guest VLAN' })}
                  <Tooltip.Question
                    title={$t(EthernetPortProfileMessages.GUEST_VLAN)}
                    placement='bottom'
                  />
                </>
                }
                rules={[
                  { required: true }
                ]}
              >
                <InputNumber
                  min={1}
                  max={4094}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
            }
          </>}
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
export const requestPreProcess = (
  isWiredClientVisibilityEnabled: boolean, data: EthernetPortProfileFormType) => {
  const {
    authRadius,
    accountingRadius,
    authEnabled,
    authTypeRole,
    clientVisibilityEnabled,
    ...result } = cloneDeep(data)

  result.authType = (authEnabled) ?
    (authTypeRole ?? EthernetPortAuthType.DISABLED) :
    (isWiredClientVisibilityEnabled && clientVisibilityEnabled ?
      EthernetPortAuthType.OPEN : EthernetPortAuthType.DISABLED)

  return result
}
import { useEffect } from 'react'

import { Col, Form, FormInstance, Input, InputNumber, Row, Select, Space, Switch } from 'antd'
import { cloneDeep }                                                               from 'lodash'
import { useIntl }                                                                 from 'react-intl'
import { useLocation, useNavigate }                                                from 'react-router-dom'

import { PageHeader, PasswordInput, StepsForm, Subtitle, Tooltip } from '@acx-ui/components'
import { Features, useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import {
  ApLanPortTypeEnum,
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
  getEthernetPortCredentialTypeOptions
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { EthernetPortAAASettings } from '../AAASettings/EthernetPortAAASettings'

interface EthernetPortProfileFormProps {
  title: string
  submitButtonLabel: string
  onFinish: (values: EthernetPortProfileFormType) => void
  form: FormInstance
  onCancel?: () => void
  isNoPageHeader?: boolean
}

export const EthernetPortProfileForm = (props: EthernetPortProfileFormProps) => {
  const { title, submitButtonLabel, onFinish, form: formRef, onCancel } = props
  const { $t } = useIntl()
  // const params = useParams()
  const portType = Form.useWatch('type', formRef)
  const untagId = Form.useWatch('untagId', formRef)
  const authTypeRole = Form.useWatch('authTypeRole', formRef)
  const supplicantType = Form.useWatch(['supplicantAuthenticationOptions', 'type'], formRef)
  const dynamicVlanEnabled = Form.useWatch('dynamicVlanEnabled', formRef)
  const authEnabled = Form.useWatch('authEnabled', formRef)
  const isDynamicVLANEnabled = useIsSplitOn(Features.ETHERNET_PORT_PROFILE_DVLAN_TOGGLE)
  const isNoPageHeader = props.isNoPageHeader? props.isNoPageHeader : false

  const tablePath = getPolicyRoutePath({
    type: PolicyType.ETHERNET_PORT_PROFILE,
    oper: PolicyOperation.LIST
  })
  const navigate = useNavigate()
  const location = useLocation()
  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const linkToTableView = useTenantLink(tablePath)

  const handleFinish = async () => {
    try{
      await onFinish(formRef.getFieldsValue())
    } catch(error) {
      console.log(error) // eslint-disable-line no-console
    }
    // redirectPreviousPage(navigate, previousPath, linkToTableView)
    (onCancel)? onCancel() : redirectPreviousPage(navigate, previousPath, linkToTableView)
  }

  const handleCancel = () => {
    (onCancel)? onCancel() : redirectPreviousPage(navigate, previousPath, linkToTableView)
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
    [EthernetPortAuthType.SUPPLICANT]: [ApLanPortTypeEnum.TRUNK],
    [EthernetPortAuthType.PORT_BASED]: [
      ApLanPortTypeEnum.TRUNK,
      ApLanPortTypeEnum.ACCESS,
      ApLanPortTypeEnum.GENERAL
    ],
    [EthernetPortAuthType.MAC_BASED]: [ApLanPortTypeEnum.ACCESS]
  }

  const authTypeRoleOptionsArray = getEthernetPortAuthTypeOptions()
    .filter((element) => {
      return portTypeAndAuthTypeMapping[element.value as keyof typeof portTypeAndAuthTypeMapping]
        .includes(portType)
    })


  const onPortTypeChanged = (currentPortType:ApLanPortTypeEnum) => {
    if(currentPortType === ApLanPortTypeEnum.TRUNK) {
      formRef.setFieldsValue({
        untagId: 1,
        vlanMembers: '1-4094',
        authTypeRole: EthernetPortAuthType.SUPPLICANT
      })
    }

    if(currentPortType === ApLanPortTypeEnum.ACCESS) {
      formRef.setFieldsValue({
        vlanMembers: untagId,
        authTypeRole: EthernetPortAuthType.PORT_BASED
      })
    }

    // if(currentPortType === ApLanPortTypeEnum.GENERAL) {
    //   formRef.setFieldValue('authTypeRole', EthernetPortAuthType.PORT_BASED)
    // }
  }

  // useEffect(()=>{
  //   if(portType === ApLanPortTypeEnum.TRUNK) {
  //     formRef.setFieldsValue({
  //       untagId: 1,
  //       vlanMembers: '1-4094',
  //       authTypeRole: EthernetPortAuthType.SUPPLICANT
  //     })
  //   }

  //   if(portType === ApLanPortTypeEnum.ACCESS) {
  //     formRef.setFieldsValue({
  //       vlanMembers: untagId,
  //       authTypeRole: EthernetPortAuthType.PORT_BASED
  //     })
  //   }

  //   // if(portType === ApLanPortTypeEnum.GENERAL) {
  //   //   formRef.setFieldValue('authTypeRole', EthernetPortAuthType.PORT_BASED)
  //   // }
  // }, [portType])

  useEffect(()=>{
    if(portType === ApLanPortTypeEnum.ACCESS) {
      formRef.setFieldValue('vlanMembers', untagId)
    }
  }, [untagId])

  return (
    <>
      {!isNoPageHeader &&
      <PageHeader
        title={title}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Ethernet Port Profile' }),
            link: tablePath
          }
        ]}
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
                initialValue={ApLanPortTypeEnum.TRUNK}
              >
                <Select
                  options={getEthernetPortTypeOptions()}
                  onChange={onPortTypeChanged}
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
                    // portType === ApLanPortTypeEnum.TRUNK ||
                    portType === ApLanPortTypeEnum.ACCESS
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Subtitle level={3}>
            {$t({ defaultMessage: '802.1X' })}
          </Subtitle>
          <StepsForm.FieldLabel width={'280px'}>
            {$t({ defaultMessage: '802.1X Authentication' })}
            <Form.Item
              name='authEnabled'
              valuePropName={'checked'}
            >
              <Switch />
            </Form.Item>
          </StepsForm.FieldLabel>
          {authEnabled && <>
            <Row>
              <Col span={12}>
                <Form.Item
                  name='authTypeRole'
                  label={<>
                    {$t({ defaultMessage: '802.1X Role' })}
                    <Tooltip.Question
                      title={
                        (portType === ApLanPortTypeEnum.TRUNK) ?
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
                  >
                  </Select>
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
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )

}
export const requestPreProcess = (data: EthernetPortProfileFormType) => {
  const { authRadius, accountingRadius, authEnabled, authTypeRole, ...result } = cloneDeep(data)

  result.authType = (authEnabled) ?
    (authTypeRole ?? EthernetPortAuthType.DISABLED) : EthernetPortAuthType.DISABLED

  return result
}

// export default EthernetPortProfileForm
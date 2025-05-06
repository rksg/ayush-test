import { useEffect, useState } from 'react'

import {
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  PasswordInput,
  StepsForm
} from '@acx-ui/components'
import {
  useAddIotControllerMutation,
  useGetIotControllerQuery,
  useUpdateIotControllerMutation,
  useTestConnectionIotControllerMutation
} from '@acx-ui/rc/services'
import {
  redirectPreviousPage,
  whitespaceOnlyRegExp,
  IotControllerSetting,
  excludeSpaceRegExp,
  domainNameRegExp,
  trailingNorLeadingSpaces
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { useUserProfileContext } from '@acx-ui/user'

import { FieldTitle } from './styledComponents'

export enum TestConnectionStatusEnum {
  PASS = 'PASS',
  FAIL = 'FAIL'
}


export function IotControllerForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const { isCustomRole } = useUserProfileContext()

  const [form] = Form.useForm()
  const publicEnabled = Form.useWatch('publicEnabled', form)
  const [ testConnectionIotController, { isLoading: isTesting }] =
    useTestConnectionIotControllerMutation()
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestConnectionStatusEnum>()
  let currentTestConnectionFun: ReturnType<typeof testConnectionIotController> | undefined

  const linkToIotController = useTenantLink('/devices/iotController')
  const [addIotController] = useAddIotControllerMutation()
  const [updateIotController] = useUpdateIotControllerMutation()

  const { tenantId, iotId, venueId, action } = useParams()
  // eslint-disable-next-line max-len
  const { data, isLoading: isIotControllerLoading } = useGetIotControllerQuery({ params: { tenantId, iotId, venueId } },
    { skip: !iotId })

  const onClickTestConnection = async () => {
    try {
      await form.validateFields(['adminDomainName', 'adminPassword', 'host'])
    } catch (error) {
      return
    }
    setTestConnectionStatus(undefined)
    const { publicAddress, publicPort, apiKey } = form.getFieldsValue()
    const payload = {
      publicAddress,
      publicPort,
      apiKey
    }
    try{
      currentTestConnectionFun = testConnectionIotController({
        payload: payload
      })
      const result = await currentTestConnectionFun.unwrap()
      if(result.requestId){
        setTestConnectionStatus(TestConnectionStatusEnum.PASS)
      }
    }catch (error) {
      setTestConnectionStatus(TestConnectionStatusEnum.FAIL)
    }
  }

  const handleAddIotController = async (values: IotControllerSetting) => {
    try {
      const formData = { ...values }
      await addIotController({ params: { ...params },
        payload: formData }).unwrap()

      navigate(linkToIotController, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleEditIotController = async (values: IotControllerSetting) => {
    try {
      const formData = { ...values, id: data?.id } // rwg update API use post method where rwgId is required to pass
      await updateIotController({ params, payload: formData }).unwrap()

      navigate(linkToIotController, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const isEditMode: boolean = action === 'edit'

  const loadForm: boolean = isEditMode ? !!data : true

  useEffect(() => {
    return () => {
      currentTestConnectionFun && currentTestConnectionFun.abort()
    }
  }, [])

  return (
    <>
      <PageHeader
        title={!isEditMode
          ? $t({ defaultMessage: 'Add IoT Controller' })
          : data?.name}
        breadcrumb={[
          { text: $t({ defaultMessage: 'IoT Controllers List' }), link: '/devices/iotController' }
        ]}
      />
      { loadForm && <StepsForm
        form={form}
        onFinish={isEditMode ? handleEditIotController : handleAddIotController}
        onCancel={() =>
          redirectPreviousPage(navigate, '', linkToIotController)
        }
        disabled={isCustomRole}
        buttonLabel={{ submit: isEditMode ?
          $t({ defaultMessage: 'Save' }):
          $t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <Loader states={[{
            isLoading: isIotControllerLoading
          }]}>
            <Row gutter={20}>
              <Col span={8}>
                <Form.Item
                  name='name'
                  initialValue={data?.name}
                  label={$t({ defaultMessage: 'IoT Controller Name' })}
                  rules={[
                    { type: 'string', required: true },
                    { min: 2, transform: (value) => value.trim() },
                    { max: 32, transform: (value) => value.trim() },
                    { validator: (_, value) => whitespaceOnlyRegExp(value) },
                    { validator: (_, value) => trailingNorLeadingSpaces(value) }
                  ]}
                  validateFirst
                  hasFeedback
                  children={<Input />}
                  validateTrigger={'onBlur'}
                />
                <Form.Item
                  name='inboundAddress'
                  initialValue={data?.inboundAddress}
                  label={$t({ defaultMessage: 'FQDN / IP (AP Inbound IP address)' })}
                  rules={[
                    { type: 'string', required: true,
                      message: $t({ defaultMessage: 'Please enter FQDN / IP' })
                    },
                    { validator: (_, value) => domainNameRegExp(value),
                      message: $t({ defaultMessage: 'Please enter a valid FQDN / IP' })
                    }
                  ]}
                  children={<Input />}
                />
                <StepsForm.FieldLabel width={'280px'}
                  style={{ height: '28px' }}
                >
                  {$t({ defaultMessage: 'Enable Public IP address' })}
                  <Form.Item
                    name='publicEnabled'
                    valuePropName={'checked'}
                  >
                    <Switch disabled={isEditMode} />
                  </Form.Item>
                </StepsForm.FieldLabel>
                <FieldTitle>
                  {
                    // eslint-disable-next-line max-len
                    $t({ defaultMessage: 'If Public IP address is not enabled, no information will be fetched from vRIoT Controller.' })
                  }
                </FieldTitle>
                {publicEnabled && <>
                  <Form.Item>
                    <Space>
                      <Form.Item
                        name='publicAddress'
                        initialValue={data?.publicAddress}
                        label={$t({ defaultMessage: 'FQDN / IP' })}
                        rules={[
                          { validator: (_, value) => domainNameRegExp(value) }
                        ]}
                        children={<Input />}
                      />
                      <Form.Item
                        name='publicPort'
                        initialValue={data?.publicPort}
                        label={$t({ defaultMessage: 'Port' })}
                        rules={[
                          { type: 'number', min: 1 },
                          { type: 'number', max: 65535 }
                        ]}
                        children={<InputNumber
                          min={1}
                          max={65535}/>}
                      />
                    </Space>
                  </Form.Item>
                  <Form.Item
                    name='apiKey'
                    initialValue={data?.apiKey}
                    label={$t({ defaultMessage: 'API Key' })}
                    rules={[
                      { required: true,
                        message: $t({ defaultMessage: 'Please enter API Key' }) },
                      { validator: (_, value) => excludeSpaceRegExp(value) }
                    ]}
                    children={<PasswordInput />}
                  />
                  <div style={{ textAlign: 'right' }}>
                    <Button
                      style={{
                        background: 'var(--acx-primary-black)',
                        color: 'var(--acx-primary-white)',
                        borderColor: 'var(--acx-primary-black)'
                      }}
                      type='primary'
                      htmlType='submit'
                      disabled={isTesting}
                      loading={isTesting}
                      onClick={onClickTestConnection}
                    >
                      {$t({ defaultMessage: 'Test Connection' })}
                    </Button>
                    {testConnectionStatus}
                  </div>
                </>}
                <Form.Item
                  name='iotSerialNumber'
                  initialValue={data?.iotSerialNumber}
                  label={$t({ defaultMessage: 'IoT Controller Serial Number' })}
                  rules={[
                    {
                      required: true,
                      message: $t({ defaultMessage: 'Please enter Serial Number' })
                    }
                  ]}
                  children={<Input disabled={isEditMode} />}
                  validateFirst
                />
              </Col>
            </Row>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
      }
    </>
  )
}

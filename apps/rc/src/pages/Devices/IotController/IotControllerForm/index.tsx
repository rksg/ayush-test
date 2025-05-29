import { useEffect, useState } from 'react'

import {
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  PasswordInput,
  StepsForm,
  Tooltip
} from '@acx-ui/components'
import {
  useAddIotControllerMutation,
  useGetIotControllerQuery,
  useLazyGetIotControllerListQuery,
  useUpdateIotControllerMutation,
  useTestConnectionIotControllerMutation
} from '@acx-ui/rc/services'
import {
  checkObjectNotExists,
  redirectPreviousPage,
  IotControllerSetting,
  excludeSpaceRegExp,
  domainNameRegExp
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useTenantLink,
  useParams
} from '@acx-ui/react-router-dom'
import { useUserProfileContext } from '@acx-ui/user'
import { validationMessages }    from '@acx-ui/utils'

import * as UI from './styledComponents'

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
  const [ testConnectionIotController, { isLoading: isConnectionTesting }] =
    useTestConnectionIotControllerMutation()
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestConnectionStatusEnum>()
  let currentTestConnectionFun: ReturnType<typeof testConnectionIotController> | undefined

  const linkToIotController = useTenantLink('/devices/iotController')
  const [addIotController] = useAddIotControllerMutation()
  const [updateIotController] = useUpdateIotControllerMutation()

  const [serialNumberEnabled, setSerialNumberEnabled] = useState(true)

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
    const { publicAddress, publicPort, apiToken } = form.getFieldsValue()
    const payload = {
      publicAddress,
      publicPort,
      apiToken
    }
    try{
      currentTestConnectionFun = testConnectionIotController({
        payload: payload
      })
      const result = await currentTestConnectionFun.unwrap()
      if(result.serialNumber){
        form.setFieldsValue({ iotSerialNumber: result.serialNumber })
        setTestConnectionStatus(TestConnectionStatusEnum.PASS)
      }
    }catch (error) {
      setTestConnectionStatus(TestConnectionStatusEnum.FAIL)
    }
  }

  const handleChange = () => {
    setTestConnectionStatus(undefined)
  }

  const [getIotControllerList] = useLazyGetIotControllerListQuery()
  const nameValidator = async (value: string) => {
    if ([...value].length !== JSON.stringify(value).normalize().slice(1, -1).length) {
      return Promise.reject($t(validationMessages.name))
    }
    try {
      const list = (await getIotControllerList({ params: { tenantId } })
        .unwrap()).data?.map(n => ({ name: n.name }))
      return checkObjectNotExists(list, { name: value } , $t({ defaultMessage: 'IoT Controller' }))
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
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
      const formData = { ...values, id: data?.id }
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
        disabled={isCustomRole || isConnectionTesting}
        buttonLabel={{ submit: isEditMode ?
          $t({ defaultMessage: 'Save' }):
          $t({ defaultMessage: 'Add' }) }}
      >
        <StepsForm.StepForm>
          <Loader states={[{
            isLoading: isIotControllerLoading
          }]}>
            <>
              <Row gutter={20}>
                <Col span={8}>
                  <Form.Item
                    name='name'
                    initialValue={data?.name}
                    label={$t({ defaultMessage: 'IoT Controller Name' })}
                    rules={[
                      { type: 'string', required: true },
                      {
                        validator: (_, value) => nameValidator(value)
                      }
                    ]}
                    validateFirst
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
                      children={<Switch
                        onChange={(checked: boolean)=>{
                          if(checked){
                            setSerialNumberEnabled(false)
                          } else {
                            setSerialNumberEnabled(true)
                          }
                        }}/>}
                    />
                  </StepsForm.FieldLabel>
                  <UI.FieldTitle>
                    {
                      // eslint-disable-next-line max-len
                      $t({ defaultMessage: 'If Public IP address is not enabled, no information will be fetched from vRIoT Controller.' })
                    }
                  </UI.FieldTitle>
                </Col>
              </Row>
              {publicEnabled &&
              <>
                <Row gutter={20}>
                  <Col span={8}>
                    <UI.SpaceWrapper>
                      <Form.Item
                        style={{ width: '100%' }}
                        name='publicAddress'
                        initialValue={data?.publicAddress}
                        label={$t({ defaultMessage: 'FQDN / IP' })}
                        rules={[
                          { validator: (_, value) => domainNameRegExp(value) }
                        ]}
                        children={<Input onChange={handleChange} />}
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
                          onChange={handleChange}
                          min={1}
                          max={65535}/>}
                      />
                    </UI.SpaceWrapper>
                  </Col>
                  <Col
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'green'
                    }}
                    span={1}
                  >
                    {// eslint-disable-next-line max-len
                      testConnectionStatus === TestConnectionStatusEnum.PASS && <UI.CheckMarkIcon />}
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={8}>
                    <Form.Item
                      name='apiToken'
                      initialValue={data?.apiToken}
                      label={<>{$t({ defaultMessage: 'API Token' })}
                        <Tooltip.Question
                          title={$t({ defaultMessage:
                            // eslint-disable-next-line max-len
                            'The path for API Token to copy from vRIoT controller is as below vRIoT Admin Page -> Account -> API Token (Copy the Token) If an API token in vRIoT controller is regenerated and the same to be updated here for a successful connection.' })}
                          placement='right'
                          iconStyle={{
                            width: 16,
                            height: 16
                          }}
                        />
                      </>}
                      rules={[
                        { validator: (_, value) => excludeSpaceRegExp(value) }
                      ]}
                      children={<PasswordInput onChange={handleChange} />}
                    />
                  </Col>
                  <Col
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: 'green'
                    }}
                    span={1}
                  >
                    {// eslint-disable-next-line max-len
                      testConnectionStatus === TestConnectionStatusEnum.PASS && <UI.CheckMarkIcon />}
                  </Col>
                </Row>
                <Row gutter={20}>
                  <Col span={8}>
                    <div style={{ textAlign: 'right' }}>
                      <Button
                        htmlType='submit'
                        disabled={isConnectionTesting}
                        loading={isConnectionTesting}
                        onClick={onClickTestConnection}
                      >
                        {$t({ defaultMessage: 'Validate' })}
                      </Button>
                    </div>
                  </Col>
                </Row>
              </>}
              <Row gutter={20}>
                <Col span={8}>
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
                    children={<Input disabled={isEditMode || !serialNumberEnabled} />}
                    validateFirst
                  />
                </Col>
              </Row>
            </>
          </Loader>
        </StepsForm.StepForm>
      </StepsForm>
      }
    </>
  )
}

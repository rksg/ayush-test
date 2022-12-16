import { useContext, useEffect, useRef, useState } from 'react'

import { Col, Form, Input, Row, Select, Switch } from 'antd'
import { cloneDeep }                             from 'lodash'
import { FormChangeInfo }                        from 'rc-field-form/es/FormContext'
import { useIntl }                               from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps, StepsForm, StepsFormInstance } from '@acx-ui/components'
import { EdgePortConfig, EdgePortTypeEnum }                                    from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                          from '@acx-ui/react-router-dom'

import { PortsContext } from '..'
import * as UI          from '../styledComponents'

interface ConfigFormProps {
  index: number
}

const PortConfigForm = (props: ConfigFormProps) => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToEdgeList = useTenantLink('/devices/edge/list')
  const formRef = useRef<StepsFormInstance<EdgePortConfig>>()
  const { ports, setPorts } = useContext(PortsContext)

  const currentConfig = ports[props.index]
  const portTypeOptions = [
    {
      label: $t({ defaultMessage: 'Select port type..' }),
      value: EdgePortTypeEnum.UNSPECIFIED
    },
    {
      label: $t({ defaultMessage: 'WAN' }),
      value: EdgePortTypeEnum.WAN
    },
    {
      label: $t({ defaultMessage: 'LAN' }),
      value: EdgePortTypeEnum.LAN
    }
  ]

  useEffect(() => {
    formRef.current?.setFieldsValue({
      ...currentConfig
    })
  }, [currentConfig])

  const updateContext = (name: string, formInfo: FormChangeInfo) => {
    const newData = cloneDeep(ports)
    const changeField = formInfo.changedFields[0]
    if(changeField) {
      newData[props.index] = {
        ...ports[props.index],
        [changeField.name as keyof EdgePortConfig]: changeField.value
      }
      setPorts(newData)
    }
  }

  const handlePortsGeneral = async () => {
    console.log(ports)
  }

  return (
    <>
      <UI.IpAndMac>
        {

          $t(
            { defaultMessage: 'IP Address: {ip}   |   MAC Address: {mac}' },
            { ip: '', mac: currentConfig?.mac }
          )
        }
      </UI.IpAndMac>
      <StepsForm
        formRef={formRef}
        onFormChange={updateContext}
        onFinish={handlePortsGeneral}
        onCancel={() => navigate(linkToEdgeList)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply Ports General' }) }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={5}>
              <Form.Item
                name='name'
                label={$t({ defaultMessage: 'Port Name' })}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name='portType'
                label={$t({ defaultMessage: 'Port Type' })}
                initialValue={EdgePortTypeEnum.UNSPECIFIED}
                children={
                  <Select
                    options={portTypeOptions}
                  />
                }
              />
              {currentConfig.portType !== EdgePortTypeEnum.UNSPECIFIED ?
                <>
                  <StepsForm.FieldLabel width='120px'>
                    {$t({ defaultMessage: 'Port Enabled' })}
                    <Form.Item
                      name='enabled'
                      valuePropName='checked'
                      children={<Switch />}
                    />
                  </StepsForm.FieldLabel>
                  {currentConfig.enabled ?
                    <>
                      <StepsForm.Title>{$t({ defaultMessage: 'IP Settings' })}</StepsForm.Title>
                      {currentConfig.portType === EdgePortTypeEnum.LAN ?
                        <>
                          <Form.Item
                            name='ip'
                            label={$t({ defaultMessage: 'IP Address' })}
                            rules={[{
                              required: true
                            }]}
                          >
                            <Input />
                          </Form.Item>
                          <Form.Item
                            name='subnet'
                            label={$t({ defaultMessage: 'Subnet Mask' })}
                            rules={[{
                              required: true
                            }]}
                          >
                            <Input />
                          </Form.Item>
                        </>
                        : null}
                    </>
                    : null}
                </>
                : null}
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

const PortsGeneral = () => {

  const { $t } = useIntl()
  const { ports } = useContext(PortsContext)
  const [tabDetails, setTabDetails] = useState<ContentSwitcherProps['tabDetails']>([])

  useEffect(() => {
    if(ports) {
      setTabDetails(ports.map((data, index) => {
        return {
          label: $t({ defaultMessage: 'Port {index}' }, { index: index + 1 }),
          value: 'port_' + (index + 1),
          children: <PortConfigForm index={index} />
        }
      }))
    }
  }, [ports, $t])

  return (
    <ContentSwitcher
      tabDetails={tabDetails}
      defaultValue={'port_1'}
      size='large'
      align='left'
    />
  )
}

export default PortsGeneral
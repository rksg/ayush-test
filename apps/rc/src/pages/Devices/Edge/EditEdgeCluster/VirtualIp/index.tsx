import { useState } from 'react'

import { Col, Form, Input, Row, Slider } from 'antd'
import { useIntl }                       from 'react-intl'
import { useNavigate }                   from 'react-router-dom'

import { Button, Fieldset, StepsForm } from '@acx-ui/components'
import { DeleteOutlinedIcon }          from '@acx-ui/icons'
import { EdgeClusterTableDataType }    from '@acx-ui/rc/utils'
import { useTenantLink }               from '@acx-ui/react-router-dom'

import { SelectInterfaceDrawer } from './SelectInterfaceDrawer'
import * as UI                   from './styledComponents'

interface VirtualIpProps {
  currentCluster?: EdgeClusterTableDataType
}

export const VirtualIp = (props: VirtualIpProps) => {
  const { currentCluster } = props
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const [selectInterfaceDrawerVisible, setSelectInterfaceDrawerVisible] = useState(false)
  const [currentIndex, setCurrentIndex] = useState<number>()

  const maxVipCount = 2

  const openDrawer = (index: number) => {
    setCurrentIndex(index)
    setSelectInterfaceDrawerVisible(true)
  }

  const handleFinish = async (values: unknown) => {
    console.log(form.getFieldsValue(true))
    console.log(values)
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  const handleSelectPort = (data: unknown, index?: number) => {
    if(index === undefined) return
    const vipConfigs = form.getFieldValue('vipConfig')
    vipConfigs[index] = data
    form.setFieldValue('vipConfig', vipConfigs)
  }

  return (
    <>
      <Row>
        <Col span={10}>
          <UI.Mt15>
            {
              // eslint-disable-next-line max-len
              $t({ defaultMessage: 'Please select the node interfaces and assign virtual IPs for seamless failover :' })
            }
          </UI.Mt15>
          <StepsForm
            form={form}
            onFinish={handleFinish}
            onCancel={handleCancel}
            buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
          >
            <StepsForm.StepForm>
              <UI.Mt15>
                <Row gutter={[16, 30]}>
                  <Col span={24}>
                    <Form.List
                      name='vipConfig'
                      initialValue={[{}]}
                    >
                      {
                        (fields, { add, remove }) => (
                          <Row gutter={[16, 20]}>
                            {
                              fields.map((field, index) =>
                                <Col span={24}>
                                  <Fieldset
                                    key={field.key}
                                    label={
                                      $t({ defaultMessage: '#{index} Virtual IP' },
                                        { index: index + 1 })
                                    }
                                    switchStyle={{ display: 'none' }}
                                    checked={true}
                                    style={index !== 0 ? { paddingTop: 0 } : {}}
                                  >
                                    <Row>
                                      {
                                        index > 0 &&
                                        <Col span={24} style={{ textAlign: 'end' }}>
                                          <Button
                                            type='link'
                                            size='large'
                                            icon={<DeleteOutlinedIcon />}
                                            onClick={() => remove(field.name)}
                                          />
                                        </Col>
                                      }
                                      <Col span={24}>
                                        <Form.Item
                                          name={[index, 'interfaces']}
                                          rules={[
                                            {
                                              required: true,
                                              // eslint-disable-next-line max-len
                                              message: $t({ defaultMessage: 'Please select interfaces' })
                                            }
                                          ]}
                                          label={$t({ defaultMessage: 'Interfaces ' })}
                                        >
                                          <Button
                                            type='link'
                                            onClick={() => openDrawer(index + 1)}
                                            children={
                                              $t({ defaultMessage: 'Select interface' })
                                            }
                                          />
                                        </Form.Item>
                                      </Col>
                                      <Col span={10}>
                                        <Form.Item
                                          name={[index, 'vip']}
                                          label={$t({ defaultMessage: 'Virtual IP Address' })}
                                          rules={[
                                            { required: true }
                                          ]}
                                          children={<Input />}
                                        />
                                      </Col>
                                    </Row>
                                  </Fieldset>
                                </Col>
                              )
                            }
                            <Col span={24}>
                              {
                                fields.length < maxVipCount &&
                                <Button
                                  type='link'
                                  onClick={() => add()}
                                  children={$t({ defaultMessage: 'Add another virtual IP' })}
                                />
                              }
                            </Col>
                          </Row>
                        )
                      }
                    </Form.List>
                  </Col>
                  <Col span={24}>
                    <StepsForm.Title>{$t({ defaultMessage: 'Failover Settings' })}</StepsForm.Title>
                    <Form.Item
                      label={$t({ defaultMessage: 'HA Timeout' })}
                      name='timeout'
                      initialValue={3}
                    >
                      <Slider
                        tooltipVisible={false}
                        style={{ width: '240px' }}
                        min={3}
                        max={15}
                        marks={{
                          3: $t({ defaultMessage: '3 seconds' }),
                          15: $t({ defaultMessage: '15 seconds' })
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </UI.Mt15>
            </StepsForm.StepForm>
          </StepsForm>
        </Col>
      </Row>
      <SelectInterfaceDrawer
        visible={selectInterfaceDrawerVisible}
        setVisible={setSelectInterfaceDrawerVisible}
        handleFinish={handleSelectPort}
        currentVipIndex={currentIndex}
        currentCluster={currentCluster}
      />
    </>
  )
}
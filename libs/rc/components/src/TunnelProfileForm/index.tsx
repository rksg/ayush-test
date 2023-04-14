import { Col, Form, Input, InputNumber, Radio, Row, Space, Switch } from 'antd'
import { useIntl }                                                  from 'react-intl'

import { StepsForm }   from '@acx-ui/components'
import { MtuTypeEnum } from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

const { useWatch } = Form

export const TunnelProfileForm = () => {

  const mtuType = useWatch('mtuType')

  const { $t } = useIntl()
  return (
    <Row>
      <Col span={14}>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Policy Name' })}
          rules={[
            { required: true }
          ]}
          children={<Input />}
        />
      </Col>
      {/* <Col span={14}>
        <Form.Item
          name='tag'
          label={$t({ defaultMessage: 'Tags' })}
          children={<Select mode='tags' />}
        />
      </Col> */}
      <Col span={24}>
        <Form.Item
          name='mtuType'
          label={$t({ defaultMessage: 'Gateway Path MTU Mode' })}
          extra={
            <Space size={1}>
              <UI.InfoIcon/>
              {
                // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Please check Ethernet MTU on AP, Tunnel MTU gets applied only if its less than Ethernet MTU' })
              }
            </Space>
          }
          children={
            <Radio.Group>
              <Space direction='vertical' size={40}>
                <Radio value={MtuTypeEnum.AUTO}>
                  {$t({ defaultMessage: 'Auto' })}
                </Radio>
                <Radio value={MtuTypeEnum.MANUAL}>
                  <Space>
                    <div>
                      {$t({ defaultMessage: 'Manual' })}
                    </div>
                    {
                      mtuType === MtuTypeEnum.MANUAL &&
                      <Space>
                        <Form.Item
                          name='mtuSize'
                          rules={[
                            {
                              required: mtuType === MtuTypeEnum.MANUAL,
                              message: 'Please enter MTU size'
                            }
                          ]}
                          children={<InputNumber />}
                          noStyle
                        />
                        <div>bytes</div>
                      </Space>
                    }
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          }
        />
      </Col>
      <Col span={24}>
        <StepsForm.FieldLabel width='140px'>
          {$t({ defaultMessage: 'Force Fragmentation' })}
          <Form.Item
            name='forceFragmentation'
            valuePropName='checked'
            children={<Switch />}
          />
        </StepsForm.FieldLabel>
      </Col>
    </Row>
  )
}
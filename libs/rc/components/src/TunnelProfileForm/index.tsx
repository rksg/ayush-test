import { Col, Form, Input, InputNumber, Radio, Row, Select, Space, Switch } from 'antd'
import { useIntl }                                                          from 'react-intl'

import { StepsFormLegacy }            from '@acx-ui/components'
import { MtuTypeEnum, TunnelProfile } from '@acx-ui/rc/utils'
import { getIntl }                    from '@acx-ui/utils'

import * as UI from './styledComponents'

const { useWatch } = Form

export const sessionMapping: { [key: string]: number } = {
  week: 1,
  days: 7,
  minutes: 10080
}

async function validateAgeTimeValue (value: number, ageTimeUnit: string) {
  const { $t } = getIntl()
  if (value < (ageTimeUnit === 'minutes' ? 5 : 1) || value > sessionMapping[ageTimeUnit]) {
    return Promise.reject($t({
      defaultMessage: 'Value must between 5-10080 minutes or 1-7 days or 1 week'
    }))
  }
  return Promise.resolve()
}

export interface TunnelProfileFormType extends TunnelProfile {
  ageTimeUnit? : string
}

export const TunnelProfileForm = (props: { isDefaultTunnelProfile?: boolean }) => {
  const isDefaultTunnelProfile = !!props.isDefaultTunnelProfile
  const ageTimeUnit = useWatch<string>('ageTimeUnit')
  const mtuType = useWatch('mtuType')
  const { $t } = useIntl()
  const ageTimeOptions = [
    { label: $t({ defaultMessage: 'Minute(s)' }), value: 'minutes' },
    { label: $t({ defaultMessage: 'Day(s)' }), value: 'days' },
    { label: $t({ defaultMessage: 'Week' }), value: 'week' }
  ]

  return (
    <Row>
      <Col span={14}>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Policy Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 }
          ]}
          children={<Input disabled={isDefaultTunnelProfile}/>}
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
              <UI.InfoIcon />
              {
                // eslint-disable-next-line max-len
                $t({ defaultMessage: 'Please check Ethernet MTU on AP, Tunnel MTU gets applied only if its less than Ethernet MTU' })
              }
            </Space>
          }
          children={
            <Radio.Group disabled={isDefaultTunnelProfile}>
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
        <StepsFormLegacy.FieldLabel width='140px'>
          {$t({ defaultMessage: 'Force Fragmentation' })}
          <Form.Item
            name='forceFragmentation'
            valuePropName='checked'
            children={<Switch disabled={isDefaultTunnelProfile}/>}
          />
        </StepsFormLegacy.FieldLabel>
      </Col>
      <Col span={5}>
        <Form.Item
          name='ageTimeMinutes'
          label={$t({ defaultMessage: 'Idle Period' })}
          initialValue={20}
          rules={[
            { required: true },
            { validator: (_, value) => validateAgeTimeValue(value, ageTimeUnit) }
          ]}
          validateFirst
          children={<InputNumber disabled={isDefaultTunnelProfile}/>}
        />
      </Col>
      <Col span={5}>
        <Form.Item
          name='ageTimeUnit'
          label={<div></div>}
          initialValue={'minutes'}
        >
          <Select options={ageTimeOptions} disabled={isDefaultTunnelProfile}/>
        </Form.Item>
      </Col>
    </Row>
  )
}

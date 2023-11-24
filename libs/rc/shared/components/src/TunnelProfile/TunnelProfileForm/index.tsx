import {
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Space,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsFormLegacy }  from '@acx-ui/components'
import { Features }         from '@acx-ui/feature-toggle'
import {
  AgeTimeUnit,
  MtuTypeEnum,
  getTunnelTypeOptions,
  servicePolicyNameRegExp
} from '@acx-ui/rc/utils'
import { getIntl } from '@acx-ui/utils'

import { useIsEdgeFeatureReady } from '../../useEdgeActions'

import { MessageMapping } from './MessageMapping'
import * as UI            from './styledComponents'

const { useWatch } = Form

export const sessionMapping: { [key: string]: number } = {
  week: 1,
  days: 7,
  minutes: 10080
}

async function validateAgeTimeValue (value: number, ageTimeUnit: string) {
  const { $t } = getIntl()
  if (value < (ageTimeUnit === AgeTimeUnit.MINUTES ? 5 : 1) ||
        value > sessionMapping[ageTimeUnit]) {
    return Promise.reject($t({
      defaultMessage: 'Value must between 5-10080 minutes or 1-7 days or 1 week'
    }))
  }
  return Promise.resolve()
}

interface TunnelProfileFormProps {
  isDefaultTunnelProfile?: boolean
}

export const TunnelProfileForm = (props: TunnelProfileFormProps) => {
  const { isDefaultTunnelProfile = false } = props
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const ageTimeUnit = useWatch<AgeTimeUnit>('ageTimeUnit')
  const mtuType = useWatch('mtuType')
  const disabledFields = form.getFieldValue('disabledFields')
  const tunnelTypeOptions = getTunnelTypeOptions($t)

  const ageTimeOptions = [
    { label: $t({ defaultMessage: 'Minute(s)' }), value: AgeTimeUnit.MINUTES },
    { label: $t({ defaultMessage: 'Day(s)' }), value: AgeTimeUnit.DAYS },
    { label: $t({ defaultMessage: 'Week' }), value: AgeTimeUnit.WEEK }
  ]

  const handelAgeTimeUnitChange = () => {
    form.validateFields(['ageTimeMinutes'])
  }

  return (
    <Row>
      <Col span={14}>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Profile Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => servicePolicyNameRegExp(value) }
          ]}
          children={<Input
            disabled={isDefaultTunnelProfile || !!disabledFields?.includes('name')}/>}
          validateFirst
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
            <Space size={1} style={{ alignItems: 'start', marginTop: 5 }}>
              <UI.InfoIcon />
              { $t(MessageMapping.mtu_help_msg) }
            </Space>
          }
          children={
            <Radio.Group disabled={isDefaultTunnelProfile || !!disabledFields?.includes('mtuType')}>
              <Space direction='vertical'>
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
                            },
                            {
                              type: 'number',
                              min: 68,
                              max: 1450
                            }
                          ]}
                          children={<InputNumber
                            disabled={!!disabledFields?.includes('mtuSize')}/>}
                          validateFirst
                          noStyle
                        />
                        <div>{$t({ defaultMessage: 'bytes' })}</div>
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
            children={<Switch
              // eslint-disable-next-line max-len
              disabled={isDefaultTunnelProfile || !!disabledFields?.includes('forceFragmentation')}/>}
          />
        </StepsFormLegacy.FieldLabel>
      </Col>
      <Col span={24}>
        <Form.Item
          label={$t({ defaultMessage: 'Idle Period' })}
        >
          <Space>
            <Form.Item
              name='ageTimeMinutes'
              rules={[
                { required: true },
                { validator: (_, value) => validateAgeTimeValue(value, ageTimeUnit) }
              ]}
              children={<InputNumber
                disabled={isDefaultTunnelProfile || !!disabledFields?.includes('ageTimeMinutes')}/>}
              validateFirst
              noStyle
              hasFeedback
            />
            <Form.Item
              name='ageTimeUnit'
              children={
                <Select
                  options={ageTimeOptions}
                  disabled={isDefaultTunnelProfile || !!disabledFields?.includes('ageTimeUnit')}
                  onChange={handelAgeTimeUnitChange}
                />
              }
              noStyle
            />
          </Space>
        </Form.Item>
      </Col>
      { isEdgeSdLanReady &&
        <Col span={14}>
          <Form.Item
            name='type'
            label={$t({ defaultMessage: 'Tunnel Type' })}
            tooltip={$t(MessageMapping.tunnel_type_help_msg)}
          >
            <Select
              disabled={isDefaultTunnelProfile || !!disabledFields?.includes('type')}
              options={tunnelTypeOptions}
            />
          </Form.Item>
        </Col>
      }
    </Row>
  )
}

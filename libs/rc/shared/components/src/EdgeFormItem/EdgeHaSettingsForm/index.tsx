import { Col, Form, InputNumber, Radio, Row, Space, Switch, TimePicker } from 'antd'
import { Moment }                                                        from 'moment-timezone'
import { defineMessage, useIntl }                                        from 'react-intl'

import { Select, StepsForm, Tooltip, useStepFormContext }                                           from '@acx-ui/components'
import { ClusterHaFallbackScheduleTypeEnum, ClusterHaLoadDistributionEnum, ClusterNetworkSettings } from '@acx-ui/rc/utils'

export type EdgeHaSettingsType =
  Exclude<ClusterNetworkSettings['highAvailabilitySettings'], undefined>

export type FallbackSettingsType = EdgeHaSettingsType['fallbackSettings']

export interface FallbackSettingsFormType extends Omit<FallbackSettingsType, 'schedule'> {
  schedule: Omit<FallbackSettingsType['schedule'], 'time'> & { time?: Moment }
}

export interface EdgeHaSettingsFormType {
  fallbackSettings: FallbackSettingsFormType
  loadDistribution: ClusterHaLoadDistributionEnum
}

export const dayOfWeek = {
  SUN: defineMessage({ defaultMessage: 'Sunday' }),
  MON: defineMessage({ defaultMessage: 'Monday' }),
  TUE: defineMessage({ defaultMessage: 'Tuesday' }),
  WED: defineMessage({ defaultMessage: 'Wednesday' }),
  THU: defineMessage({ defaultMessage: 'Thursday' }),
  FRI: defineMessage({ defaultMessage: 'Friday' }),
  SAT: defineMessage({ defaultMessage: 'Saturday' })
}

export const loadDistributions = {
  [ClusterHaLoadDistributionEnum.RANDOM]: defineMessage({ defaultMessage: 'Random distribution' }),
  // eslint-disable-next-line max-len
  [ClusterHaLoadDistributionEnum.AP_GROUP]: defineMessage({ defaultMessage: 'Per AP group distribution' })
}

export const EdgeHaSettingsForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const isFallbackEnable = Form.useWatch(['fallbackSettings', 'enable'], form)
  const fallbackScheduleType = Form.useWatch(['fallbackSettings', 'schedule', 'type'], form)
  const intervalHours = Form.useWatch(['fallbackSettings', 'schedule', 'intervalHours'], form)

  const fallbackEnableTooltipMsg = $t({
    defaultMessage: `The first RUCKUS Edge in the list is assigned as
    the preferred RUCKUS Edge. When this option is enabled,
    clients (APs or clusters) attempt to connect to it according
    to the fallback schedule.`
  })

  const loadDistributionTooltipMsg = $t({
    defaultMessage: `Recommend to select the “Per AP group distribution”
    option when you have created AP groups and distributed
    the APs across those groups.`
  })

  const dayOfWeekOptions = Object.entries(dayOfWeek).map(item => ({
    label: $t(item[1]),
    value: item[0]
  }))

  const loadDistributionOptions = Object.entries(loadDistributions).map(item => ({
    label: $t(item[1]),
    value: item[0]
  }))

  const content = <Row>
    <Col span={14}>
      {
        <div style={{ marginBottom: '30px' }}>
          <Row>
            <Col>
              <StepsForm.FieldLabel width='150px'>
                <Space size={3}>
                  <div>
                    {$t({ defaultMessage: 'RUCKUS Edge Fallback' })}
                  </div>
                  <Tooltip.Question
                    iconStyle={{ width: 16, height: 16, marginTop: '3px' }}
                    title={fallbackEnableTooltipMsg}
                    placement='bottom'
                  />
                </Space>
                <Form.Item
                  name={['fallbackSettings', 'enable']}
                  valuePropName='checked'
                  children={<Switch style={{ margin: 'auto' }}/>}
                  noStyle
                />
              </StepsForm.FieldLabel>
            </Col>
          </Row>
          {
            isFallbackEnable &&
            <Row style={{ marginTop: '20px' }}>
              <Col>
                <Form.Item
                  name={['fallbackSettings', 'schedule', 'type']}
                  // eslint-disable-next-line max-len
                  label={$t({ defaultMessage: 'Fallback Schedule (based on local time zone of RUCKUS Edge)' })}
                  rules={[{
                    required: true,
                    message: $t({ defaultMessage: 'Please select a Fallback Schedule' })
                  }]}
                  help={
                    (fallbackScheduleType === ClusterHaFallbackScheduleTypeEnum.INTERVAL &&
                    (intervalHours < 1 || intervalHours > 24)) ? null : ''
                  }
                >
                  <Radio.Group>
                    <Space direction='vertical' size={20}>
                      <Radio value={ClusterHaFallbackScheduleTypeEnum.DAILY}>
                        <div style={{ display: 'inline-block', width: '100px' }}>
                          {$t({ defaultMessage: 'Daily' })}
                        </div>
                        {
                          fallbackScheduleType === ClusterHaFallbackScheduleTypeEnum.DAILY &&
                          <div style={{ display: 'inline-block' }}>
                            <Space>
                              {$t({ defaultMessage: 'Everyday at' })}
                              <Form.Item
                                name={['fallbackSettings', 'schedule', 'time']}
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: ''
                                  }
                                ]}
                                children={
                                  <TimePicker
                                    format='HH:mm'
                                    onClick={(e) => e.preventDefault()}
                                    showNow={false}
                                  />
                                }
                              />
                            </Space>
                          </div>
                        }
                      </Radio>
                      <Radio value={ClusterHaFallbackScheduleTypeEnum.WEEKLY}>
                        <div style={{ display: 'inline-block', width: '100px' }}>
                          {$t({ defaultMessage: 'Weekly' })}
                        </div>
                        {
                          fallbackScheduleType === ClusterHaFallbackScheduleTypeEnum.WEEKLY &&
                          <div style={{ display: 'inline-block' }}>
                            <Space>
                              {$t({ defaultMessage: 'Every' })}
                              <Form.Item
                                name={['fallbackSettings', 'schedule', 'weekday']}
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: ''
                                  }
                                ]}
                                children={
                                  <Select
                                    placeholder={$t({ defaultMessage: 'Select day...' })}
                                    onClick={(e) => e.preventDefault()}
                                    options={dayOfWeekOptions}
                                  />
                                }
                              />
                              {$t({ defaultMessage: 'at' })}
                              <Form.Item
                                name={['fallbackSettings', 'schedule', 'time']}
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: ''
                                  }
                                ]}
                                children={
                                  <TimePicker
                                    format='HH:mm'
                                    onClick={(e) => e.preventDefault()}
                                    showNow={false}
                                  />
                                }
                              />
                            </Space>
                          </div>
                        }
                      </Radio>
                      <Radio value={ClusterHaFallbackScheduleTypeEnum.INTERVAL}>
                        <div style={{ display: 'inline-block', width: '100px' }}>
                          {$t({ defaultMessage: 'By Interval' })}
                        </div>
                        {
                          fallbackScheduleType === ClusterHaFallbackScheduleTypeEnum.INTERVAL &&
                          <div style={{ display: 'inline-block' }}>
                            <Space>
                              {$t({ defaultMessage: 'Every' })}
                              <Form.Item
                                name={['fallbackSettings', 'schedule', 'intervalHours']}
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: ''
                                  },
                                  {
                                    type: 'number',
                                    min: 1,
                                    max: 24
                                  }
                                ]}
                                children={
                                  <InputNumber
                                    style={{ width: '60px' }}
                                    min={1}
                                    max={24}
                                  />
                                }
                              />
                              {$t({ defaultMessage: 'hours' })}
                            </Space>
                          </div>
                        }
                      </Radio>
                    </Space>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          }
        </div>
      }
      <Row>
        <Col span={9}>
          <Form.Item
            name='loadDistribution'
            label={
              <>
                {$t({ defaultMessage: 'Load Distribution' })}
                <Tooltip.Question
                  title={loadDistributionTooltipMsg}
                  placement='bottom'
                />
              </>
            }
            rules={[{
              required: true,
              message: $t({ defaultMessage: 'Please select a Load Distribution' })
            }]}
            children={
              <Select
                options={loadDistributionOptions}
              />
            }
          />
        </Col>
      </Row>
    </Col>
  </Row>

  return content
}
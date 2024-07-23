import { Col, Form, InputNumber, Radio, Row, Space, Switch, TimePicker } from 'antd'
import { useIntl }                                                       from 'react-intl'

import { Select, StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'
import { ClusterHaFallbackScheduleTypeEnum }              from '@acx-ui/rc/utils'

import { dayOfWeek, loadDistributions } from './utils'

export const HaSettingForm = () => {
  const { $t } = useIntl()
  const { form } = useStepFormContext()
  const isFallbackEnable = Form.useWatch(['fallbackSettings', 'enable'], form)
  const fallbackScheduleType = Form.useWatch(['fallbackSettings', 'schedule', 'type'], form)
  const intervalHours = Form.useWatch(['fallbackSettings', 'schedule', 'intervalHours'], form)

  const fallbackEnableTooltipMsg = $t({
    defaultMessage: `The first SmartEdge in the list is assigned as
    the preferred SmartEdge. When this option is enabled,
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
      <Row>
        <Col>
          <StepsForm.FieldLabel width='150px'>
            <Space size={3}>
              <div>
                {$t({ defaultMessage: 'SmartEdge Fallback' })}
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
              label={$t({ defaultMessage: 'Fallback Schedule (based on local time zone of SmartEdge)' })}
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
                            children={<InputNumber style={{ width: '60px' }} />}
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
      <Row style={{ marginTop: '30px' }}>
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
import { Alert, Checkbox, Col, Form, Input, InputNumber, Row, Space, Table, TableProps } from 'antd'
import { useIntl }                                                                       from 'react-intl'

import { useStepFormContext }                                                                                      from '@acx-ui/components'
import { SpaceWrapper }                                                                                            from '@acx-ui/rc/components'
import { EdgeQosViewData, TrafficClassSetting, priorityToDisplay, servicePolicyNameRegExp, trafficClassToDisplay } from '@acx-ui/rc/utils'


export const SettingsForm = () => {
  const { $t } = useIntl()

  const { initialValues } = useStepFormContext<EdgeQosViewData>()

  const columns: TableProps<TrafficClassSetting>['columns'] = [
    {
      title: $t({ defaultMessage: 'Traffic Class' }),
      key: 'trafficClass',
      dataIndex: 'trafficClass',
      render: function (_, row) {
        return trafficClassToDisplay(row.trafficClass)
      }
    },
    {
      title: $t({ defaultMessage: 'Priority' }),
      key: 'priority',
      dataIndex: 'priority',
      render: function (_, row) {
        return priorityToDisplay(row.priority)
      }
    },
    {
      title: $t({ defaultMessage: 'Priority Scheduling' }),
      render: function (_, row, index) {
        return <Space>
          <Form.Item
            name={['trafficClassSettings', index, 'priorityScheduling']}
            valuePropName='checked'
            noStyle>
            <Checkbox />
          </Form.Item>
        </Space>
      }
    },
    {
      title: $t({ defaultMessage: 'Guaranteed Bandwidth' }),
      render: function (_, row, index) {
        return<Form.Item><Space>
          <Form.Item
            name={['trafficClassSettings', index, 'minBandwidth']}
            noStyle
            rules={[
              { min: 1, max: 100, type: 'number' }
            // TODO:  { validator: (_, value) => validate(value) }
            ]}
            children={<InputNumber style={{ width: '60px' }}/>}
          />
          %
        </Space></Form.Item>
      }
    },
    {
      title: $t({ defaultMessage: 'Max Bandwidth' }),
      render: function (_, row, index) {
        return <Form.Item><Space>
          <Form.Item
            name={['trafficClassSettings', index, 'maxBandwidth']}
            noStyle
            rules={[
              { min: 1, max: 100, type: 'number' }
              // TODO:  { validator: (_, value) => validate(value) }
            ]}
            children={<InputNumber style={{ width: '60px' }} />}
          />
          %
        </Space></Form.Item>
      }
    }
  ]

  return (
    <Row>
      <Col span={14}>
        <SpaceWrapper full direction='vertical' size={50}>
          <Row>
            <Col span={24}>
              <Row>
                <Col span={13}>
                  <Form.Item
                    name='name'
                    label={$t({ defaultMessage: 'Profile Name' })}
                    rules={[
                      { required: true },
                      { min: 2, max: 32 },
                      { validator: (_, value) => servicePolicyNameRegExp(value) }
                    ]}
                    children={<Input />}
                  />
                  <Form.Item
                    name='description'
                    label={$t({ defaultMessage: 'Description' })}
                    rules={[{ max: 255 }]}
                    children={<Input />}
                  />
                </Col>
                <Form.Item
                  name='trafficClassSettings'
                  label={<>
                    {$t({ defaultMessage:
                        'Configure the QoS bandwidth settings for each traffic class' })}
                  </>}
                  rules={
                    [{ required: true }
                      // TODO:  { validator: (_, value) => validate(value) }
                    ]
                  }
                >
                  <Form.Item noStyle>
                    <Alert type='info'
                      message={
                      // eslint-disable-next-line max-len
                        $t({ defaultMessage: `Note: Total guaranteed bandwidth across all classes must NOT exceed 100%.
                        Max bandwidth must exceed minimal guaranteed bandwidth in each class.` })
                      }
                    />
                  </Form.Item>
                  <Table
                    rowKey={(row: TrafficClassSetting) => `${row.trafficClass}-${row.priority}`}
                    columns={columns}
                    dataSource={initialValues?.trafficClassSettings}
                    pagination={false}
                  />
                </Form.Item>
              </Row>
            </Col>
          </Row>
        </SpaceWrapper>
      </Col>
    </Row>

  )
}

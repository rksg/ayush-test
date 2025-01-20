
import { Alert, Checkbox, Col, Form, Input, InputNumber, Row, Space, Tooltip, Typography } from 'antd'
import { useIntl }                                                                         from 'react-intl'

import { Table, TableProps, cssStr, useStepFormContext }                                                            from '@acx-ui/components'
import { SpaceWrapper }                                                                                             from '@acx-ui/rc/components'
import { EdgeHqosViewData, TrafficClassSetting, priorityToDisplay, servicePolicyNameRegExp, trafficClassToDisplay } from '@acx-ui/rc/utils'
import { validationMessages }                                                                                       from '@acx-ui/utils'

import * as UI from '../../styledComponents'

const checkMinAndMaxBandwidthCompare = (minBandwidth?: number, maxBandwidth?: number) => {
  if(!minBandwidth || !maxBandwidth) {
    return true
  }
  if(minBandwidth > maxBandwidth) {
    return false
  }
  return true
}

const MinBandwidthRemaining = (props: {
  trafficClassSettings: TrafficClassSetting[]
}) => {
  const { $t } = useIntl()
  const { trafficClassSettings } = props
  const minBandwidthSum = sumMinBandWidth(trafficClassSettings)
  const remaining = 100 - minBandwidthSum
  return <Typography style={{ color: cssStr('--acx-neutrals-50') }}>
    {$t({ defaultMessage: 'Remaining:{value}%' }, { value: remaining })}
  </Typography>
}

const sumMinBandWidth = (trafficClassSettings?: TrafficClassSetting[]) => {
  const minBandwidthArray = trafficClassSettings?.map((item) => item?.minBandwidth)
  return minBandwidthArray?.reduce((a, b) => (a??0) + (b??0)) ?? 0 as number
}

export const SettingsForm = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { initialValues } = useStepFormContext<EdgeHqosViewData>()
  const isDefaultProfile = initialValues?.isDefault??false
  const formTrafficClassSettings = Form.useWatch('trafficClassSettings', form)

  const prioritySchedulingRangeErrMsg =
  // eslint-disable-next-line max-len
  $t({ defaultMessage: 'Guaranteed Bandwidth value must be 1% or higher if this traffic class is set to priority scheduling' })
  const guaranteedBandwidthSumErrMsg =
  $t({ defaultMessage: 'Total guaranteed bandwidth across all classes must NOT exceed 100%' })
  const bandwidthRangeCompareErrMsg =
  $t({ defaultMessage: 'Max bandwidth cannot be less than guaranteed bandwidth.' })

  const validateMinBandwidth = (index:number, minBandwidth?: number) => {
    if(minBandwidth === undefined || minBandwidth === null) {
      return Promise.resolve()
    }

    if(
      form.getFieldValue(['trafficClassSettings', index, 'priorityScheduling']) &&
      minBandwidth < 1
    ) {
      return Promise.reject(prioritySchedulingRangeErrMsg)
    }
    const trafficClassSettings = form.getFieldValue('trafficClassSettings')
    const trafficClassArray = Object.values(trafficClassSettings) as TrafficClassSetting[]

    const minBandwidthSum = sumMinBandWidth(trafficClassSettings)
    if(minBandwidthSum > 100) {
      return Promise.reject(guaranteedBandwidthSumErrMsg)
    }

    if(trafficClassArray!==undefined) {
      const maxBandwidth = trafficClassArray[index].maxBandwidth
      if(!checkMinAndMaxBandwidthCompare(minBandwidth, maxBandwidth)){
        return Promise.reject(bandwidthRangeCompareErrMsg)
      }
    }
    return Promise.resolve()
  }

  const validateMaxBandwidth = (index:number, maxBandwidth?: number) => {
    if(maxBandwidth === undefined || maxBandwidth === null) {
      return Promise.resolve()
    }

    const trafficClassSettings = form.getFieldValue('trafficClassSettings')
    const trafficClassArray = Object.values(trafficClassSettings) as TrafficClassSetting[]
    if(trafficClassArray!== undefined) {
      const minBandwidth = trafficClassArray[index].minBandwidth
      if(!checkMinAndMaxBandwidthCompare(minBandwidth, maxBandwidth)){
        return Promise.reject(bandwidthRangeCompareErrMsg)
      }

    }
    return Promise.resolve()
  }

  const columns: TableProps<TrafficClassSetting>['columns'] = [
    {
      title: $t({ defaultMessage: 'Traffic Class' }),
      key: 'trafficClass',
      dataIndex: 'trafficClass',
      width: 80,
      render: function (_, row) {
        return trafficClassToDisplay(row.trafficClass)
      }
    },
    {
      title: $t({ defaultMessage: 'Priority' }),
      key: 'priority',
      dataIndex: 'priority',
      width: 60,
      render: function (_, row) {
        return priorityToDisplay(row.priority)
      }
    },
    {
      title: $t({ defaultMessage: 'Priority Scheduling' }),
      align: 'center',
      key: 'priorityScheduling',
      dataIndex: 'priorityScheduling',
      render: function (_, row, index) {
        return <Space>
          <Form.Item
            name={['trafficClassSettings', index, 'priorityScheduling']}
            valuePropName='checked'
            noStyle>
            <Checkbox disabled={isDefaultProfile}/>
          </Form.Item>
        </Space>
      }
    },
    {
      title: <>{$t({ defaultMessage: 'Guaranteed Bandwidth' })}
        <MinBandwidthRemaining
          trafficClassSettings={formTrafficClassSettings}
        />
      </>,
      align: 'center',
      key: 'minBandwidth',
      dataIndex: 'minBandwidth',
      render: function (_, row, index) {
        return <UI.BandwidthStyleFormItem>
          <Space>
            <Form.Item
              name={['trafficClassSettings', index, 'minBandwidth']}
              noStyle
              rules={[
                // eslint-disable-next-line max-len
                { required: true, message: $t({ defaultMessage: 'Please enter Guaranteed Bandwidth' }) },
                {
                  type: 'integer', transform: Number, min: 0, max: 100,
                  message: $t(validationMessages.numberRangeInvalid, { from: 0, to: 100 })
                },
                { validator: (_, value) => validateMinBandwidth(index, value) }
              ]}
              children={<InputNumber style={{ width: '70px' }}
                disabled={isDefaultProfile} />}
              validateFirst
            />
            <span> % </span>
            <Form.Item noStyle
              dependencies={['trafficClassSettings', index, 'minBandwidth']}
            >
              {({ getFieldError }) => {
                const errors = getFieldError(['trafficClassSettings', index, 'minBandwidth'])
                return errors.length ?
                  <Tooltip
                    title={errors[0]}
                    placement='bottom'
                    overlayInnerStyle={{ width: 415 }}><UI.WarningCircleRed />
                  </Tooltip> :<></>
              }}
            </Form.Item>
          </Space>
        </UI.BandwidthStyleFormItem>
      }
    },
    {
      title: $t({ defaultMessage: 'Max Bandwidth' }),
      align: 'center',
      key: 'maxBandwidth',
      dataIndex: 'maxBandwidth',
      render: function (_, row, index) {
        return <UI.BandwidthStyleFormItem>
          <Space>
            <Form.Item
              name={['trafficClassSettings', index, 'maxBandwidth']}
              noStyle
              rules={[
                { required: true, message: $t({ defaultMessage: 'Please enter Max Bandwidth' }) },
                {
                  type: 'integer', transform: Number, min: 1, max: 100,
                  message: $t(validationMessages.numberRangeInvalid, { from: 1, to: 100 })
                },
                { validator: (_, value) => validateMaxBandwidth(index, value) }
              ]}
              children={
                <InputNumber
                  style={{ width: '70px' }}
                  disabled={isDefaultProfile} />
              }
              validateFirst
            />
            <span> % </span>
            <Form.Item noStyle
              dependencies={['trafficClassSettings', index, 'maxBandwidth']}
            >
              {({ getFieldError }) => {
                const errors = getFieldError(['trafficClassSettings', index, 'maxBandwidth'])
                return errors.length ?
                  <Tooltip
                    title={errors[0]}
                    placement='bottom'
                    overlayInnerStyle={{ width: 415 }}><UI.WarningCircleRed />
                  </Tooltip> :<></>
              }}
            </Form.Item>
          </Space>
        </UI.BandwidthStyleFormItem>
      }
    }
  ]

  return (
    <Row>
      <Col >
        <SpaceWrapper full direction='vertical' size={50}>
          <Row>
            <Col >
              <Row>
                <Col span={10}>
                  <Form.Item
                    name='name'
                    label={$t({ defaultMessage: 'Profile Name' })}
                    rules={[
                      { required: true },
                      { min: 2, max: 32 },
                      { validator: (_, value) => servicePolicyNameRegExp(value) }
                    ]}
                    children={<Input disabled={isDefaultProfile} />}
                  />
                  <Form.Item
                    name='description'
                    label={$t({ defaultMessage: 'Description' })}
                    rules={[{ max: 255 }]}
                    children={<Input disabled={isDefaultProfile} />}
                  />
                </Col>
                <Col span={20}>
                  <Form.Item
                    name='trafficClassSettings'
                    label={<>
                      {$t({ defaultMessage:
                        'Configure the HQoS bandwidth settings for each traffic class' })}
                    </>}
                    rules={
                      [{ required: true }]
                    }
                  >
                    <Form.Item noStyle>
                      <Alert type='info'
                        message={
                          // eslint-disable-next-line max-len
                          $t({ defaultMessage: `
                          Note:
                          Total guaranteed bandwidth across all classes must NOT exceed 100%.
                          Max bandwidth must exceed minimal guaranteed bandwidth in each class.
                          Guaranteed Bandwidth per traffic class must be over 1% if that traffic
                            class isset to Priority Scheduling.
                        ` })
                        }
                      />
                      <Table
                        rowKey={(row: TrafficClassSetting) => `${row.trafficClass}-${row.priority}`}
                        columns={columns}
                        dataSource={initialValues?.trafficClassSettings}
                        pagination={false}
                      />
                    </Form.Item>
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
        </SpaceWrapper>
      </Col>
    </Row>

  )
}

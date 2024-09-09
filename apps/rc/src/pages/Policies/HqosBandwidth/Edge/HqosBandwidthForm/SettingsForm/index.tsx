import { Alert, Checkbox, Col, Form, Input, InputNumber, Row, Space, Table, TableProps, Tooltip } from 'antd'
import _                                                                                          from 'lodash'
import { useIntl }                                                                                from 'react-intl'

import { useStepFormContext }                                                                                       from '@acx-ui/components'
import { SpaceWrapper }                                                                                             from '@acx-ui/rc/components'
import { EdgeHqosViewData, TrafficClassSetting, priorityToDisplay, servicePolicyNameRegExp, trafficClassToDisplay } from '@acx-ui/rc/utils'

import * as UI from '../../styledComponents'

const checkBandwidthMinAndMaxValue = (bandwidth?: number) => {
  if(bandwidth === undefined || bandwidth === null) {
    return true
  }
  if(bandwidth <= 0 || bandwidth > 100) {
    return false
  }
  return true
}

const checkMinAndMaxBandwidthCompare = (minBandwidth?: number, maxBandwidth?: number) => {
  if(!minBandwidth || !maxBandwidth) {
    return true
  }
  if(minBandwidth >= maxBandwidth) {
    return false
  }
  return true
}

export const SettingsForm = () => {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { initialValues } = useStepFormContext<EdgeHqosViewData>()

  const bandwidthMinAndMaxErrMsg =
  $t({ defaultMessage: 'This value should be between 1 and 100' })
  const guaranteedBandwidthSumErrMsg =
  $t({ defaultMessage: 'Total guaranteed bandwidth across all classes must NOT exceed 100%' })
  const bandwidthRangeCompareErrMsg =
  $t({ defaultMessage: 'Max bandwidth must exceed minimal guaranteed bandwidth.' })

  const sumMinBandWidthExcludeCurrent =
  (index:number, trafficClassArray?:TrafficClassSetting[]) => {
    const copyTrafficClassArray = _.cloneDeep(trafficClassArray)
    copyTrafficClassArray?.splice(index, 1)
    const otherMinBandwidthArray = copyTrafficClassArray?.map((item) => item?.minBandwidth)
    return otherMinBandwidthArray?.reduce((a, b) => (a??0) + (b??0)) ?? 0 as number
  }

  const validateMinBandwidth = (index:number, minBandwidth?: number) => {
    if(minBandwidth === undefined) {
      return Promise.resolve()
    }

    if(!checkBandwidthMinAndMaxValue(minBandwidth)) {
      return Promise.reject(bandwidthMinAndMaxErrMsg)
    }
    const trafficClassSettings = form.getFieldValue('trafficClassSettings')
    const trafficClassArray = Object.values(trafficClassSettings) as TrafficClassSetting[]

    const otherMinBandwidthSum = sumMinBandWidthExcludeCurrent(index, trafficClassArray)
    if(minBandwidth + otherMinBandwidthSum > 100) {
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
    if(maxBandwidth === undefined) {
      return Promise.resolve()
    }

    if(!checkBandwidthMinAndMaxValue(maxBandwidth)) {
      return Promise.reject(bandwidthMinAndMaxErrMsg)
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
      align: 'center',
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
      align: 'center',
      render: function (_, row, index) {
        return <UI.BandwidthStyleFormItem>
          <Space>
            <Form.Item
              name={['trafficClassSettings', index, 'minBandwidth']}
              noStyle
              rules={[
                { validator: (_, value) => validateMinBandwidth(index, value) }
              ]}
              children={<InputNumber style={{ width: '60px' }}/>}
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
                    overlayClassName={UI.toolTipClassName}
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
      render: function (_, row, index) {
        return <UI.BandwidthStyleFormItem>
          <Space>
            <Form.Item
              name={['trafficClassSettings', index, 'maxBandwidth']}
              noStyle
              rules={[
                { validator: (_, value) => validateMaxBandwidth(index, value) }
              ]}
              children={<InputNumber style={{ width: '60px' }} />}
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
                    overlayClassName={UI.toolTipClassName}
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

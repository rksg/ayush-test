/* eslint-disable max-len */
import { useEffect } from 'react'

import { Col, Form, InputNumber, Row, Space, Switch } from 'antd'
import { useIntl }                                    from 'react-intl'

import { Loader, StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'
import { ApCompatibilityToolTip }                         from '@acx-ui/rc/components'
import { useGetEdgeClusterArpTerminationSettingsQuery }   from '@acx-ui/rc/services'
import { EdgeClusterStatus, IncompatibilityFeatures }     from '@acx-ui/rc/utils'

import { StyledFormItem, tooltipIconStyle } from '../styledComponents'

export const ArpTerminationFormItem = (props: {
  currentClusterStatus: EdgeClusterStatus,
  setEdgeFeatureName: (feature: IncompatibilityFeatures) => void
}) => {
  const { $t } = useIntl()
  const { currentClusterStatus, setEdgeFeatureName } = props
  const { form } = useStepFormContext()

  const {
    data: arpTerminationSettings,
    isLoading: isArpTerminationSettingsLoading
  } = useGetEdgeClusterArpTerminationSettingsQuery({
    params: {
      venueId: currentClusterStatus.venueId,
      clusterId: currentClusterStatus.clusterId
    }
  },{
    // skip: !Boolean(clusterInfo)
  })

  useEffect(() => {
    form.setFieldValue('originArpEnabled', arpTerminationSettings?.enabled)
    form.setFieldsValue({
      arpTerminationSwitch: arpTerminationSettings?.enabled,
      arpAgingTimerSwitch: arpTerminationSettings?.agingTimerEnabled,
      agingTimeSec: arpTerminationSettings?.agingTimeSec
    })
  }, [arpTerminationSettings])

  return <Loader states={[{ isLoading: isArpTerminationSettingsLoading }]}>
    <Row gutter={20}>
      <Col span={7}>
        <StepsForm.FieldLabel width='50%'>
          <Space>
            {$t({ defaultMessage: 'ARP Termination' })}
            <ApCompatibilityToolTip
              title='ARP Termination terminates ARP requests on RUCKUS Edge and generates responses based on the IP/MAC bindings cached from snooping the original ARP responses from the target hosts. Enabling it reduces ARP broadcast traffic in wireless networks. ARP requests matching an existing IP/MAC binding will be dropped until the aging timer expires.'
              visible
              onClick={() => setEdgeFeatureName(IncompatibilityFeatures.ARP_TERMINATION)}
            />
          </Space>
          <Space>
            <Form.Item
              name='arpTerminationSwitch'
              valuePropName='checked'
            >
              <Switch />
            </Form.Item>
          </Space>
        </StepsForm.FieldLabel>
      </Col>
    </Row>

    <Row gutter={20}>
      <Col span={7}>
        <Form.Item dependencies={['arpTerminationSwitch']} >
          {({ getFieldValue }) => {
            return getFieldValue('arpTerminationSwitch') &&
            <StepsForm.FieldLabel width='50%'>
              <Space>
                {$t({ defaultMessage: 'ARP Termination Aging Timer' })}
                <Tooltip.Question
                  title={$t({ defaultMessage: 'Once the aging timer expires, the IP/MAC binding is removed and then reestablished through subsequent ARP snooping. The ARP aging timer should be greater than DHCP lease time.  If a DHCP lease expires prior to the associated IP/MAC binding this can cause ARP resolution failure for the new device the IP is assigned to until the binding is aged out. The minimum aging timer is 600 seconds.' })}
                  placement='right'
                  iconStyle={tooltipIconStyle}
                />
              </Space>
              <Space>
                <Form.Item
                  name='arpAgingTimerSwitch'
                  valuePropName='checked'
                >
                  <Switch />
                </Form.Item>
              </Space>
            </StepsForm.FieldLabel>
          }}
        </Form.Item>
        <Form.Item dependencies={['arpAgingTimerSwitch']}>
          {({ getFieldValue }) => {
            return getFieldValue('arpAgingTimerSwitch') &&
              <Space align='center'>
                <StyledFormItem
                  name='agingTimeSec'
                  label=''
                  initialValue={600}
                  rules={[{
                    required: true, message: $t({ defaultMessage: 'Please enter ARP Aging Timer' })
                  },
                  { type: 'number', min: 600, max: 2147483647 }]}
                  children={
                    <InputNumber style={{ width: '100px' }} />
                  }
                />
                {$t({ defaultMessage: 'seconds' })}
              </Space>
          }}
        </Form.Item>
      </Col>
    </Row>
  </Loader>
}
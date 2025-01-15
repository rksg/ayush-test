/* eslint-disable max-len */
import { useEffect } from 'react'

import { Col, Form, InputNumber, Row, Space, Switch } from 'antd'
import { useIntl }                                    from 'react-intl'

import { Loader, StepsForm, Tooltip, useStepFormContext } from '@acx-ui/components'
import { ApCompatibilityToolTip }                         from '@acx-ui/rc/components'
import {
  useGetEdgeClusterArpTerminationSettingsQuery,
  useGetEdgeFeatureSetsQuery,
  useGetVenueEdgeFirmwareListQuery
} from '@acx-ui/rc/services'
import { EdgeClusterStatus, IncompatibilityFeatures } from '@acx-ui/rc/utils'
import { compareVersions }                            from '@acx-ui/utils'

import { StyledFormItem, tooltipIconStyle } from '../styledComponents'

const checkArpByVenueFirmware = (requiredFw?: string, venueEdgeFw?: string) => {
  return !!requiredFw && !!venueEdgeFw && compareVersions(venueEdgeFw, requiredFw) >= 0
}

export const ArpTerminationFormItem = (props: {
  currentClusterStatus: EdgeClusterStatus,
  setEdgeFeatureName: (feature: IncompatibilityFeatures) => void
}) => {
  const { $t } = useIntl()
  const { currentClusterStatus, setEdgeFeatureName } = props
  const { form } = useStepFormContext()

  const { arpRequiredFw } = useGetEdgeFeatureSetsQuery({
    payload: {
      filters: {
        featureNames: [IncompatibilityFeatures.ARP_TERMINATION]
      } }
  }, {
    selectFromResult: ({ data }) => {
      return {
        arpRequiredFw: data?.featureSets
          ?.find(item => item.featureName === IncompatibilityFeatures.ARP_TERMINATION)?.requiredFw
      }
    }
  })

  const { venueEdgeFw } = useGetVenueEdgeFirmwareListQuery({}, {
    skip: !Boolean(currentClusterStatus.venueId),
    selectFromResult: ({ data }) => {
      return {
        venueEdgeFw: data?.filter(fw => fw.id === currentClusterStatus.venueId)?.[0].versions?.[0].id
      }
    }
  })
  const isArpControllable = checkArpByVenueFirmware(arpRequiredFw, venueEdgeFw)

  const {
    data: arpTerminationSettings,
    isLoading: isArpTerminationSettingsLoading
  } = useGetEdgeClusterArpTerminationSettingsQuery({
    params: {
      venueId: currentClusterStatus.venueId,
      edgeClusterId: currentClusterStatus.clusterId
    }
  },{
    skip: !isArpControllable
  })

  useEffect(() => {
    form.setFieldValue('originalArpSettings', arpTerminationSettings)
    form.setFieldsValue({
      arpTerminationSwitch: arpTerminationSettings?.enabled,
      arpAgingTimerSwitch: arpTerminationSettings?.agingTimerEnabled,
      agingTimeSec: arpTerminationSettings?.agingTimeSec
    })
  }, [arpTerminationSettings])

  return <><Row gutter={20}>
    <Col span={7}>
      <Loader states={[{ isLoading: isArpTerminationSettingsLoading }]}>
        <StepsForm.FieldLabel width='50%'>
          <Space>
            {$t({ defaultMessage: 'ARP Termination' })}
            <ApCompatibilityToolTip
              title={$t({ defaultMessage: 'Reply to ARP requests using local IP to MAC cache. Reduces broadcast traffic but cache can be stale if IPs are reassigned between hosts.' })}
              showDetailButton
              onClick={() => setEdgeFeatureName(IncompatibilityFeatures.ARP_TERMINATION)}
            />
          </Space>
          <Form.Item
            name='arpTerminationSwitch'
            valuePropName='checked'
          >
            <Switch disabled={!isArpControllable}/>
          </Form.Item>
        </StepsForm.FieldLabel>
      </Loader>
    </Col>
  </Row>

  <Row gutter={20}>
    <Col span={4}>
      <Form.Item noStyle dependencies={['arpTerminationSwitch']} >
        {({ getFieldValue }) => {
          return getFieldValue('arpTerminationSwitch') &&
            <StepsForm.FieldLabel width='91%'>
              <Space style={{ alignItems: 'flex-start' }}>
                {$t({ defaultMessage: 'ARP Termination Aging Timer' })}
                <Tooltip.Question
                  title={$t({ defaultMessage: 'Time in seconds before cached IP to MAC mappings expire. Should be shorter than DHCP lease time to prevent stale entries.' })}
                  placement='right'
                  iconStyle={tooltipIconStyle}
                />
              </Space>
              <Form.Item
                name='arpAgingTimerSwitch'
                valuePropName='checked'
              >
                <Switch />
              </Form.Item>
            </StepsForm.FieldLabel>
        }}
      </Form.Item>
    </Col>
    <Col span={3}>
      <Form.Item dependencies={['arpTerminationSwitch', 'arpAgingTimerSwitch']}>
        {({ getFieldValue }) => {
          return getFieldValue('arpTerminationSwitch') && getFieldValue('arpAgingTimerSwitch') &&
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
                    <InputNumber style={{ width: '120px' }} />
                  }
                />
                {$t({ defaultMessage: 'seconds' })}
              </Space>
        }}
      </Form.Item>
    </Col>
  </Row>
  </>
}
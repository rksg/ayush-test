import {
  Col,
  Form,
  Radio,
  RadioChangeEvent,
  Row,
  Space
} from 'antd'

import { StepsForm }                             from '@acx-ui/components'
import { GuestNetworkTypeEnum, NetworkTypeEnum } from '@acx-ui/rc/utils'

import { GuestNetworkTypeDescription, GuestNetworkTypeLabel } from '../contentsMap'
import { NetworkDiagram }                                     from '../NetworkDiagram/NetworkDiagram'
import { RadioDescription }                                   from '../styledComponents'

export function PortalTypeForm () {
  return (
    <Row gutter={20}>
      <Col span={10}>
        <TypesForm />
      </Col>
      <Col span={14}>
        <NetworkDiagram type={NetworkTypeEnum.CAPTIVEPORTAL} />
      </Col>
    </Row>
  )
}

/* eslint-disable */
const onChange = (e: RadioChangeEvent) => {
  // setSettingStepTitle(e.target.value as NetworkTypeEnum)
}
/* eslint-enable */

function TypesForm () {
  return (
    <>
      <StepsForm.Title>Portal Type</StepsForm.Title>
      <Form.Item
        name={['guestPortal', 'guestNetworkType']}
        label='Select the way users gain access to the network through the captive portal'
        rules={[{ required: true }]}
      >
        <Radio.Group onChange={onChange}>
          <Space direction='vertical'>
            <Radio value={GuestNetworkTypeEnum.ClickThrough}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.ClickThrough]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.ClickThrough]}
              </RadioDescription>
            </Radio>

            <Radio value={GuestNetworkTypeEnum.SelfSignIn}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.SelfSignIn]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.SelfSignIn]}
              </RadioDescription>
            </Radio>

            <Radio value={GuestNetworkTypeEnum.Cloudpath}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.Cloudpath]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.Cloudpath]}
              </RadioDescription>
            </Radio>

            <Radio value={GuestNetworkTypeEnum.HostApproval}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.HostApproval]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.HostApproval]}
              </RadioDescription>
            </Radio>

            <Radio value={GuestNetworkTypeEnum.GuestPass}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.GuestPass]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.GuestPass]}
              </RadioDescription>
            </Radio>

            <Radio value={GuestNetworkTypeEnum.WISPr}>
              {GuestNetworkTypeLabel[GuestNetworkTypeEnum.WISPr]}
              <RadioDescription>
                {GuestNetworkTypeDescription[GuestNetworkTypeEnum.WISPr]}
              </RadioDescription>
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
    </>
  )
}

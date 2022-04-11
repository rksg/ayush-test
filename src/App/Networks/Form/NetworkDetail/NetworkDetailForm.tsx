import {
  Form,
  Input,
  Col,
  Radio,
  Row,
  Space
} from 'antd'
import TextArea             from 'antd/lib/input/TextArea'
import { StepsForm }        from 'src/components/StepsForm'
import { NetworkTypeEnum }  from 'src/utils/rc/constants'
import { NetworkDiagram }   from '../NetworkDiagram/NetworkDiagram'
import { RadioDescription } from '../styledComponents'

enum NetworkTypeDescription {
  PSK = 'Require users to enter a passphrase (that you have defined for the network) to connect',
  DPSK = 'Require users to enter a passphrase to connect. The passphrase is unique per device',
  AAA = `Use 802.1X standard and WPA2 security protocols to authenticate users using an
         authentication server on thenetwork`,
  CAPTIVEPORTAL = 'Users are authorized through a captive portal in various methods',
  OPEN = `Allow users to access the network without any authentication/security
          (not recommended)`
}

enum NetworkTypeLabel {
  PSK = 'Pre-Shared Key (PSK)',
  DPSK = 'Dynamic Pre-Shared Key (DPSK)',
  AAA = 'Enterprise AAA (802.1X)',
  CAPTIVEPORTAL = 'Captive portal',
  OPEN = 'Open Network'
}

export function NetworkDetailForm () {
  return (<Row gutter={100}>
    <Col span={10}>
      <StepsForm.Title>Network Details</StepsForm.Title>
      <Form.Item
        name='name'
        label='Network Name'
        rules={[{ required: true }, { min: 2 }, { max: 32 }]}
        children={<Input />} />
      <Form.Item
        name='description'
        label='Description'
        children={<TextArea rows={4} maxLength={64} />} />
      <Form.Item
        name='type'
        label='Network Type'
        rules={[{ required: true }]}>
        <Radio.Group>
          <Space direction='vertical'>
            <Radio value={NetworkTypeEnum.PSK} disabled>
              {NetworkTypeLabel.PSK}
              <RadioDescription>
                {NetworkTypeDescription.PSK}
              </RadioDescription>
            </Radio>

            <Radio value={NetworkTypeEnum.DPSK} disabled>
              {NetworkTypeLabel.DPSK}
              <RadioDescription>
                {NetworkTypeDescription.DPSK}
              </RadioDescription>
            </Radio>

            <Radio value={NetworkTypeEnum.AAA}>
              {NetworkTypeLabel.AAA}
              <RadioDescription>
                {NetworkTypeDescription.AAA}
              </RadioDescription>
            </Radio>

            <Radio value={NetworkTypeEnum.CAPTIVEPORTAL} disabled>
              {NetworkTypeLabel.CAPTIVEPORTAL}
              <RadioDescription>
                {NetworkTypeDescription.CAPTIVEPORTAL}
              </RadioDescription>
            </Radio>

            <Radio value={NetworkTypeEnum.OPEN} disabled>
              {NetworkTypeLabel.OPEN}
              <RadioDescription>
                {NetworkTypeDescription.OPEN}
              </RadioDescription>
            </Radio>
          </Space>
        </Radio.Group>
      </Form.Item>
    </Col>

    <Col span={10}>
      <NetworkDiagram />
    </Col>
  </Row>)
}

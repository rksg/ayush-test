import { useContext } from 'react'

import { useIntl } from 'react-intl'

import { Form, Input, Col, Radio, Row, Space } from 'antd'
import TextArea                                from 'antd/lib/input/TextArea'

import { StepsForm }       from '@acx-ui/components'
import { NetworkTypeEnum } from '@acx-ui/rc/utils'

import { NetworkTypeDescription, NetworkTypeLabel } from '../contentsMap'
import { NetworkDiagram }                           from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext                           from '../NetworkFormContext'
import { RadioDescription }                         from '../styledComponents'

import type { RadioChangeEvent } from 'antd'

const { useWatch } = Form

export function NetworkDetailForm () {
  const { $t } = useIntl()
  const type = useWatch<string>('type')
  const { setNetworkType: setSettingStepTitle } = useContext(NetworkFormContext)
  const onChange = (e: RadioChangeEvent) => {
    setSettingStepTitle(e.target.value as NetworkTypeEnum)
  }
  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{$t({ id: 'createNetworkForm.title', defaultMessage: 'Network Details'})}</StepsForm.Title>
        <Form.Item
          name='name'
          label={$t({ id: 'createNetworkForm.name', defaultMessage: 'Network Name'})}
          rules={[{ required: true }, { min: 2 }, { max: 32 }]}
          children={<Input />}
        />
        <Form.Item
          name='description'
          label={$t({ id: 'createNetworkForm.desc', defaultMessage: 'Description'})}
          children={<TextArea rows={4} maxLength={64} />}
        />
        <Form.Item
          name='type'
          label={$t({ id: 'createNetworkForm.type', defaultMessage: 'Network Type'})}
          rules={[{ required: true }]}
        >
          <Radio.Group onChange={onChange}>
            <Space direction='vertical'>
              <Radio value={NetworkTypeEnum.PSK} disabled>
                {NetworkTypeLabel.psk}
                <RadioDescription>
                  {NetworkTypeDescription.psk}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.DPSK}>
                {NetworkTypeLabel.dpsk}
                <RadioDescription>
                  {NetworkTypeDescription.dpsk}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.AAA}>
                {NetworkTypeLabel.aaa}
                <RadioDescription>
                  {NetworkTypeDescription.aaa}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.CAPTIVEPORTAL} disabled>
                {NetworkTypeLabel.guest}
                <RadioDescription>
                  {NetworkTypeDescription.guest}
                </RadioDescription>
              </Radio>

              <Radio value={NetworkTypeEnum.OPEN}>
                {NetworkTypeLabel.open}
                <RadioDescription>
                  {NetworkTypeDescription.open}
                </RadioDescription>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
      </Col>

      <Col span={14}>
        <NetworkDiagram type={type}/>
      </Col>
    </Row>
  )
}

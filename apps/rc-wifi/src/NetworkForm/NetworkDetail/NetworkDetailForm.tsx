import { useContext } from 'react'

import { Form, Input, Col, Radio, Row, Space } from 'antd'
import TextArea                                from 'antd/lib/input/TextArea'

import { StepsForm }                             from '@acx-ui/components'
import { useLazyNetworkListQuery }               from '@acx-ui/rc/services'
import { NetworkTypeEnum, checkObjectNotExists } from '@acx-ui/rc/utils'
import { useParams }                             from '@acx-ui/react-router-dom'

import { NetworkTypeDescription, NetworkTypeLabel } from '../contentsMap'
import { NetworkDiagram }                           from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext                           from '../NetworkFormContext'
import { RadioDescription }                         from '../styledComponents'

import type { RadioChangeEvent } from 'antd'

const { useWatch } = Form

export function NetworkDetailForm () {
  const type = useWatch<NetworkTypeEnum>('type')
  const { setNetworkType: setSettingStepTitle } = useContext(NetworkFormContext)
  const onChange = (e: RadioChangeEvent) => {
    setSettingStepTitle(e.target.value as NetworkTypeEnum)
  }
  const networkListPayload = {
    searchString: '',
    fields: ['name', 'id'],
    searchTargetFields: ['name'],
    filters: {},
    pageSize: 10000
  }
  const [getNetworkList] = useLazyNetworkListQuery()
  const params = useParams()

  const nameValidator = async (value: string) => {
    const payload = { ...networkListPayload, searchString: value }
    const list = (await getNetworkList({ params, payload }, true)
      .unwrap()).data.map(n => ({ name: n.name }))
    return checkObjectNotExists(list, value, 'Network')
  }

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>Network Details</StepsForm.Title>
        <Form.Item
          name='name'
          label='Network Name'
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='description'
          label='Description'
          children={<TextArea rows={4} maxLength={64} />}
        />
        <Form.Item
          name='type'
          label='Network Type'
          rules={[{ required: true }]}
        >
          <Radio.Group onChange={onChange}>
            <Space direction='vertical'>
              <Radio value={NetworkTypeEnum.PSK}>
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

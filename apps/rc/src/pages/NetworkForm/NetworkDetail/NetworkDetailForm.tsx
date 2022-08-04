import { useContext } from 'react'


import { Form, Input, Col, Radio, Row, Space } from 'antd'
import TextArea                                from 'antd/lib/input/TextArea'
import { useIntl }                             from 'react-intl'

import { StepsForm }                             from '@acx-ui/components'
import { useLazyNetworkListQuery }               from '@acx-ui/rc/services'
import { NetworkTypeEnum, checkObjectNotExists } from '@acx-ui/rc/utils'
import { useParams }                             from '@acx-ui/react-router-dom'

import { networkTypesDescription, networkTypes } from '../contentsMap'
import { NetworkDiagram }                        from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext                        from '../NetworkFormContext'
import { RadioDescription }                      from '../styledComponents'

import type { RadioChangeEvent } from 'antd'

const { useWatch } = Form

export function NetworkDetailForm () {
  const { $t } = useIntl()
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

  const types = [
    { type: NetworkTypeEnum.PSK, disabled: true },
    { type: NetworkTypeEnum.DPSK, disabled: false },
    { type: NetworkTypeEnum.AAA, disabled: false },
    { type: NetworkTypeEnum.CAPTIVEPORTAL, disabled: true },
    { type: NetworkTypeEnum.OPEN, disabled: false }
  ]

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{$t({ defaultMessage: 'Network Details' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Network Name' })}
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
          label={$t({ defaultMessage: 'Description' })}
          children={<TextArea rows={4} maxLength={64} />}
        />
        <Form.Item
          name='type'
          label={$t({ defaultMessage: 'Network Type' })}
          rules={[{ required: true }]}
        >
          <Radio.Group onChange={onChange}>
            <Space direction='vertical'>
              {types.map(({ type, disabled }) => (
                <Radio key={type} value={type} disabled={disabled}>
                  {$t(networkTypes[type])}
                  <RadioDescription>
                    {$t(networkTypesDescription[type])}
                  </RadioDescription>
                </Radio>
              ))}
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

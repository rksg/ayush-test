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
  const intl = useIntl()
  const type = useWatch<NetworkTypeEnum>('type')
  const { 
    setNetworkType: setSettingStepTitle, 
    editMode,
    cloneMode 
  } = useContext(NetworkFormContext)
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
    const list = (await getNetworkList({ params, payload }, true).unwrap()).data
      .filter(n => n.id !== params.networkId)
      .map(n => n.name)

    return checkObjectNotExists(intl, list, value, intl.$t({ defaultMessage: 'Network' }))
  }

  const types = [
    { type: NetworkTypeEnum.PSK, disabled: false },
    { type: NetworkTypeEnum.DPSK, disabled: false },
    { type: NetworkTypeEnum.AAA, disabled: false },
    { type: NetworkTypeEnum.CAPTIVEPORTAL, disabled: false },
    { type: NetworkTypeEnum.OPEN, disabled: false }
  ]

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{intl.$t({ defaultMessage: 'Network Details' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={intl.$t({ defaultMessage: 'Network Name' })}
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
          label={intl.$t({ defaultMessage: 'Description' })}
          children={<TextArea rows={4} maxLength={64} />}
        />
        <Form.Item>
          {( !editMode && !cloneMode ) &&
            <Form.Item
              name='type'
              label={intl.$t({ defaultMessage: 'Network Type' })}
              rules={[{ required: true }]}
            >
              <Radio.Group onChange={onChange}>
                <Space direction='vertical'>
                  {types.map(({ type, disabled }) => (
                    <Radio key={type} value={type} disabled={disabled}>
                      {intl.$t(networkTypes[type])}
                      <RadioDescription>
                        {intl.$t(networkTypesDescription[type])}
                      </RadioDescription>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </Form.Item>
          }
          {( editMode || cloneMode ) &&
            <Form.Item name='type' label='Network Type'>
              <>
                <h4 className='ant-typography'>{type && intl.$t(networkTypes[type])}</h4>
                <label>{type && intl.$t(networkTypesDescription[type])}</label>
              </>
            </Form.Item>
          }
        </Form.Item>
      </Col>

      <Col span={14}>
        <NetworkDiagram type={type}/>
      </Col>
    </Row>
  )
}

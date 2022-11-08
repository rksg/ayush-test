import { useContext } from 'react'

import { Form, Input, Col, Radio, Row, Space } from 'antd'
import TextArea                                from 'antd/lib/input/TextArea'
import { useIntl }                             from 'react-intl'

import { StepsForm, Tooltip }         from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { useLazyNetworkListQuery }    from '@acx-ui/rc/services'
import {
  NetworkTypeEnum,
  WifiNetworkMessages,
  checkObjectNotExists,
  hasGraveAccentAndDollarSign } from '@acx-ui/rc/utils'
import { useParams }       from '@acx-ui/react-router-dom'
import { notAvailableMsg } from '@acx-ui/utils'

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
    editMode,
    cloneMode,
    data,
    setData
  } = useContext(NetworkFormContext)
  const onChange = (e: RadioChangeEvent) => {
    setData && setData({ ...data, type: e.target.value as NetworkTypeEnum })
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

    return checkObjectNotExists(list, value, intl.$t({ defaultMessage: 'Network' }))
  }

  const types = [
    { type: NetworkTypeEnum.PSK, disabled: false },
    { type: NetworkTypeEnum.DPSK, disabled: true },
    { type: NetworkTypeEnum.AAA, disabled: false },
    { type: NetworkTypeEnum.CAPTIVEPORTAL, disabled: true },
    { type: NetworkTypeEnum.OPEN, disabled: false }
  ]

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{intl.$t({ defaultMessage: 'Network Details' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={<>
            { intl.$t({ defaultMessage: 'Network Name' }) }
            <Tooltip
              title={intl.$t(WifiNetworkMessages.NETWORK_NAME_TOOLTIP)}
              placement='bottom'
            >
              <QuestionMarkCircleOutlined />
            </Tooltip>
          </>}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value) },
            { validator: (_, value) => hasGraveAccentAndDollarSign(value) }
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
                      <Tooltip
                        title={[NetworkTypeEnum.DPSK, NetworkTypeEnum.CAPTIVEPORTAL]
                          .indexOf(type) > -1 ? intl.$t(notAvailableMsg) : ''}>
                        {intl.$t(networkTypes[type])}
                        <RadioDescription>
                          {intl.$t(networkTypesDescription[type])}
                        </RadioDescription>
                      </Tooltip>
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
        <NetworkDiagram />
      </Col>
    </Row>
  )
}



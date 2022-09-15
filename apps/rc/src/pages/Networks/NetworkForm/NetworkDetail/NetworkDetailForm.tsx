import { useContext } from 'react'

import {
  QuestionCircleOutlined
} from '@ant-design/icons'
import { Form, Input, Col, Radio, Row, Space, Tooltip } from 'antd'
import TextArea                                         from 'antd/lib/input/TextArea'
import { useIntl }                                      from 'react-intl'

import { StepsForm }                                    from '@acx-ui/components'
import { useLazyNetworkListQuery }                      from '@acx-ui/rc/services'
import { NetworkTypeEnum, checkObjectNotExists, Venue } from '@acx-ui/rc/utils'
import { useParams }                                    from '@acx-ui/react-router-dom'

import { ToggleButton }                          from '../../../../components/ToggleButton'
import { networkTypesDescription, networkTypes } from '../contentsMap'
import { NetworkDiagram }                        from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext                        from '../NetworkFormContext'
import { RadioDescription }                      from '../styledComponents'

import type { RadioChangeEvent } from 'antd'

const { useWatch } = Form

export function NetworkDetailForm () {
  const intl = useIntl()
  const [
    type,
    name,
    venues,
    differentSSID
  ] = [
    useWatch<NetworkTypeEnum>('type'),
    useWatch<NetworkTypeEnum>('name'),
    useWatch('venues'),
    useWatch('differentSSID')
  ]

  const { 
    setNetworkType: setSettingStepTitle, 
    editMode,
    cloneMode,
    data 
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

  const ssidValidator = async (value: string) => {
    interface Ipayload {
      venueId: string, 
      networkId?: string, 
      ssids:string[]
    }
    // TODO: Get NetworkForm Venues
    if (venues && venues.length > 0) {
      const payload: Ipayload[] = []
      venues.forEach((activatedVenue:Venue) => {
        const venueId = activatedVenue.venueId
        const networkId = data?.id
        payload.push({ venueId, networkId, ssids: [value || name] })
      })
      // const list = (await getNetworkList({ params, payload }, true).unwrap()).data
      //   .filter(n => n.id !== params.networkId)
      //   .map(n => n.name)
      // return checkObjectNotExists(intl, list, value, intl.$t({ defaultMessage: 'Network' }))
    }
    return true
  }

  const types = [
    { type: NetworkTypeEnum.PSK, disabled: false },
    { type: NetworkTypeEnum.DPSK, disabled: false },
    { type: NetworkTypeEnum.AAA, disabled: false },
    { type: NetworkTypeEnum.CAPTIVEPORTAL, disabled: true },
    { type: NetworkTypeEnum.OPEN, disabled: false }
  ]

  const ssidTooltip = <Tooltip
    placement='bottom'
    children={<QuestionCircleOutlined />}
    title={intl.$t({
      // eslint-disable-next-line max-len
      defaultMessage: 'SSID may contain between 2 and 32 characters (32 Bytes when using UTF-8 non-Latin characters)'
    })}
  /> //TODO: Form item label

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
        <Form.Item noStyle name='differentSSID'>
          <ToggleButton
            enableText={intl.$t({ defaultMessage: 'Same as network name' })}
            disableText={intl.$t({ defaultMessage: 'Set different SSID' })}
          />
        </Form.Item>
        {differentSSID &&
        <>
          <Form.Item
            name='ssid'
            label={intl.$t({ defaultMessage: 'SSID' })}
            rules={[
              { required: true },
              { min: 2 },
              { max: 32 },
              { validator: (_, value) => ssidValidator(value) }
            ]}
            validateFirst
            hasFeedback
            children={<Input />}
          />
          {ssidTooltip}
        </>
        }
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

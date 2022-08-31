import { Form, Input, Col, Radio, Row, Space } from 'antd'
import { useIntl }                             from 'react-intl'

import { Button, StepsForm }                                from '@acx-ui/components'
import { useLazyNetworkListQuery }                  from '@acx-ui/rc/services'
import { DHCPConfigTypeEnum, checkObjectNotExists } from '@acx-ui/rc/utils'
import { useParams }                                from '@acx-ui/react-router-dom'

import { dhcpTypes, dhcpTypesDesc } from './contentsMap'
import { DHCPDiagram }              from './DHCPDiagram/DHCPDiagram'
import { RadioDescription }         from './styledComponents'
import { PoolDetail } from './DHCPPool/PoolDetail'


const { useWatch } = Form

export function SettingForm () {
  const intl = useIntl()

  const type = useWatch<DHCPConfigTypeEnum>('dhcpConfig')

  // const { editMode } = useContext(DHCPFormContext)

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
    { type: DHCPConfigTypeEnum.SIMPLE },
    { type: DHCPConfigTypeEnum.MULTIPLE },
    { type: DHCPConfigTypeEnum.HIERARCHICAL }
  ]

  return (
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{intl.$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='name'
          label={intl.$t({ defaultMessage: 'Service Name' })}
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
          name='tags'
          label={intl.$t({ defaultMessage: 'Tags' })}
          children={<Input />}
        />
        <Form.Item>

          {params?.type === 'wifi' &&
          <Form.Item
            name='dhcpConfig'
            label={intl.$t({ defaultMessage: 'DHCP Configuration' })}
            rules={[{ required: true }]}
          >
            <Radio.Group>
              <Space direction='vertical'>
                {types.map(({ type }) => (
                  <Radio key={type} value={type}>
                    {intl.$t(dhcpTypes[type])}
                    <RadioDescription>
                      {intl.$t(dhcpTypesDesc[type])}
                    </RadioDescription>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Form.Item>}

        </Form.Item>
        <PoolDetail></PoolDetail>
      </Col>
      {params?.type === 'wifi' &&
      <Col span={14}>
        <DHCPDiagram type={type}/>
      </Col>
      }
    </Row>
  )
}

import { useContext } from 'react'

import { Form, Input, Col, Radio, Row, Space, RadioChangeEvent } from 'antd'
import { useIntl }                                               from 'react-intl'

import { StepsForm }                             from '@acx-ui/components'
import { DHCPConfigTypeEnum, ServiceTechnology } from '@acx-ui/rc/utils'

import { dhcpTypes, dhcpTypesDesc }   from './contentsMap'
import { DHCPDiagram }                from './DHCPDiagram/DHCPDiagram'
import DHCPFormContext                from './DHCPFormContext'
import DHCPPoolMain                   from './DHCPPool'
import { RadioDescription, AntLabel } from './styledComponents'


const { useWatch } = Form
export function SettingForm () {
  const intl = useIntl()


  const type = useWatch<DHCPConfigTypeEnum>('dhcpConfig')
  const createType = useWatch<ServiceTechnology>('createType')
  const { saveState, updateSaveState } = useContext(DHCPFormContext)

  const types = Object.values(DHCPConfigTypeEnum)

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
            { max: 32 }
          // { validator: (_, value) => nameValidator(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />
        <Form.Item
          name='tags'
          style={{ display: 'none' }}
          label={intl.$t({ defaultMessage: 'Tags' })}
          children={<Input />}
        />

        <Form.Item
          name='createType'
          style={{ display: 'none' }}
          initialValue={ServiceTechnology.WIFI}
          label={intl.$t({ defaultMessage: 'Type' })}>
          <Radio.Group onChange={(e: RadioChangeEvent) => {
            updateSaveState({
              ...saveState,
              createType: e.target.value as ServiceTechnology
            })
          }}>
            <Radio value={ServiceTechnology.WIFI}>
              {intl.$t({ defaultMessage: 'Wi-Fi' })}
            </Radio>
            <Radio value={ServiceTechnology.SWITCH}>
              {intl.$t({ defaultMessage: 'Switch' })}
            </Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item>
          {createType === ServiceTechnology.WIFI &&
        <Form.Item
          name='dhcpConfig'
          initialValue={DHCPConfigTypeEnum.SIMPLE}
          label={intl.$t({ defaultMessage: 'DHCP Configuration' })}
          rules={[{ required: true,
            message: intl.$t({ defaultMessage: 'Please select DHCP Configuration' }) }]}
        >
          <Radio.Group>
            <Space direction='vertical'>
              {types.map(type => (
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

      </Col>
      {createType === ServiceTechnology.WIFI &&
      <Col span={10}>
        <DHCPDiagram type={type}/>
      </Col>
      }

      <AntLabel>
        {intl.$t({ defaultMessage: 'Set DHCP Pools' })}
      </AntLabel>
      <Col span={20}>
        <DHCPPoolMain/>
      </Col>
    </Row>
  )
}

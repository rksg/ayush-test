import { Form, Input, Col, Radio, Row, Space } from 'antd'
import { useIntl }                             from 'react-intl'

import { StepsForm }                  from '@acx-ui/components'
import { useGetDHCPProfileListQuery } from '@acx-ui/rc/services'
import { DHCPConfigTypeEnum }         from '@acx-ui/rc/utils'
import { useParams }                  from '@acx-ui/react-router-dom'

import { dhcpTypes, dhcpTypesDesc } from './contentsMap'
import { DHCPDiagram }              from './DHCPDiagram/DHCPDiagram'
import DHCPPoolTable                from './DHCPPool'
import { RadioDescription }         from './styledComponents'

interface DHCPFormProps {
  editMode?: boolean
}

const { useWatch } = Form
export function SettingForm (props: DHCPFormProps) {
  const { $t } = useIntl()
  const { editMode } = props
  const type = useWatch<DHCPConfigTypeEnum>('dhcpMode')

  const types = Object.values(DHCPConfigTypeEnum)
  const params = useParams()
  const { data: dhcpProfileList } = useGetDHCPProfileListQuery({ params })


  const nameValidator = async (_rule: unknown, value: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!editMode && value && dhcpProfileList?.length && dhcpProfileList?.findIndex((profile) =>
        profile.serviceName === value) !== -1
      ) {
        return reject(
          $t({ defaultMessage: 'The DHCP service with that name already exists' })
        )
      }
      return resolve()
    })
  }
  return (<>
    <Row gutter={20}>
      <Col span={10}>
        <StepsForm.Title>{$t({ defaultMessage: 'Settings' })}</StepsForm.Title>
        <Form.Item
          name='id'
          hidden
        />
        <Form.Item
          name='serviceName'
          label={$t({ defaultMessage: 'Service Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: nameValidator }
          ]}
          validateFirst
          hasFeedback
          children={<Input />}
        />

        <Form.Item
          name='dhcpMode'
          initialValue={DHCPConfigTypeEnum.SIMPLE}
          label={$t({ defaultMessage: 'DHCP Configuration' })}
          rules={[{ required: true,
            message: $t({ defaultMessage: 'Please select DHCP Configuration' }) }]}
        >
          <Radio.Group>
            <Space direction='vertical'>
              {types.map(type => (
                <Radio key={type} value={type}>
                  {$t(dhcpTypes[type])}
                  <RadioDescription>
                    {$t(dhcpTypesDesc[type])}
                  </RadioDescription>
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>

      </Col>
      <Col span={10}>
        <DHCPDiagram type={type}/>
      </Col>
    </Row>
    <Row gutter={20}>
      <Col span={20}>
        <Form.Item
          name='dhcpPools'
          rules={[
            {
              required: true,
              message: $t({ defaultMessage: 'Please create DHCP pools' })
            }]}
          label={$t({ defaultMessage: 'Set DHCP Pools' })}
          children={<DHCPPoolTable />}
        />
      </Col>
    </Row>
  </>)
}

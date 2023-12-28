import { Form, Input, Col, Radio, Row, Space } from 'antd'
import _                                       from 'lodash'
import { useIntl }                             from 'react-intl'

import { StepsFormLegacy }                   from '@acx-ui/components'
import { useLazyGetDHCPProfileListQuery }    from '@acx-ui/rc/services'
import { useGetDHCPProfileQuery }            from '@acx-ui/rc/services'
import { DHCPPool, servicePolicyNameRegExp } from '@acx-ui/rc/utils'
import { DHCPConfigTypeEnum }                from '@acx-ui/rc/utils'
import { checkObjectNotExists }              from '@acx-ui/rc/utils'
import { useParams }                         from '@acx-ui/react-router-dom'
import { getIntl }                           from '@acx-ui/utils'

import { dhcpTypes, dhcpTypesDesc } from './contentsMap'
import { DHCPDiagram }              from './DHCPDiagram/DHCPDiagram'
import { DEFAULT_GUEST_DHCP_NAME }  from './DHCPForm'
import DHCPPoolTable                from './DHCPPool'
import { RadioDescription }         from './styledComponents'

interface DHCPFormProps {
  editMode?: boolean
}

async function poolValidator (
  type: DHCPConfigTypeEnum,
  pools: DHCPPool[]
) {
  const { $t } = getIntl()
  const hasVlan1 = _.findIndex(pools, { vlanId: 1 })
  if(type === DHCPConfigTypeEnum.HIERARCHICAL){
    if(hasVlan1===-1){
      return Promise.reject($t({
        defaultMessage:
          // eslint-disable-next-line max-len
          'At least one DHCP pool with VLAN ID equals "1" must be configured for "Hierarchical" type of DHCP.'
      }))
    }
  }
  if(hasVlan1 >=0 && type === DHCPConfigTypeEnum.MULTIPLE){
    return Promise.reject($t({
      defaultMessage:
        // eslint-disable-next-line max-len
        'The pool has VLAN ID 1 which is not allowed in Multiple AP DHCP mode.'
    }))
  }
  return
}
const { useWatch } = Form
export function SettingForm (props: DHCPFormProps) {
  const { $t } = useIntl()
  const { editMode } = props
  const type = useWatch<DHCPConfigTypeEnum>('dhcpMode')

  const types = Object.values(DHCPConfigTypeEnum)
  const params = useParams()
  const [ getDHCPProfileList ] = useLazyGetDHCPProfileListQuery()
  const form = Form.useFormInstance()
  const id = Form.useWatch<string>('id', form)

  const nameValidator = async (value: string) => {
    const list = (await getDHCPProfileList({ params }).unwrap())
      .filter(dhcpProfile => dhcpProfile.id !== id)
      .map(dhcpProfile => ({ serviceName: dhcpProfile.serviceName }))
    // eslint-disable-next-line max-len
    return checkObjectNotExists(list, { serviceName: value } , $t({ defaultMessage: 'DHCP service' }))
  }

  const {
    data
  } = useGetDHCPProfileQuery({ params }, { skip: !editMode })
  const isDefaultService = editMode && data?.serviceName === DEFAULT_GUEST_DHCP_NAME

  return (<>
    <Row gutter={20}>
      <Col span={10}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
        <Form.Item
          name='id'
          children={<></>}
          hidden
        />
        <Form.Item
          name='serviceName'
          label={$t({ defaultMessage: 'Service Name' })}

          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (_, value) => nameValidator(value) },
            { validator: (_, value) => servicePolicyNameRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          children={<Input disabled={isDefaultService}/>}
          validateTrigger={'onBlur'}
        />

        <Form.Item
          name='dhcpMode'
          initialValue={DHCPConfigTypeEnum.SIMPLE}
          label={$t({ defaultMessage: 'DHCP Configuration' })}
          rules={[{ required: true,
            message: $t({ defaultMessage: 'Please select DHCP Configuration' }) }]}
        >
          <Radio.Group disabled={isDefaultService}>
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
            },
            {
              validator: (_rule, value) => poolValidator(type, value)
            }

          ]}
          label={$t({ defaultMessage: 'Set DHCP Pools' })}
          children={<DHCPPoolTable dhcpMode={type}
            isDefaultService={isDefaultService}/>}
        />
      </Col>
    </Row>
  </>)
}

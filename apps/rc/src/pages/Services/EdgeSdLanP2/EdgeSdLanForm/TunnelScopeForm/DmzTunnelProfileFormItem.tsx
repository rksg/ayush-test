import { Col, Form, Row, Select } from 'antd'
import { useIntl }                from 'react-intl'

import { Tooltip }                                            from '@acx-ui/components'
import { TunnelProfileAddModal }                              from '@acx-ui/rc/components'
import { MtuTypeEnum, TunnelProfileFormType, TunnelTypeEnum } from '@acx-ui/rc/utils'

import { messageMappings } from '../messageMappings'

interface DmzTunnelProfileFormItemProps {
  options: { label: string, value: string }[]
  isLoading: boolean
  onChange: (val: string) => void
}

export const DmzTunnelProfileFormItem = (props: DmzTunnelProfileFormItemProps) => {
  const { options, isLoading, onChange } = props
  const { $t } = useIntl()

  const formInitValues = {
    mtuType: MtuTypeEnum.MANUAL,
    type: TunnelTypeEnum.VLAN_VXLAN,
    disabledFields: ['mtuType', 'type']
  }

  return <Row align='middle' gutter={9}>
    <Col span={10}>
      <Form.Item
        name='guestTunnelProfileId'
        label={<>
          { $t({ defaultMessage: 'Tunnel Profile (Cluster- DMZ Cluster tunnel)' }) }
          <Tooltip.Question
            title={$t(messageMappings.scope_dmz_tunnel_tooltip)}
            placement='bottom'
          />
        </>}
        rules={[{
          required: true,
          // eslint-disable-next-line max-len
          message: $t({ defaultMessage: 'Please select tunnel profile (cluster- DMZ cluster tunnel)' })
        }]}
      >
        <Select
          loading={isLoading}
          options={options}
          placeholder={$t({ defaultMessage: 'Select ...' })}
          onChange={onChange}
        />
      </Form.Item>
    </Col>
    <Col span={3}>
      <TunnelProfileAddModal initialValues={formInitValues as TunnelProfileFormType} />
    </Col>
  </Row>
}
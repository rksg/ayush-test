import { Col, Form, Row, Select } from 'antd'
import { useIntl }                from 'react-intl'

import { Tooltip }                                                                       from '@acx-ui/components'
import { TunnelProfileAddModal }                                                         from '@acx-ui/rc/components'
import { MtuTypeEnum, NetworkSegmentTypeEnum, TunnelProfileFormType, TunnelProfileUrls } from '@acx-ui/rc/utils'
import { EdgeScopes, WifiScopes }                                                        from '@acx-ui/types'
import { hasPermission }                                                                 from '@acx-ui/user'
import { getOpsApi }                                                                     from '@acx-ui/utils'

import { messageMappings } from '../messageMappings'

import { TunnelProfileFormItemProps } from './TunnelProfileFormItem'

interface DmzTunnelProfileFormItemProps extends TunnelProfileFormItemProps {}

export const DmzTunnelProfileFormItem = (props: DmzTunnelProfileFormItemProps) => {
  const { options, isLoading, onChange, disabled = false, tooltip } = props
  const { $t } = useIntl()

  const formInitValues = {
    mtuType: MtuTypeEnum.MANUAL,
    type: NetworkSegmentTypeEnum.VLAN_VXLAN,
    disabledFields: ['mtuType', 'type', 'natTraversalEnabled']
  }

  const dropdownFormItem = <Form.Item
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
      disabled={disabled}
    />
  </Form.Item>

  return <Row align='middle' gutter={9}>
    <Col span={10}>
      {tooltip
        ? <Tooltip title={tooltip}> {dropdownFormItem} </Tooltip>
        : dropdownFormItem
      }
    </Col>
    {hasPermission({
      scopes: [WifiScopes.CREATE, EdgeScopes.CREATE],
      rbacOpsIds: [getOpsApi(TunnelProfileUrls.createTunnelProfile)]
    }) &&
      <Col span={3}>
        <TunnelProfileAddModal initialValues={formInitValues as TunnelProfileFormType} />
      </Col>
    }
  </Row>
}
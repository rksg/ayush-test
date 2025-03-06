import { Col, Form, Row, Select, Tooltip } from 'antd'
import { useIntl }                         from 'react-intl'

import { TunnelProfileAddModal }                                    from '@acx-ui/rc/components'
import { TunnelProfileFormType, TunnelProfileUrls, TunnelTypeEnum } from '@acx-ui/rc/utils'
import { EdgeScopes, WifiScopes }                                   from '@acx-ui/types'
import { hasPermission }                                            from '@acx-ui/user'
import { getOpsApi }                                                from '@acx-ui/utils'

export interface TunnelProfileFormItemProps {
  options: { label: string, value: string }[]
  isLoading: boolean
  onChange: (val: string) => void
  disabled?: boolean
  tooltip?: string
}

export const TunnelProfileFormItem = (props: TunnelProfileFormItemProps) => {
  const { options, isLoading, onChange, disabled = false, tooltip } = props
  const { $t } = useIntl()

  const formInitValues = {
    type: TunnelTypeEnum.VLAN_VXLAN,
    disabledFields: ['type']
  }

  const dropdownFormItem = <Form.Item
    name='tunnelProfileId'
    label={$t({ defaultMessage: 'Tunnel Profile (AP- Cluster tunnel)' })}
    rules={[{
      required: true
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
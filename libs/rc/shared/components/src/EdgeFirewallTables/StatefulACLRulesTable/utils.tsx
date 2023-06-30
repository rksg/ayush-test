import { Row, Typography } from 'antd'

import { StatefulAclRule, AddressType, ACLDirection } from '@acx-ui/rc/utils'
import { getIntl }                                    from '@acx-ui/utils'

export const getRuleSrcDstString = (rowData: StatefulAclRule, isSource: boolean) => {
  const intl = getIntl()
  const { $t } = intl
  const type = rowData[isSource ? 'sourceAddressType' : 'destinationAddressType']

  switch(type) {
    case AddressType.ANY_IP_ADDRESS:
      return $t({ defaultMessage: 'Any' })

    case AddressType.IP_ADDRESS:
      return $t({ defaultMessage: '{ip}' },
        { ip: rowData[isSource ? 'sourceAddress' : 'destinationAddress'] })

    case AddressType.SUBNET_ADDRESS:
      return <>
        <Row>
          <Typography.Text>
            {$t({ defaultMessage: 'Subnet: {subnet}' },
              { subnet: rowData[isSource ? 'sourceAddress' : 'destinationAddress'] })}
          </Typography.Text>
        </Row>
        <Row>
          <Typography.Text>
            {$t({ defaultMessage: 'Mask: {mask}' },
              { mask: rowData[isSource ? 'sourceAddressMask' : 'destinationAddressMask'] })}
          </Typography.Text>
        </Row>
      </>
    default:
      return ''
  }
}

export const isStatefulACLDefaultRule =
  (direction: ACLDirection, rule: StatefulAclRule, allRules: StatefulAclRule[]) => {
    const rulesAmount = allRules.length

    // inbound: last rule is the default rule
    // outbound: default rules are No.1 - No.3 and the last one.
    if (rule.priority === rulesAmount) {
      return true
    } else {
      return direction === ACLDirection.INBOUND ? false : Number(rule.priority) <= 3
    }
  }
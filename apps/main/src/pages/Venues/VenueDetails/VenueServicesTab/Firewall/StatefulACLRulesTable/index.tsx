import _ from 'lodash'

import { StatefulACLRulesTable as DefaultStatefulACLRulesTable } from '@acx-ui/rc/components'
import {
  ACLDirection,
  EdgeFirewallSetting } from '@acx-ui/rc/utils'

interface StatefulACLRulesTableProps {
  firewallData: EdgeFirewallSetting | undefined;
  direction: ACLDirection;
}

export const StatefulACLRulesTable = (props: StatefulACLRulesTableProps) => {
  const { firewallData, direction } = props
  const acls = firewallData?.statefulAcls

  // TODO: query statistic data and aggregate with rules.

  const aclRules = _.find(acls, { direction })?.rules

  return (
    <DefaultStatefulACLRulesTable
      dataSource={aclRules}
      pagination={{
        pageSize: 5,
        defaultPageSize: 5
      }}
    />
  )
}
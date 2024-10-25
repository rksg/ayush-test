import { useIntl } from 'react-intl'

import { SummaryCard, Tooltip }                                                         from '@acx-ui/components'
import { MdnsProxyFeatureTypeEnum, NewMdnsProxyForwardingRule, transformDisplayNumber } from '@acx-ui/rc/utils'

import { MdnsProxyForwardingRulesTable } from '../MdnsProxyForwardingRulesTable'

export interface MdnsProxyServiceInfoProps {
  rules: NewMdnsProxyForwardingRule[] | undefined
}

export function MdnsProxyServiceInfo (props: MdnsProxyServiceInfoProps) {
  const { $t } = useIntl()
  const { rules } = props

  const mdnsProxyInfo = [
    {
      title: $t({ defaultMessage: 'Forwarding Rules' }),
      content: rules?.length
        ? <Tooltip
          title={<MdnsProxyForwardingRulesTable
            featureType={MdnsProxyFeatureTypeEnum.WIFI}
            rowKey='ruleIndex'
            readonly
            tableType='compactBordered'
            rules={rules}
          />}
          children={transformDisplayNumber(rules?.length)}
          dottedUnderline
          placement='bottom'
          // overlayClassName={UI.toolTipClassName}
          overlayInnerStyle={{ minWidth: 380 }}
        />
        : 0

    }
  ]

  return <SummaryCard data={mdnsProxyInfo} />
}

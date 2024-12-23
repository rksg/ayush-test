import { useIntl } from 'react-intl'

import { Card, NoGranularityText } from '@acx-ui/components'
import {
  Switch,
  VLANIcon
} from '@acx-ui/icons'

import * as UI from './styledComponents'

interface DetailsCardProps {
  druidRolledup: boolean;
  isImpactedSwitches: boolean;
  impactedTypes: ImpactedType[];
}

interface ImpactedType {
  icon: string;
  max: number;
  count: number;
  data: {
      name: string;
      title: string;
  }[];
  title: string;
  details: string;
}

const DetailsCard = ({
  druidRolledup,
  isImpactedSwitches,
  impactedTypes
}: DetailsCardProps) => {
  const { $t } = useIntl()
  return (
    <Card title={$t({ defaultMessage: 'Details' })} type='no-border'>
      {druidRolledup ? (
        <NoGranularityText />
      ) : (
        <UI.SummaryWrapper>
          {isImpactedSwitches &&
              impactedTypes.map((type, index) => {
                const data = type.data.slice(0, type.max)
                const remaining = type.data.length - data?.length
                return (
                  <UI.SummaryType key={index}>
                    <UI.Summary>
                      <UI.SummaryCount>{type.count}</UI.SummaryCount>
                      <UI.SummaryTitle>{type.title}</UI.SummaryTitle>
                      <UI.SummaryDetails>{type.details}</UI.SummaryDetails>
                    </UI.Summary>
                    <UI.SummaryList>
                      {data.map((d, i) => (
                        <div key={i} title={d.title}>
                          {type.icon === 'vlan' ? <VLANIcon /> : <Switch />}
                          <span>{d.name}</span>
                        </div>
                      ))}
                      {remaining > 0 && (
                        <span>
                          {$t({ defaultMessage: 'and {remaining} more…' }, { remaining })}
                        </span>
                      )}
                    </UI.SummaryList>
                  </UI.SummaryType>
                )
              })}
        </UI.SummaryWrapper>
      )}
    </Card>
  )
}

export default DetailsCard
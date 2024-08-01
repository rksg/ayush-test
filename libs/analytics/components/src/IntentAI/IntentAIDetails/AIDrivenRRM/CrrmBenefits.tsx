import { useIntl } from 'react-intl'

import { TrendTypeEnum }          from '@acx-ui/analytics/utils'
import { Card, GridCol, GridRow } from '@acx-ui/components'

import { kpis }                              from '../../IntentAIForm/AIDrivenRRM'
import { EnhancedIntent, getGraphKPIs }      from '../../IntentAIForm/services'
import { dataRetentionText, isDataRetained } from '../../utils'
import {
  BenefitsBody,
  BenefitsHeader,
  BenefitsValue,
  DetailsHeader,
  DetailsWrapper,
  TrendPill
} from '../styledComponents'

export const CrrmBenefits = ({ details }: { details: EnhancedIntent }) => {
  const { $t } = useIntl()


  return <>
    <DetailsHeader>{$t({ defaultMessage: 'Benefits' })}</DetailsHeader>
    {isDataRetained(details.dataEndTime)
      ? <DetailsWrapper>
        <GridRow>
          {getGraphKPIs(details, kpis).map(kpi => (
            <GridCol key={kpi.key} col={{ span: 12 }}>
              <Card type='default'>
                <BenefitsHeader>{$t(kpi.label)}</BenefitsHeader>
                <BenefitsBody>
                  <BenefitsValue>{kpi.after}</BenefitsValue>
                  <TrendPill
                    value={kpi.delta.value}
                    trend={kpi.delta.trend as TrendTypeEnum} />
                </BenefitsBody>
              </Card>
            </GridCol>
          ))}
        </GridRow>
      </DetailsWrapper>
      : $t(dataRetentionText)
    }
  </>
}

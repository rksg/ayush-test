import { useIntl } from 'react-intl'

import { GridCol, GridRow } from '@acx-ui/components'

import { DetailsSection }                    from '../../common/DetailsSection'
import { KpiCard }                           from '../../common/KpiCard'
import { getGraphKPIs }                      from '../../IntentAIForm/services'
import { useIntentContext }                  from '../../IntentContext'
import { dataRetentionText, isDataRetained } from '../../utils'

export const CrrmBenefits = () => {
  const { $t } = useIntl()
  const { intent, kpis } = useIntentContext()

  const children = isDataRetained(intent.dataEndTime)
    ? <GridRow>
      {getGraphKPIs(intent, kpis).map(kpi => (
        <GridCol key={kpi.key} col={{ span: 12 }}>
          <KpiCard kpi={kpi} />
        </GridCol>
      ))}
    </GridRow>
    : $t(dataRetentionText)

  return <DetailsSection
    title={$t({ defaultMessage: 'Benefits' })}
    children={children}
  />
}

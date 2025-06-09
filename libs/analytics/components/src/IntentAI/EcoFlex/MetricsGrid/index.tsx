import { useIntl } from 'react-intl'

import { Card, GridCol, GridRow, Loader, Tooltip } from '@acx-ui/components'

import { DetailsSection }                                  from '../../common/DetailsSection'
import * as UI                                             from '../../common/KPIs/styledComponents'
import { MetricsConfig, getKPIConfigsData, KPICardConfig } from '../common'
import { useIntentAIEcoFlexQuery }                         from '../services'

export const MetricsGrid: React.FC<{
  kpiQuery: ReturnType<typeof useIntentAIEcoFlexQuery>
}> = ({ kpiQuery }) => {
  const { $t } = useIntl()
  const current = kpiQuery?.data?.data?.data
  const { disabled, enabled, unsupported } = current ?? {}
  const isShowGrid = !!kpiQuery.data && !!disabled && !!enabled && !!unsupported
  if (!isShowGrid) return null

  const values:KPICardConfig[] = getKPIConfigsData(MetricsConfig, current ?? {},{})

  return (
    <DetailsSection data-testid='Metrics'>
      <DetailsSection.Title children={$t({ defaultMessage: 'Metrics' })} />
      <Loader states={[kpiQuery]}>
        <GridRow>
          {values.map(({ key, label, values,
            valueMessage, tooltip
          }) => (
            <Tooltip
              placement='top'
              title={tooltip && $t(tooltip)}
              key={`tooltip-${key}`}
            >
              <GridCol key={key} col={{ span: 8 }}>
                <Card>
                  <UI.Title>{$t(label)}</UI.Title>
                  <UI.Statistic
                    value={valueMessage && $t(valueMessage, values)}
                  />
                </Card>
              </GridCol>
            </Tooltip>
          ))}

        </GridRow>
      </Loader>
    </DetailsSection>
  )
}

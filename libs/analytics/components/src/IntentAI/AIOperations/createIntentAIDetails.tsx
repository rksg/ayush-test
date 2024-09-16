import { Typography }       from 'antd'
import { TooltipPlacement } from 'antd/es/tooltip'
import moment               from 'moment-timezone'
import { useIntl }          from 'react-intl'

import { formattedPath }             from '@acx-ui/analytics/utils'
import { Card, GridCol, GridRow }    from '@acx-ui/components'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'

import { DescriptionSection }  from '../../DescriptionSection'
import { FixedAutoSizer }      from '../../DescriptionSection/styledComponents'
import { DetailsSection }      from '../common/DetailsSection'
import { getIntentStatus }     from '../common/getIntentStatus'
import { IntentDetailsHeader } from '../common/IntentDetailsHeader'
import { IntentIcon }          from '../common/IntentIcon'
import { KpiCard }             from '../common/KpiCard'
import { StatusTrail }         from '../common/StatusTrail'
import { codes }               from '../config'
import { useIntentContext }    from '../IntentContext'
import { getStatusTooltip }    from '../services'
import { getGraphKPIs }        from '../useIntentDetailsQuery'

import { ConfigurationCard }   from './ConfigurationCard'
import { createUseValuesText } from './createUseValuesText'
import { ImpactedAPCount }     from './ImpactedAPCount'

export function createIntentAIDetails (
  useValuesText: ReturnType<typeof createUseValuesText>,
  options: { showImpactedAPs?: boolean } = {}
) {
  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent, kpis } = useIntentContext()
    const valuesText = useValuesText()
    const { code, path, sliceValue, metadata, updatedAt, displayStatus } = intent

    const fields = [
      {
        label: $t({ defaultMessage: 'Intent' }),
        children: $t(codes[code].intent)
      },
      {
        label: $t({ defaultMessage: 'Category' }),
        children: $t(codes[code].category)
      },
      {
        label: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
        children: sliceValue,
        tooltip: formattedPath(path, sliceValue),
        tooltipPlacement: 'right' as TooltipPlacement
      },
      {
        label: $t({ defaultMessage: 'Status' }),
        children: getIntentStatus(displayStatus),
        tooltip: getStatusTooltip(displayStatus, sliceValue, { ...metadata, updatedAt }),
        tooltipPlacement: 'right' as TooltipPlacement
      },
      {
        label: $t({ defaultMessage: 'Date' }),
        children: formatter(DateFormatEnum.DateTimeFormat)(moment(updatedAt))
      },
      ...options.showImpactedAPs
        ? [ { label: $t({ defaultMessage: 'AP Impact Count' }), children: <ImpactedAPCount /> } ]
        : []
    ]

    return <>
      <IntentDetailsHeader />
      <GridRow>
        <GridCol col={{ span: 6, xxl: 4 }}>
          <FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IntentIcon size='large' />
              <Typography.Paragraph children={valuesText.summary} />
              <DescriptionSection fields={fields}/>
            </div>)}
          </FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 18, xxl: 20 }}>
          <DetailsSection data-testid='Details'>
            <DetailsSection.Title children={$t({ defaultMessage: 'Details' })} />
            <DetailsSection.Details>
              <GridRow>
                <GridCol data-testid='Configuration' col={{ span: 12 }}>
                  <ConfigurationCard />
                </GridCol>
                {getGraphKPIs(intent, kpis).map(kpi => (
                  <GridCol data-testid='KPI' key={kpi.key} col={{ span: 12 }}>
                    <KpiCard kpi={kpi} />
                  </GridCol>
                ))}
              </GridRow>
            </DetailsSection.Details>
          </DetailsSection>

          <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Why is the recommendation?'>
                <DetailsSection.Title
                  children={$t({ defaultMessage: 'Why is the recommendation?' })} />
                <DetailsSection.Details children={<Card>{valuesText.reasonText}</Card>} />
              </DetailsSection>
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Potential trade-off'>
                <DetailsSection.Title children={$t({ defaultMessage: 'Potential trade-off' })} />
                <DetailsSection.Details children={<Card>{valuesText.tradeoffText}</Card>} />
              </DetailsSection>
            </GridCol>
          </GridRow>

          <DetailsSection data-testid='Status Trail'>
            <DetailsSection.Title children={$t({ defaultMessage: 'Status Trail' })} />
            <DetailsSection.Details children={<StatusTrail />} />
          </DetailsSection>
        </GridCol>
      </GridRow>
    </>
  }
}

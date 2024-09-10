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
    const { intent, kpis, configuration } = useIntentContext()
    const valuesText = useValuesText()

    const fields = [
      {
        label: $t({ defaultMessage: 'Intent' }),
        children: $t(codes[intent.code].intent)
      },
      {
        label: $t({ defaultMessage: 'Category' }),
        children: $t(codes[intent.code].category)
      },
      {
        label: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
        children: intent.sliceValue,
        tooltip: formattedPath(intent.path, intent.sliceValue)
      },
      {
        label: $t({ defaultMessage: 'Status' }),
        children: getIntentStatus(intent.displayStatus),
        tooltip: getIntentStatus(intent.displayStatus, true),
        tooltipPlacement: 'right' as TooltipPlacement
      },
      {
        label: $t({ defaultMessage: 'Date' }),
        children: formatter(DateFormatEnum.DateTimeFormat)(moment(intent.updatedAt))
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
          <DetailsSection
            checkDataRetention
            data-testid='Details'
            title={$t({ defaultMessage: 'Details' })}
            children={<GridRow>
              {[
                <GridCol data-testid='Configuration' key='value' col={{ span: 12 }}>
                  <ConfigurationCard configuration={configuration!} intent={intent}/>
                </GridCol>,
                ...getGraphKPIs(intent, kpis).map(kpi => (
                  <GridCol data-testid='KPI' key={kpi.key} col={{ span: 12 }}>
                    <KpiCard kpi={kpi} />
                  </GridCol>
                ))]}
            </GridRow>}
          />

          <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection
                data-testid='Why the intent?'
                title={$t({ defaultMessage: 'Why the intent?' })}
                children={<Card>{valuesText.reasonText}</Card>}
              />
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <DetailsSection
                data-testid='Potential trade-off'
                title={$t({ defaultMessage: 'Potential trade-off' })}
                children={<Card>{valuesText.tradeoffText}</Card>}
              />
            </GridCol>
          </GridRow>

          <DetailsSection
            data-testid='Status Trail'
            title={$t({ defaultMessage: 'Status Trail' })}
            children={<StatusTrail />}
          />
        </GridCol>
      </GridRow>
    </>
  }
}
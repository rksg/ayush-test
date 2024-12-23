import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { Card, GridCol, GridRow } from '@acx-ui/components'

import { DescriptionSection }   from '../../DescriptionSection'
import { FixedAutoSizer }       from '../../DescriptionSection/styledComponents'
import { useCommonFields }      from '../common/commonFields'
import { DetailsSection }       from '../common/DetailsSection'
import { IntentDetailsHeader }  from '../common/IntentDetailsHeader'
import { IntentDetailsSidebar } from '../common/IntentDetailsSidebar'
import { IntentIcon }           from '../common/IntentIcon'
import { KpiCard }              from '../common/KpiCard'
import { StatusTrail }          from '../common/StatusTrail'
import { useIntentContext }     from '../IntentContext'
import { getStatusTooltip }     from '../services'
import { getGraphKPIs }         from '../useIntentDetailsQuery'

import { ConfigurationCard }   from './ConfigurationCard'
import { createUseValuesText } from './createUseValuesText'
import { ImpactedAPCount }     from './ImpactedAPCount'

export function createIntentAIDetails (
  useValuesText: ReturnType<typeof createUseValuesText>,
  options: { showImpactedAPs?: boolean } = {}
) {
  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent, kpis, state, isDataRetained, isHotTierData } = useIntentContext()
    const { displayStatus, sliceValue, metadata, updatedAt } = intent
    const valuesText = useValuesText()
    const fields = [
      ...useCommonFields(intent),
      ...options.showImpactedAPs
        ? [ { label: $t({ defaultMessage: 'AP Impact Count' }), children: <ImpactedAPCount /> } ]
        : []
    ]

    return <>
      <IntentDetailsHeader />
      <GridRow>
        <GridCol col={{ span: 6, xxl: 4 }}>
          <FixedAutoSizer>
            {({ width }) => (<IntentDetailsSidebar style={{ width }}>
              <IntentIcon size='large' />
              <Typography.Paragraph children={valuesText.summary} />
              <DescriptionSection fields={fields}/>
            </IntentDetailsSidebar>)}
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
                {state !== 'no-data' && getGraphKPIs(
                  intent, kpis, isDataRetained, isHotTierData).map(kpi => (
                  <GridCol data-testid='KPI' key={kpi.key} col={{ span: 12 }}>
                    <KpiCard kpi={kpi} />
                  </GridCol>
                ))}
              </GridRow>
            </DetailsSection.Details>
          </DetailsSection>

          {state !== 'no-data' ? <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Benefits'>
                <DetailsSection.Title
                  children={$t({ defaultMessage: 'Benefits' })} />
                <DetailsSection.Details children={<Card>{valuesText.reasonText}</Card>} />
              </DetailsSection>
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Potential Trade-off'>
                <DetailsSection.Title children={$t({ defaultMessage: 'Potential Trade-off' })} />
                <DetailsSection.Details children={<Card>{valuesText.tradeoffText}</Card>} />
              </DetailsSection>
            </GridCol>
          </GridRow> : <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Current Status'>
                <DetailsSection.Title children={$t({ defaultMessage: 'Current Status' })} />
                <DetailsSection.Details
                  children={<Card>{getStatusTooltip(
                    displayStatus, sliceValue, { ...metadata, updatedAt })}</Card>}
                />
              </DetailsSection>
            </GridCol>
          </GridRow>}

          <DetailsSection data-testid='Status Trail'>
            <DetailsSection.Title children={$t({ defaultMessage: 'Status Trail' })} />
            <DetailsSection.Details children={<StatusTrail />} />
          </DetailsSection>
        </GridCol>
      </GridRow>
    </>
  }
}

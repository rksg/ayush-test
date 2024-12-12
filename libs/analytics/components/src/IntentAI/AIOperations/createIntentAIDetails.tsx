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
import { KPIGrid }              from '../common/KPIs'
import { StatusTrail }          from '../common/StatusTrail'
import { useIntentContext }     from '../IntentContext'

import { ConfigurationCard }   from './ConfigurationCard'
import { createUseValuesText } from './createUseValuesText'
import { ImpactedAPCount }     from './ImpactedAPCount'

export function createIntentAIDetails (
  useValuesText: ReturnType<typeof createUseValuesText>,
  options: { showImpactedAPs?: boolean } = {}
) {
  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent } = useIntentContext()
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
                <KPIGrid/>
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

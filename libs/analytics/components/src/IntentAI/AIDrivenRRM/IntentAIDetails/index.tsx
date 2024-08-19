import { useState } from 'react'

import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader, PageHeader } from '@acx-ui/components'

import { FixedAutoSizer }                        from '../../../DescriptionSection/styledComponents'
import { AIDrivenRRMHeader, AIDrivenRRMIcon }    from '../../IntentAIDetails/styledComponents'
import { SummaryGraphAfter, SummaryGraphBefore } from '../RRMGraph'
import { useIntentAICRRMQuery }                  from '../RRMGraph/services'

import { CrrmBenefits }    from './CrrmBenefits'
import { CrrmGraph }       from './CrrmGraph'
import { CrrmValuesExtra } from './CrrmValuesExtra'
import { Overview }        from './Overview'
import { StatusTrail }     from './StatusTrail'

export const IntentAIDetails = () => {
  const { $t } = useIntl()
  const [summaryUrlBefore, setSummaryUrlBefore] = useState<string>('')
  const [summaryUrlAfter, setSummaryUrlAfter] = useState<string>('')

  // TODO: refactor: move query into IntentAIRRMGraph?
  const queryResult = useIntentAICRRMQuery()
  const crrmData = queryResult.data!

  return <Loader states={[queryResult]}>
    {<PageHeader
      title={$t({ defaultMessage: 'Intent Details' })}
      breadcrumb={[
        { text: $t({ defaultMessage: 'AI Assurance' }) },
        { text: $t({ defaultMessage: 'AI Analytics' }) },
        { text: $t({ defaultMessage: 'Intent AI' }),
          link: 'analytics/intentAI' }
      ]}
      // extra={hasPermission({ permission: 'WRITE_AI_DRIVEN_RRM', scopes: [WifiScopes.UPDATE] })
      //   ? [] // TODO: Action buttom
      //   : []
      // }
    />}
    <GridRow>
      <GridCol col={{ span: 6, xxl: 4 }}>
        <FixedAutoSizer>
          {({ width }) => (<div style={{ width }}>
            <GridRow>
              <AIDrivenRRMHeader>
                <AIDrivenRRMIcon />
                {$t({ defaultMessage: 'AI-Driven RRM' })}
              </AIDrivenRRMHeader>
            </GridRow>
            <GridRow>
              <GridCol col={{ span: 24 }}>
                <Overview />
              </GridCol>
            </GridRow>
          </div>)}
        </FixedAutoSizer>
      </GridCol>
      <div hidden>
        <SummaryGraphBefore
          crrmData={crrmData}
          setUrl={setSummaryUrlBefore}
          detailsPage={true}
        />
        <SummaryGraphAfter
          crrmData={crrmData}
          setUrl={setSummaryUrlAfter}
          detailsPage={true}
        />
      </div>
      <GridCol col={{ span: 18, xxl: 20 }}>
        <CrrmBenefits />
        <CrrmGraph
          summaryUrlBefore={summaryUrlBefore}
          summaryUrlAfter={summaryUrlAfter}
          crrmData={crrmData}
        />
        <CrrmValuesExtra />
        <StatusTrail />
      </GridCol>
    </GridRow>
  </Loader>
}

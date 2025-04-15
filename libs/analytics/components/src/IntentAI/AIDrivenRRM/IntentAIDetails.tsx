/* eslint-disable max-len */
import { Typography }                               from 'antd'
import _                                            from 'lodash'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Card, GridCol, GridRow, Tabs } from '@acx-ui/components'
import { getIntl }                      from '@acx-ui/utils'

import { DescriptionSection }   from '../../DescriptionSection'
import { FixedAutoSizer }       from '../../DescriptionSection/styledComponents'
import { useCommonFields }      from '../common/commonFields'
import { DetailsSection }       from '../common/DetailsSection'
import { IntentDetailsHeader }  from '../common/IntentDetailsHeader'
import { IntentDetailsSidebar } from '../common/IntentDetailsSidebar'
import { IntentIcon }           from '../common/IntentIcon'
import { KPIGrid }              from '../common/KPIs'
import { richTextFormatValues } from '../common/richTextFormatValues'
import { StatusTrail }          from '../common/StatusTrail'
import { useIntentContext }     from '../IntentContext'
import { getStatusTooltip }     from '../services'
import { getKPIData }           from '../useIntentDetailsQuery'

import { IntentAIRRMGraph }      from './RRMGraph'
import { DownloadRRMComparison } from './RRMGraph/DownloadRRMComparison'

export function createUseValuesText () {
  return function useValuesText () {
    const { $t } = getIntl()
    const { intent, kpis, state } = useIntentContext()
    const isFullOptimization = intent.metadata.preferences?.crrmFullOptimization ?? true

    const kpi = kpis.find(kpi => kpi.key === 'number-of-interfering-links')!
    const { data, compareData } = getKPIData(intent, kpi)

    const action = {
      full: defineMessage({ defaultMessage: `
        <p>Leverage <b><i>AI-Driven RRM Full Optimization</i></b> mode to assess the neighbor AP radio channels for each AP radio and build a channel plan for each radio to minimize the interference.</p>
        <p>In this mode, while building the channel plan, IntentAI may optionally change the <i>AP Radio Channel Width</i> and <i>Transmit Power</i> to minimize the channel interference.</p>
        <p>IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.</p>
      ` }),
      partial: defineMessage({ defaultMessage: `
        <p>Leverage <b><i>AI-Driven RRM Partial Optimization</i></b> mode to assess the neighbor AP channels for each AP radio and build a channel plan for each AP radio to minimize interference.</p>
        <p>In this mode, while building the channel plan, IntentAI <b>will NOT</b> change the <i>AP Radio Channel Width</i> and <i>Transmit Power</i>.</p>
        <p>IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.</p>
      ` })
    }
    const noData = defineMessage({ defaultMessage: 'When activated, this Intent takes over the automatic channel planning in the network.' })

    const summaryText = state === 'no-data'
      ? noData
      : isFullOptimization ? action.full : action.partial


    const benefitText = defineMessage({ defaultMessage: `Low interference fosters improved
      throughput, lower latency, better signal quality, stable connections, enhanced user
      experience, longer battery life, efficient spectrum utilization, optimized channel usage,
      and reduced congestion, leading to higher data rates, higher SNR, consistent performance,
      and balanced network load.` })

    const tradeoffText = defineMessage({ defaultMessage: `In the quest for minimizing interference
      between access points (APs), AI algorithms may opt to narrow channel widths. While this can
      enhance spectral efficiency and alleviate congestion, it also heightens vulnerability to
      noise, potentially reducing throughput. Narrow channels limit data capacity, which could
      lower overall throughput.` })

    return {
      summaryText: summaryText,
      benefitText: $t(benefitText, { before: kpi.format(compareData), after: kpi.format(data) }),
      tradeoffText: $t(tradeoffText)
    }
  }
}

export function IntentAIDetails () {
  const { $t } = useIntl()
  const { intent, state, isDataRetained, isHotTierData } = useIntentContext()
  const useValuesText = createUseValuesText()
  const valuesText = useValuesText()
  const { displayStatus, sliceValue, metadata, updatedAt } = intent

  const fields = useCommonFields(intent)
  const noData = state === 'no-data'
  const isFullOptimization = _.get(intent, ['metadata', 'preferences', 'crrmFullOptimization'])

  return <>
    <IntentDetailsHeader />
    <GridRow>
      <GridCol col={{ span: 6, xxl: 4 }}>
        <FixedAutoSizer>
          {({ width }) => (<IntentDetailsSidebar style={{ width }}>
            <IntentIcon size='large' />
            <Typography.Paragraph
              children={<FormattedMessage {...valuesText.summaryText} values={richTextFormatValues} />}/>
            <DescriptionSection fields={fields}/>
            <br />
            {!noData && isDataRetained && isHotTierData
              ? <DownloadRRMComparison title={$t({ defaultMessage: 'RRM comparison' })} />
              : null}
          </IntentDetailsSidebar>)}
        </FixedAutoSizer>
      </GridCol>
      <GridCol col={{ span: 18, xxl: 20 }}>
        {!noData ? <>
          <DetailsSection data-testid='Details'>
            <DetailsSection.Title children={$t({ defaultMessage: 'Details' })} />
            <GridRow>
              <KPIGrid />
              <GridCol col={{ span: 24 }}>
                <Tabs stickyTop={false}>
                  <Tabs.TabPane tab='Interfering Links' key='interfering-links'>
                    <IntentAIRRMGraph width={350} isFullOptimization={isFullOptimization} />
                  </Tabs.TabPane>
                </Tabs>
              </GridCol>
            </GridRow>
          </DetailsSection>

          <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Benefits'>
                <DetailsSection.Title children={$t({ defaultMessage: 'Benefits' })} />
                <DetailsSection.Details children={<Card>{valuesText.benefitText}</Card>} />
              </DetailsSection>
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Potential Trade-off'>
                <DetailsSection.Title children={$t({ defaultMessage: 'Potential Trade-off' })} />
                <DetailsSection.Details children={<Card>{valuesText.tradeoffText}</Card>} />
              </DetailsSection>
            </GridCol>
          </GridRow>
        </> : <GridRow>
          <GridCol col={{ span: 12 }}>
            <DetailsSection data-testid='Current Status'>
              <DetailsSection.Title children={$t({ defaultMessage: 'Current Status' })} />
              <DetailsSection.Details children={
                <Card>
                  {getStatusTooltip(
                    displayStatus, sliceValue, { ...metadata, updatedAt })}
                </Card>} />
            </DetailsSection>
          </GridCol>
        </GridRow>}

        <StatusTrail />
      </GridCol>
    </GridRow>
  </>
}

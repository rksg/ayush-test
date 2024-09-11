/* eslint-disable max-len */
import { useState } from 'react'

import { Typography }                               from 'antd'
import moment                                       from 'moment-timezone'
import { defineMessage, FormattedMessage, useIntl } from 'react-intl'

import { Card, Descriptions, GridCol, GridRow, Loader } from '@acx-ui/components'
import { DateFormatEnum, formatter }                    from '@acx-ui/formatter'
import { getIntl }                                      from '@acx-ui/utils'

import { FixedAutoSizer }           from '../../DescriptionSection/styledComponents'
import { DetailsSection }           from '../common/DetailsSection'
import { getIntentStatus }          from '../common/getIntentStatus'
import { IntentDetailsHeader }      from '../common/IntentDetailsHeader'
import { IntentIcon }               from '../common/IntentIcon'
import { KpiCard }                  from '../common/KpiCard'
import { richTextFormatValues }     from '../common/richTextFormatValues'
import { StatusTrail }              from '../common/StatusTrail'
import { codes }                    from '../config'
import { useIntentContext }         from '../IntentContext'
import { getGraphKPIs, getKPIData } from '../useIntentDetailsQuery'

import { IntentAIRRMGraph, SummaryGraphAfter, SummaryGraphBefore } from './RRMGraph'
import { DownloadRRMComparison }                                   from './RRMGraph/DownloadRRMComparison'
import { useIntentAICRRMQuery }                                    from './RRMGraph/services'

export function createUseValuesText () {
  return function useValuesText () {
    const { $t } = getIntl()
    const { intent, kpis } = useIntentContext()
    const isFullOptimization = intent.preferences?.crrmFullOptimization

    const kpi = kpis.find(kpi => kpi.key === 'number-of-interfering-links')!
    const { data, compareData } = getKPIData(intent, kpi)

    const summaryText = isFullOptimization
      ? defineMessage({ defaultMessage: `
        <p>This Intent is active, with following priority:</p>
        <p><b>High number of clients in a dense network:</b></p>
        <p>Leverage <b><i>AI-Driven RRM Full Optimization</i></b> mode to assess the neighbor AP radio channels for each AP radio and build a channel plan for each radio to minimize the interference.</p>
        <p>In this mode, while building the channel plan, IntentAI may optionally change the <i>AP Radio Channel Width</i> and <i>Transmit Power</i> to minimize the channel interference.</p>
        <p>IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.</p>
      ` })
      : defineMessage({ defaultMessage: `
        <p>This Intent is active, with following priority:</p>
        <p><b>High client throughput in sparse network:</b></p>
        <p>Leverage <b><i>AI-Driven RRM Partial Optimization</i></b> mode to assess the neighbor AP channels for each AP radio and build a channel plan for each AP radio to minimize interference.</p>
        <p>In this mode, while building the channel plan, IntentAI <b>will NOT</b> change the <i>AP Radio Channel Width</i> and <i>Transmit Power</i>.</p>
        <p>IntentAI ensures that only the existing channels configured for this network are utilized in the channel planning process.</p>
      ` })
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

export function createIntentAIDetails () {
  const useValuesText = createUseValuesText()

  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent, kpis, isDataRetained: hasData } = useIntentContext()
    const valuesText = useValuesText()

    const [summaryUrlBefore, setSummaryUrlBefore] = useState<string>('')
    const [summaryUrlAfter, setSummaryUrlAfter] = useState<string>('')

    const queryResult = useIntentAICRRMQuery()
    const crrmData = queryResult.data!

    return <Loader states={[queryResult]}>
      <div hidden>
        <SummaryGraphBefore detailsPage crrmData={crrmData} setUrl={setSummaryUrlBefore} />
        <SummaryGraphAfter detailsPage crrmData={crrmData} setUrl={setSummaryUrlAfter} />
      </div>
      <IntentDetailsHeader />
      <GridRow>
        <GridCol col={{ span: 6, xxl: 4 }}>
          <FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IntentIcon size='large' />
              <Typography.Paragraph
                children={<FormattedMessage {...valuesText.summaryText} values={richTextFormatValues} />}/>
              <Descriptions noSpace>
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Intent' })}
                  children={$t(codes[intent.code].intent)}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Category' })}
                  children={$t(codes[intent.code].category)}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
                  children={intent.sliceValue}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Status' })}
                  children={getIntentStatus(intent.displayStatus)}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Date' })}
                  children={formatter(DateFormatEnum.DateTimeFormat)(moment(intent.updatedAt))}
                />
              </Descriptions>
              <br />
              {hasData
                ? <DownloadRRMComparison title={$t({ defaultMessage: 'RRM comparison' })} />
                : null}
            </div>)}
          </FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 18, xxl: 20 }}>
          <DetailsSection data-testid='Details'>
            <DetailsSection.Title children={$t({ defaultMessage: 'Details' })} />
            <GridRow>
              {getGraphKPIs(intent, kpis).map(kpi => (
                <GridCol data-testid='KPI' key={kpi.key} col={{ span: 12 }}>
                  <KpiCard kpi={kpi} />
                </GridCol>
              ))}
            </GridRow>
          </DetailsSection>

          <DetailsSection data-testid='Key Performance Indications'>
            <DetailsSection.Title
              children={$t({ defaultMessage: 'Key Performance Indications' })} />
            <IntentAIRRMGraph
              crrmData={crrmData}
              summaryUrlBefore={summaryUrlBefore}
              summaryUrlAfter={summaryUrlAfter}
            />
          </DetailsSection>

          <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Benefits'>
                <DetailsSection.Title children={$t({ defaultMessage: 'Benefits' })} />
                <Card>{valuesText.benefitText}</Card>
              </DetailsSection>
            </GridCol>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Potential trade-off'>
                <DetailsSection.Title children={$t({ defaultMessage: 'Potential trade-off' })} />
                <Card>{valuesText.tradeoffText}</Card>
              </DetailsSection>
            </GridCol>
          </GridRow>

          <DetailsSection data-testid='Status Trail'>
            <DetailsSection.Title children={$t({ defaultMessage: 'Status Trail' })} />
            <StatusTrail />
          </DetailsSection>
        </GridCol>
      </GridRow>
    </Loader>
  }
}

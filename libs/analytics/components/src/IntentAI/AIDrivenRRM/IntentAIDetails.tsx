import { useState } from 'react'

import { Typography }                                from 'antd'
import _                                             from 'lodash'
import moment                                        from 'moment-timezone'
import { defineMessage, MessageDescriptor, useIntl } from 'react-intl'

import { Card, Descriptions, GridCol, GridRow, Loader } from '@acx-ui/components'
import { DateFormatEnum, formatter }                    from '@acx-ui/formatter'
import { getIntl }                                      from '@acx-ui/utils'

import { FixedAutoSizer }           from '../../DescriptionSection/styledComponents'
import { DetailsSection }           from '../common/DetailsSection'
import { getIntentStatus }          from '../common/getIntentStatus'
import { IntentDetailsHeader }      from '../common/IntentDetailsHeader'
import { IntentIcon }               from '../common/IntentIcon'
import { KpiCard }                  from '../common/KpiCard'
import { StatusTrail }              from '../common/StatusTrail'
import { codes }                    from '../config'
import { useIntentContext }         from '../IntentContext'
import { getGraphKPIs, getKpiData } from '../useIntentDetailsQuery'

import { IntentAIRRMGraph, SummaryGraphAfter, SummaryGraphBefore } from './RRMGraph'
import { DownloadRRMComparison }                                   from './RRMGraph/DownloadRRMComparison'
import { useIntentAICRRMQuery }                                    from './RRMGraph/services'

export function createUseValuesText ({ tradeoff }: {
  tradeoff: {
    full: MessageDescriptor
    partial: MessageDescriptor
  }
}) {
  return function useValuesText () {
    const { $t } = getIntl()
    const { intent, kpis } = useIntentContext()
    const isFullOptimization = !!_.get(
      intent,
      'metadata.algorithmData.isCrrmFullOptimization',
      true
    )

    const kpi = kpis.find(kpi => kpi.key === 'number-of-interfering-links')!
    const { data, compareData } = getKpiData(intent, kpi)

    const benefitText = defineMessage({ defaultMessage: `Low interference fosters improved 
      throughput, lower latency, better signal quality, stable connections, enhanced user 
      experience, longer battery life, efficient spectrum utilization, optimized channel usage, 
      and reduced congestion, leading to higher data rates, higher SNR, consistent performance, 
      and balanced network load.` })

    const tradeoffText = isFullOptimization ? tradeoff.full : tradeoff.partial

    return {
      benefitText: $t(benefitText, { before: kpi.format(compareData), after: kpi.format(data) }),
      tradeoffText: $t(tradeoffText)
    }
  }
}

export function createIntentAIDetails (config: Parameters<typeof createUseValuesText>[0]) {
  const useValuesText = createUseValuesText(config)

  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent, kpis } = useIntentContext()
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
              <Typography.Paragraph children={$t({
                defaultMessage: 'Choose between a network with maximum throughput, ' +
                  'allowing some interference, or one with minimal interference, ' +
                  'for high client density.'
              })} />
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
              {/* TODO: question: handle data retention? */}
              <DownloadRRMComparison title={$t({ defaultMessage: 'RRM comparison' })} />
            </div>)}
          </FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 18, xxl: 20 }}>
          <DetailsSection
            checkDataRetention
            data-testid='Details'
            title={$t({ defaultMessage: 'Details' })}
            children={<GridRow>
              {getGraphKPIs(intent, kpis).map(kpi => (
                <GridCol data-testid='KPI' key={kpi.key} col={{ span: 12 }}>
                  <KpiCard kpi={kpi} />
                </GridCol>
              ))}
            </GridRow>}
          />

          <DetailsSection
            checkDataRetention
            data-testid='Key Performance Indications'
            title={$t({ defaultMessage: 'Key Performance Indications' })}
            children={<IntentAIRRMGraph
              details={intent}
              crrmData={crrmData}
              summaryUrlBefore={summaryUrlBefore}
              summaryUrlAfter={summaryUrlAfter}
            />}
          />

          <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection
                data-testid='Benefits'
                title={$t({ defaultMessage: 'Benefits' })}
                children={<Card>{valuesText.benefitText}</Card>}
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
    </Loader>
  }
}

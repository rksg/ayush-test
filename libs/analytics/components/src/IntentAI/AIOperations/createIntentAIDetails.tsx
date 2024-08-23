import { Typography }                                   from 'antd'
import moment                                           from 'moment-timezone'
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl'

import { incidentScope }                        from '@acx-ui/analytics/utils'
import { Card, Descriptions, GridCol, GridRow } from '@acx-ui/components'
import { DateFormatEnum, formatter }            from '@acx-ui/formatter'

import { FixedAutoSizer }       from '../../DescriptionSection/styledComponents'
import { DetailsSection }       from '../common/DetailsSection'
import { getIntentStatus }      from '../common/getIntentStatus'
import { IntentDetailsHeader }  from '../common/IntentDetailsHeader'
import { IntentIcon }           from '../common/IntentIcon'
import { KpiCard }              from '../common/KpiCard'
import { richTextFormatValues } from '../common/richTextFormatValues'
import { StatusTrail }          from '../common/StatusTrail'
import { codes }                from '../config'
import { useIntentContext }     from '../IntentContext'
import { getGraphKPIs }         from '../useIntentDetailsQuery'

export function createUseValuesText (config: {
  intro: MessageDescriptor
  action: MessageDescriptor
  reason: MessageDescriptor
  tradeoff: MessageDescriptor
}) {
  return function useValuesText () {
    const { intent } = useIntentContext()
    const values = {
      ...richTextFormatValues,
      currentValue: 'CURRENT_VALUE',
      recommendedValue: 'RECOMMENDED_VALUE',
      scope: incidentScope(intent)
    }
    return {
      actionText: <FormattedMessage {...config.action} values={values} />,
      reasonText: <FormattedMessage {...config.reason} values={values} />,
      tradeoffText: <FormattedMessage {...config.tradeoff} values={values} />,
      introText: <FormattedMessage {...config.intro} values={values} />
    }
  }
}

export function createIntentAIDetails (useValuesText: ReturnType<typeof createUseValuesText>) {
  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent, kpis } = useIntentContext()
    const valuesText = useValuesText()

    return <>
      <IntentDetailsHeader />
      <GridRow>
        <GridCol col={{ span: 6, xxl: 4 }}>
          <FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IntentIcon size='large' />
              {/* TODO: missing contents for each intent details in knowledge base? */}
              <Typography.Paragraph children={$t({
                defaultMessage: 'This content not defined?????'
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
                  label={<FormattedMessage defaultMessage='<VenueSingular></VenueSingular>' />}
                  children={intent.sliceValue}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Status' })}
                  children={getIntentStatus(intent.status)}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Date' })}
                  children={formatter(DateFormatEnum.DateTimeFormat)(moment(intent.updatedAt))}
                />
              </Descriptions>
              <br />
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

          <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection
                data-testid='Why this recommendation?'
                title={$t({ defaultMessage: 'Why this recommendation?' })}
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

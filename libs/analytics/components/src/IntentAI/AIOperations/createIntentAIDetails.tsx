import { Typography }                from 'antd'
import moment                        from 'moment-timezone'
import { FormattedMessage, useIntl } from 'react-intl'

import { Card, Descriptions, GridCol, GridRow } from '@acx-ui/components'
import { DateFormatEnum, formatter }            from '@acx-ui/formatter'

import { FixedAutoSizer }      from '../../DescriptionSection/styledComponents'
import { DetailsSection }      from '../common/DetailsSection'
import { getIntentStatus }     from '../common/getIntentStatus'
import { IntentDetailsHeader } from '../common/IntentDetailsHeader'
import { IntentIcon }          from '../common/IntentIcon'
import { KpiCard }             from '../common/KpiCard'
import { StatusTrail }         from '../common/StatusTrail'
import { codes }               from '../config'
import { useIntentContext }    from '../IntentContext'
import { Statuses }            from '../states'
import { getGraphKPIs }        from '../useIntentDetailsQuery'
import { isDataRetained }      from '../utils'

import { ConfigurationCard }   from './ConfigurationCard'
import { createUseValuesText } from './createUseValuesText'

export function createIntentAIDetails (useValuesText: ReturnType<typeof createUseValuesText>) {
  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent, kpis, configuration } = useIntentContext()
    const valuesText = useValuesText()
    const showData = isDataRetained(intent.dataEndTime)
    const blurData = [
      Statuses.na,
      Statuses.paused
    ].includes(intent.status as Statuses)

    return <>
      <IntentDetailsHeader />
      <GridRow>
        <GridCol col={{ span: 6, xxl: 4 }}>
          <FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IntentIcon size='large' />
              <Typography.Paragraph children={valuesText.summary} />
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
              {[
                <GridCol data-testid='Configuration' key='value' col={{ span: 12 }}>
                  <ConfigurationCard configuration={configuration!}
                    intent={intent}
                    blurData={blurData}/>
                </GridCol>,
                ...getGraphKPIs(intent, kpis).map(kpi => (
                  <GridCol data-testid='KPI' key={kpi.key} col={{ span: 12 }}>
                    <KpiCard kpi={kpi}
                      showData={showData}
                      blurData={blurData}/>
                  </GridCol>
                ))]}
            </GridRow>}
          />

          <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection
                data-testid='Why is this intent?'
                title={$t({ defaultMessage: 'Why is this intent?' })}
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

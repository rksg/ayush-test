import { useState } from 'react'

import { Typography }                from 'antd'
import moment                        from 'moment-timezone'
import { FormattedMessage, useIntl } from 'react-intl'

import { Card, Descriptions, GridCol, GridRow, Loader } from '@acx-ui/components'
import { DateFormatEnum, formatter }                    from '@acx-ui/formatter'

import { FixedAutoSizer }      from '../../DescriptionSection/styledComponents'
import { DetailsSection }      from '../common/DetailsSection'
import { getIntentStatus }     from '../common/getIntentStatus'
import { IntentDetailsHeader } from '../common/IntentDetailsHeader'
import { IntentIcon }          from '../common/IntentIcon'
import { KpiCard }             from '../common/KpiCard'
import { StatusTrail }         from '../common/StatusTrail'
import { codes }               from '../config'
import { useIntentContext }    from '../IntentContext'
import { useGetApsQuery }      from '../services'
import { getGraphKPIs }        from '../useIntentDetailsQuery'

import { ConfigurationCard }   from './ConfigurationCard'
import { createUseValuesText } from './createUseValuesText'
import { ImpactedApsDrawer }   from './ImpactedApsDrawer'

export function createIntentAIDetails (useValuesText: ReturnType<typeof createUseValuesText>) {
  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent, kpis, configuration } = useIntentContext()
    const valuesText = useValuesText()
    const [drawerVisible, setDrawerVisible] = useState(false)

    const hasAp = true // Boolean(kpis.filter(kpi => kpi.showAps).length)
    const impactedApsQuery = useGetApsQuery({ id: intent.id, search: '' }, { skip: !hasAp })

    return <Loader states={[impactedApsQuery]}>
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
                  children={getIntentStatus(intent.displayStatus)}
                />
                <Descriptions.Item
                  label={$t({ defaultMessage: 'Date' })}
                  children={formatter(DateFormatEnum.DateTimeFormat)(moment(intent.updatedAt))}
                />
                {(impactedApsQuery.data) && <Descriptions.Item
                  label={$t({ defaultMessage: 'AP Impact Count' })}
                  children={
                    <span
                      onClick={() => setDrawerVisible(true)}
                      style={{ cursor: 'pointer', color: '#1890ff' }}
                    >
                      {$t(
                        {
                          defaultMessage:
                          '{count} of {count} {count, plural, one {AP} other {APs}} ({percent})'
                        },
                        {
                          count: impactedApsQuery.data.length,
                          percent: formatter('percent')(100)
                        }
                      )}
                    </span>
                  }
                />}
              </Descriptions>
              <br />
            </div>)}
          </FixedAutoSizer>
          <ImpactedApsDrawer
            id={intent.id}
            aps={impactedApsQuery.data!}
            visible={drawerVisible}
            onClose={() => setDrawerVisible(false)}
          />
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
    </Loader>
  }
}

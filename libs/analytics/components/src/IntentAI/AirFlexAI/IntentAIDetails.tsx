import { useEffect, useState } from 'react'

import { Typography }                 from 'antd'
import moment                         from 'moment-timezone'
import { MessageDescriptor, useIntl } from 'react-intl'

import { impactedArea, nodeTypes, productNames } from '@acx-ui/analytics/utils'
import { Card, Descriptions, GridCol, GridRow }  from '@acx-ui/components'
import { get }                                   from '@acx-ui/config'
import { DateFormatEnum, formatter }             from '@acx-ui/formatter'
import { useWifiNetworkListQuery }               from '@acx-ui/rc/services'
import { getIntl, NodeType }                     from '@acx-ui/utils'

import { DescriptionRow }      from '../../DescriptionSection'
import { FixedAutoSizer }      from '../../DescriptionSection/styledComponents'
import { ConfigurationCard }   from '../AIOperations/ConfigurationCard'
import { DetailsSection }      from '../common/DetailsSection'
import { getIntentStatus }     from '../common/getIntentStatus'
import { IntentDetailsHeader } from '../common/IntentDetailsHeader'
import { IntentIcon }          from '../common/IntentIcon'
import { KpiCard }             from '../common/KpiCard'
import { StatusTrail }         from '../common/StatusTrail'
import { codes }               from '../config'
import { useIntentContext }    from '../IntentContext'
import { getGraphKPIs }        from '../useIntentDetailsQuery'
import { IntentWlan }          from '../utils'

export function createUseValuesText ({ reason, tradeoff, action }: {
  reason: MessageDescriptor
  tradeoff: MessageDescriptor
  action: {
    active: MessageDescriptor,
    inactive: MessageDescriptor
  }
}) {
  return function useValuesText () {
    const { $t } = getIntl()
    const { intent, state } = useIntentContext()
    const {
      path,
      sliceType,
      sliceValue
    } = intent

    const actionText = state === 'active'
      ? action.active
      : action.inactive
    const currentValueText = (intent.currentValue === true)
      ? $t({ defaultMessage: 'enabled' })
      : $t({ defaultMessage: 'not enabled' })

    return {
      reasonText: $t(reason),
      tradeoffText: $t(tradeoff),
      actionText: $t(actionText, {
        ...productNames,
        scope: `${nodeTypes(sliceType as NodeType)}: ${impactedArea(path, sliceValue)}`,
        currentValue: currentValueText
      })
    }
  }
}

function useWlanRecords (originalWlans: IntentWlan[] | undefined, skip: boolean) {
  const [wlans, setWlans] = useState<Array<IntentWlan>>(originalWlans ?? [])
  const r1NetworksQuery = useWifiNetworkListQuery({
    payload: {
      deep: true,
      fields: ['id', 'name', 'ssid'],
      filters: { id: originalWlans?.map(wlan => wlan.name) },
      sortField: 'name',
      sortOrder: 'ASC',
      page: 1,
      pageSize: 10_000
    }
  }, { skip })
  useEffect(() => {
    if (r1NetworksQuery.data?.data) {
      setWlans(r1NetworksQuery.data.data)
    }
  }, [r1NetworksQuery])
  return wlans
}

export function createIntentAIDetails (config: Parameters<typeof createUseValuesText>[0]) {
  const useValuesText = createUseValuesText(config)

  return function IntentAIDetails () {
    const { $t } = useIntl()
    const { intent, kpis } = useIntentContext()
    const valuesText = useValuesText()
    const isMlisa = get('IS_MLISA_SA') === 'true'
    const { wlans } = intent.metadata
    const needsWlans = wlans && wlans.length > 0
    const wlanRecords = useWlanRecords(wlans, !needsWlans || isMlisa)

    return <>
      <IntentDetailsHeader />
      <GridRow>
        <GridCol col={{ span: 6, xxl: 4 }}>
          <FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IntentIcon size='large' />
              <Typography.Paragraph
                data-testid='Overview text'
                children={valuesText.actionText} />
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
                { needsWlans && <Descriptions.Item
                  label={$t({ defaultMessage: 'Networks' })}>
                  <DescriptionRow
                    children={$t({ defaultMessage: '{count} networks selected' },
                      { count: wlans.length })}
                    popover={wlanRecords.map(wlan => wlan.name).join('\n')}
                  />
                </Descriptions.Item>}
              </Descriptions>
              <br />
            </div>)}
          </FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 18, xxl: 20 }}>
          <DetailsSection data-testid='Details'>
            <DetailsSection.Title children={$t({ defaultMessage: 'Details' })} />
            <GridRow>
              <GridCol data-testid='Configuration' col={{ span: 12 }}>
                <ConfigurationCard />
              </GridCol>
              {getGraphKPIs(intent, kpis).map(kpi => (
                <GridCol data-testid='KPI' key={kpi.key} col={{ span: 12 }}>
                  <KpiCard kpi={kpi} />
                </GridCol>
              ))}
            </GridRow>
          </DetailsSection>

          <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Why this recommendation?'>
                <DetailsSection.Title
                  children={$t({ defaultMessage: 'Why this recommendation?' })} />
                <Card>{valuesText.reasonText}</Card>
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
    </>
  }
}

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

import { DescriptionRow }             from '../../DescriptionSection'
import { FixedAutoSizer }             from '../../DescriptionSection/styledComponents'
import { ConfigurationCard }          from '../AIOperations/ConfigurationCard'
import { DetailsSection }             from '../common/DetailsSection'
import { getIntentStatus }            from '../common/getIntentStatus'
import { IntentDetailsHeader }        from '../common/IntentDetailsHeader'
import { IntentIcon }                 from '../common/IntentIcon'
import { isIntentInactive }           from '../common/isIntentActive'
import { KpiCard }                    from '../common/KpiCard'
import { StatusTrail }                from '../common/StatusTrail'
import { codes }                      from '../config'
import { useIntentContext }           from '../IntentContext'
import { getGraphKPIs }               from '../useIntentDetailsQuery'
import { IntentWlan, isDataRetained } from '../utils'

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
    const { intent } = useIntentContext()
    const {
      path,
      sliceType,
      sliceValue
    } = intent

    const actionText = isIntentInactive(intent)
      ? action.inactive
      : action.active
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
    const { intent, kpis, configuration } = useIntentContext()
    const valuesText = useValuesText()
    const isFlexAI = intent.code.startsWith('c-probeflex')
    const isMlisa = get('IS_MLISA_SA') === 'true'
    const { wlans } = intent.metadata
    const needsWlans = isFlexAI && wlans && wlans.length > 0
    const wlanRecords = useWlanRecords(wlans, !needsWlans || isMlisa)
    const showData = isDataRetained(intent.metadata.dataEndTime)

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
                    label={$t({ defaultMessage: 'Networks' })}
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
          <DetailsSection
            data-testid='Details'
            title={$t({ defaultMessage: 'Details' })}
            children={<GridRow>
              {[
                <GridCol data-testid='Configuration' key='value' col={{ span: 12 }}>
                  <ConfigurationCard configuration={configuration!} intent={intent}/>
                </GridCol>,
                ...getGraphKPIs(intent, kpis).map(kpi => (
                  <GridCol data-testid='KPI' key={kpi.key} col={{ span: 12 }}>
                    <KpiCard kpi={kpi}
                      showData={showData}
                      intent={intent} />
                  </GridCol>
                ))]}
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

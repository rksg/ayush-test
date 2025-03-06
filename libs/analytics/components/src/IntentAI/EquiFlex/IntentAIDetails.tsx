import { useEffect, useState } from 'react'

import { Typography }                                   from 'antd'
import { TooltipPlacement }                             from 'antd/es/tooltip'
import { FormattedMessage, MessageDescriptor, useIntl } from 'react-intl'

import { Card, GridCol, GridRow }  from '@acx-ui/components'
import { get }                     from '@acx-ui/config'
import { useWifiNetworkListQuery } from '@acx-ui/rc/services'

import { DescriptionSection }   from '../../DescriptionSection'
import { FixedAutoSizer }       from '../../DescriptionSection/styledComponents'
import { ConfigurationCard }    from '../AIOperations/ConfigurationCard'
import { useCommonFields }      from '../common/commonFields'
import { DetailsSection }       from '../common/DetailsSection'
import { IntentDetailsHeader }  from '../common/IntentDetailsHeader'
import { IntentIcon }           from '../common/IntentIcon'
import { KPIGrid }              from '../common/KPIs'
import { richTextFormatValues } from '../common/richTextFormatValues'
import { StatusTrail }          from '../common/StatusTrail'
import { IntentWlan }           from '../config'
import { useIntentContext }     from '../IntentContext'
import { getStatusTooltip }     from '../services'

import * as SideNotes from './IntentAIForm/SideNotes'

export function createUseValuesText ({ action }: {
  action: {
    hasData: MessageDescriptor,
    noData: MessageDescriptor
  }
}) {
  return function useValuesText () {
    const { state } = useIntentContext()
    const actionText = state === 'no-data'
      ? action.noData
      : action.hasData

    return {
      actionText: actionText
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
    const { intent, state } = useIntentContext()
    const { displayStatus, sliceValue, metadata, updatedAt } = intent
    const valuesText = useValuesText()
    const isMlisa = get('IS_MLISA_SA') === 'true'
    const { wlans } = intent.metadata
    const needsWlans = wlans && wlans.length > 0
    const wlanRecords = useWlanRecords(wlans, !needsWlans || isMlisa)
    const fields = [
      ...useCommonFields(intent),
      ...(needsWlans
        ? [{
          label: $t({ defaultMessage: 'Networks' }),
          children: $t({ defaultMessage: `{count} {count, plural,
              one {network}
              other {networks}
            } selected` }, {
            count: wlans.length
          }),
          tooltip: wlanRecords.map(wlan => wlan.name).join('\n'),
          tooltipPlacement: 'right' as TooltipPlacement
        }]
        : []
      )
    ]

    return <>
      <IntentDetailsHeader />
      <GridRow>
        <GridCol col={{ span: 6, xxl: 4 }}>
          <FixedAutoSizer>
            {({ width }) => (<div style={{ width }}>
              <IntentIcon size='large' />
              <Typography.Paragraph
                data-testid='Overview text'
                children={
                  <FormattedMessage {...valuesText.actionText} values={richTextFormatValues}/>
                }/>
              <DescriptionSection fields={fields}/>
              <br />
            </div>)}
          </FixedAutoSizer>
        </GridCol>
        <GridCol col={{ span: 18, xxl: 20 }}>
          {state !== 'no-data' ? <>
            <DetailsSection data-testid='Details'>
              <DetailsSection.Title children={$t({ defaultMessage: 'Details' })} />
              <GridRow>
                <GridCol data-testid='Configuration' col={{ span: 12 }}>
                  <ConfigurationCard />
                </GridCol>
                <KPIGrid/>
              </GridRow>
            </DetailsSection>

            <GridRow>
              <GridCol col={{ span: 12 }}>
                <DetailsSection data-testid='Benefits'>
                  <DetailsSection.Title
                    children={$t(SideNotes.title)} />
                  <Card>{$t(SideNotes.benefits)}</Card>
                </DetailsSection>
              </GridCol>
              <GridCol col={{ span: 12 }}>
                <DetailsSection data-testid='Potential Trade-off'>
                  <DetailsSection.Title children={$t({ defaultMessage: 'Potential Trade-off' })} />
                  <Card>{$t(SideNotes.tradeoff)}</Card>
                </DetailsSection>
              </GridCol>
            </GridRow>
          </> : <GridRow>
            <GridCol col={{ span: 12 }}>
              <DetailsSection data-testid='Current Status'>
                <DetailsSection.Title children={$t({ defaultMessage: 'Current Status' })} />
                <DetailsSection.Details children={
                  <Card>{getStatusTooltip(
                    displayStatus, sliceValue, { ...metadata, updatedAt })}</Card>} />
              </DetailsSection>
            </GridCol>
          </GridRow>}

          <StatusTrail />
        </GridCol>
      </GridRow>
    </>
  }
}

import { Row, Col }               from 'antd'
import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { Loader, Card, ColorPill, NoDataIconOnly, Tooltip } from '@acx-ui/components'
import { intlFormats }                                      from '@acx-ui/formatter'
import { AIDrivenRRM, AIOperation, EquiFlex }               from '@acx-ui/icons'
import { TenantLink, useSearchParams }                      from '@acx-ui/react-router-dom'
import { fixedEncodeURIComponent, type PathFilter }         from '@acx-ui/utils'

import { AiFeatures }                                              from '../config'
import { HighlightItem, IntentHighlight, useIntentHighlightQuery } from '../services'
import { DisplayStates }                                           from '../states'
import { iconTooltips }                                            from '../Table'

import * as UI from './styledComponents'

const { countFormat } = intlFormats

type IntentAIWidgetProps = {
  pathFilters: PathFilter
}

type HighlightCardProps = HighlightItem & {
  title: string,
  icon: JSX.Element,
  type: AiFeatures
}

function HighlightCard (props: HighlightCardProps) {
  const { $t } = useIntl()
  const title = {
    title: props.title,
    icon: <ColorPill
      color='var(--acx-accents-orange-50)'
      value={$t(countFormat, { value: props.new })}
    />
  }
  const isActive = props.active > 0
  const content = isActive
    ? $t(
      { defaultMessage: `{activeCount} {activeCount, plural,
        one {Intent is}
        other {Intents are}
      } active.` },
      { activeCount: props.active }
    )
    : $t({ defaultMessage: 'Click here to view available Intents in the network.' })
  const iconEncodedPath = fixedEncodeURIComponent( JSON.stringify({ aiFeature: [props.type] }) )
  const encodedPath = fixedEncodeURIComponent(
    JSON.stringify({
      aiFeature: [props.type],
      ...((isActive) ? { statusLabel: [DisplayStates.active] } : {})
    })
  )
  return (
    <Card
      cardIcon={
        <Tooltip
          placement='right'
          title={iconTooltips[props.type]}
          overlayInnerStyle={{ width: '345px' }}
        >
          <TenantLink to={`/analytics/intentAI?intentTableFilters=${iconEncodedPath}`}>
            {props.icon}
          </TenantLink>
        </Tooltip>
      }
      title={title}
      className='highlight-card-title'>
      <TenantLink to={`/analytics/intentAI?intentTableFilters=${encodedPath}`}>
        {content}
      </TenantLink>
    </Card>
  )
}

function useHighlightList (data: IntentHighlight | undefined) {
  const { $t } = useIntl()
  const highlightList: HighlightCardProps[] = []
  if (data?.rrm) {
    highlightList.push({
      ...data.rrm,
      title: $t({ defaultMessage: 'AI-Driven RRM' }),
      icon: <AIDrivenRRM />,
      type: AiFeatures.RRM
    })
  }
  if (data?.probeflex) {
    highlightList.push({
      ...data.probeflex,
      title: $t({ defaultMessage: 'EquiFlex' }),
      icon: <EquiFlex />,
      type: AiFeatures.EquiFlex
    })
  }
  if (data?.ops) {
    highlightList.push({
      ...data.ops,
      title: $t({ defaultMessage: 'AI Operations' }),
      icon: <AIOperation />,
      type: AiFeatures.AIOps
    })
  }
  return highlightList
}

export default function IntentAIWidget ({
  pathFilters
}: IntentAIWidgetProps) {
  const { $t } = useIntl()
  // pass selectedTenants to query to prevent error on account switch
  const [search] = useSearchParams()
  const selectedTenants = search.get('selectedTenants')
  const queryResults = useIntentHighlightQuery(
    { ...pathFilters, selectedTenants }
  )
  const data = queryResults?.data
  const title = $t({ defaultMessage: 'IntentAI' })
  const firstParagraph = defineMessage({
    defaultMessage: 'Revolutionize your Network Optimization'
  })
  const secondParagraph = defineMessage({
    defaultMessage: `Automate network configuration & monitoring tasks and optimize your network
    performance with IntentAI's advanced purpose driven AI/ML configuration models.`
  })
  const highlightList: HighlightCardProps[] = useHighlightList(data)
  const hasData = highlightList.length > 0

  return <Loader states={[queryResults]}>
    <Card title={title}>
      <UI.HighlightCardTitle />
      <UI.ContentWrapper>
        <AutoSizer key='intentAIWidget'>
          {({ width, height }) => (
            !hasData
              ? <div style={{ width, height }}>
                <p><b>{$t(firstParagraph)}</b></p>
                <p>{$t(secondParagraph)}</p>
                <UI.NoDataWrapper>
                  <NoDataIconOnly />
                </UI.NoDataWrapper>
              </div>
              : <div style={{ width, height }}>
                <p><b>{$t(firstParagraph)}</b></p>
                <p>{$t(secondParagraph)}</p>
                <Row gutter={[12, 12]}>
                  {
                    highlightList.map((detail, index) =>
                      <Col span={12} key={`intentAICardCol${index}`}>
                        <HighlightCard
                          key={`intentAICard${index}`}
                          icon={detail.icon}
                          title={detail.title}
                          new={detail.new}
                          active={detail.active}
                          type={detail.type}
                        />
                      </Col>)
                  }
                </Row>
              </div>
          )}
        </AutoSizer>
      </UI.ContentWrapper>
    </Card>
  </Loader>
}

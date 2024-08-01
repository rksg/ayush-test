import { Row, Col }               from 'antd'
import { defineMessage, useIntl } from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { Loader, Card, ColorPill, NoDataIconOnly } from '@acx-ui/components'
import { intlFormats }                             from '@acx-ui/formatter'
import { AIDrivenRRM, AIOperation, AirFlexAI }     from '@acx-ui/icons'
import { useSearchParams }                         from '@acx-ui/react-router-dom'
import type { PathFilter }                         from '@acx-ui/utils'

import { HighlightItem, IntentHighlight, useIntentHighlightQuery } from '../services'

import * as UI from './styledComponents'

const { countFormat } = intlFormats

type IntentAIWidgetProps = {
  pathFilters: PathFilter
}

type HighlightCardProps = HighlightItem & {
  type: 'rrm' | 'airflex' | 'operations'
}

function HighlightCard (props: HighlightCardProps) {
  const { $t } = useIntl()
  const { type, new: newCount, active: activeCount } = props

  const getTitle = (type: 'rrm' | 'airflex' | 'operations') => {
    if (type === 'rrm') {
      return $t({ defaultMessage: 'AI-Driven RRM' })
    } else if (type === 'airflex') {
      return $t({ defaultMessage: 'AirFlexAI' })
    } else if (type === 'operations') {
      return $t({ defaultMessage: 'AI Operations' })
    }
    return ''
  }

  const getCardIcon = (type: 'rrm' | 'airflex' | 'operations') => {
    if (type === 'rrm') {
      return <AIDrivenRRM />
    } else if (type === 'airflex') {
      return <AirFlexAI />
    } else if (type === 'operations') {
      return <AIOperation />
    }
    return null
  }

  const title = {
    title: getTitle(type),
    icon: <ColorPill
      color='var(--acx-accents-orange-50)'
      value={$t(countFormat, { value: newCount })}
    />
  }
  const content = activeCount > 0
    ? $t(
      {
        defaultMessage: '{activeCount} Intents are Active.'
      },
      { activeCount: activeCount }
    )
    : $t({ defaultMessage: 'Click here to view available Intents in the network.' })

  return (<Card cardIcon={getCardIcon(type)} title={title}>
    {content}
  </Card>)
}

function getHighlightList (data: IntentHighlight | undefined) {
  const highlightList: HighlightCardProps[] = []
  if (data?.rrm) {
    highlightList.push({ type: 'rrm', new: data.rrm.new, active: data.rrm.active })
  }
  if (data?.airflex) {
    highlightList.push({ type: 'airflex', new: data.airflex.new, active: data.airflex.active })
  }
  if (data?.ops) {
    highlightList.push({ type: 'operations', new: data.ops.new, active: data.ops.active })
  }
  return highlightList
}

export function IntentAIWidget ({
  pathFilters
}: IntentAIWidgetProps) {
  const { $t } = useIntl()
  // pass selectedTenants to query to prevent error on account switch
  const [search] = useSearchParams()
  const selectedTenants = search.get('selectedTenants')
  const queryResults = useIntentHighlightQuery(
    { ...pathFilters, n: 12, selectedTenants }
  )
  const data = queryResults?.data

  const title = $t({ defaultMessage: 'IntentAI' })

  const firstParagraph = defineMessage({ defaultMessage:
  'Revolutionize your Network Optimization'
  })
  const secondParagraph = defineMessage({
    defaultMessage: `Automates configuration, monitors task based, and optimizes your network
      performance with IntentAI's advanced AI and ML technologies.
      ` })

  const highlightList: HighlightCardProps[] = getHighlightList(data)
  const hasData = highlightList.length > 0

  return <Loader states={[queryResults]}>
    <Card title={title}>
      <UI.ContentWrapper>
        <AutoSizer>
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
                <Row gutter={[24, 24]}>
                  {
                    highlightList.map((detail, index) => {
                      return <Col span={12} key={index} >
                        <HighlightCard
                          key={index}
                          type={detail.type}
                          new={detail.new}
                          active={detail.active} />
                      </Col>
                    })

                  }
                </Row>
              </div>
          )}
        </AutoSizer>
      </UI.ContentWrapper>
    </Card>
  </Loader>
}

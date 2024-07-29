/* eslint-disable max-len */
import { title } from 'process'

import { List, Card as AntCard, Row, Col } from 'antd'
import { defineMessage, useIntl }          from 'react-intl'
import AutoSizer                           from 'react-virtualized-auto-sizer'

import { isSwitchPath }                                                                       from '@acx-ui/analytics/utils'
import { Loader, Card, Tooltip, ColorPill, NoActiveData, NoData, NoDataIcon, NoDataIconOnly } from '@acx-ui/components'
import { formatter, intlFormats }                                                             from '@acx-ui/formatter'
import { AIDrivenRRM, AIOperation, AirFlexAI }                                                from '@acx-ui/icons'
import { TenantLink, useNavigateToPath, useSearchParams }                                     from '@acx-ui/react-router-dom'
import type { PathFilter }                                                                    from '@acx-ui/utils'

// import { states }                                   from '../Recommendations/config'
// import { CrrmList, CrrmListItem, useCrrmListQuery } from '../Recommendations/services'
// import { OptimizedIcon }                            from '../Recommendations/styledComponents'

// import {
//   NoRRMLicense,
//   NoZones,
//   getParamString
// } from './extra'
// import CrrmKpi from './kpi'
import { HighlightItem, IntentHighlight, useIntentHighlightQuery } from '../services'

import * as UI from './styledComponents'

const { countFormat } = intlFormats

type IntentAIWidgetProps = {
  pathFilters: PathFilter
}

function NoIntentAIData () {
  const { $t } = useIntl()
  return (
    <>
      <NoDataIconOnly />
      <p>{$t({ defaultMessage:
        'test wording'
      })}</p>
    </>
  )
}

function getHighlightList (data: IntentHighlight | undefined) {
  const highlightList: HighlightCardProps[] = []
  if (data?.rrm) {
    highlightList.push({ type: 'rrm', new: data.rrm.new, applied: data.rrm.applied })
  }
  if (data?.airflex) {
    highlightList.push({ type: 'airflex', new: data.airflex.new, applied: data.airflex.applied })
  }
  if (data?.ops) {
    highlightList.push({ type: 'operations', new: data.ops.new, applied: data.ops.applied })
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
  // TODO: do we need this?
  // const onArrowClick = useNavigateToPath('/analytics/recommendations/crrm')
  const queryResults = useIntentHighlightQuery(
    { ...pathFilters, n: 12, selectedTenants }
  )
  const data = queryResults?.data

  const title = $t({ defaultMessage: 'IntentAI' })

  // const noLicense = data?.recommendations.length !== 0 ? data?.recommendations.every(
  //   recommendation => recommendation.status === 'insufficientLicenses'
  // ) : false

  const firstParagraph = defineMessage({ defaultMessage:
  'Revolutionize your Network Optimization'
  })
  // $t({ defaultMessage: '' })
  const secondParagraph = defineMessage({
    defaultMessage: `Automates configuration, monitors task based, and optimizes your network
      performance with IntentAI's advanced AI and ML technologies.
      ` })

  const nullData : IntentHighlight = {
  }
  const partialData1: IntentHighlight = {
    rrm: { new: 12, applied: 24 }
  }
  const partialData2: IntentHighlight = {
    airflex: { new: 6, applied: 12 }
  }
  const partialData3: IntentHighlight = {
    ops: { new: 18, applied: 36 }
  }
  const partialData12: IntentHighlight = {
    rrm: { new: 12, applied: 24 },
    airflex: { new: 6, applied: 12 }
  }
  const partialData13: IntentHighlight = {
    rrm: { new: 12, applied: 24 },
    ops: { new: 18, applied: 13 }
  }
  const partialData23: IntentHighlight = {
    airflex: { new: 6, applied: 12 },
    ops: { new: 18, applied: 13 }
  }
  const zeroData : IntentHighlight = {
    rrm: { new: 12, applied: 0 },
    airflex: { new: 6, applied: 0 },
    ops: { new: 18, applied: 0 }
  }
  const fullData : IntentHighlight = {
    rrm: { new: 12, applied: 24 },
    airflex: { new: 6, applied: 12 },
    ops: { new: 18, applied: 13 }
  }

  //TODO: use nullData for IT screenshot
  const responseData = zeroData
  // const rrmData = responseData?.rrm
  // const airFlexData = responseData?.airflex
  // const operationData = responseData?.ops
  const highlightList: HighlightCardProps[] = getHighlightList(responseData)
  // if (rrmData) {
  //   highlightList.push({ type: 'rrm', new: rrmData.new, applied: rrmData.applied })
  // }
  // if (airFlexData) {
  //   highlightList.push({ type: 'airflex', new: airFlexData.new, applied: airFlexData.applied })
  // }
  // if (operationData) {
  //   highlightList.push({ type: 'operations', new: operationData.new, applied: operationData.applied })
  // }
  const hasData = highlightList.length > 0

  return <Loader states={[queryResults]}>
    <Card title={title}>
      <UI.CardNoBorderStyle/>
      <UI.ContentWrapper>
        {/* <p><b>{$t(firstParagraph)}</b></p>
        <p>{$t(secondParagraph)}</p> */}
        {/* {
          // TODO: remove mockData
          // TODO: when should we use autoSizer?
          !hasData
            // TODO: how to make it be the margin center?
            ? <UI.NoDataWrapper><NoDataIconOnly /></UI.NoDataWrapper>
            : <div className='grid-with-max-2-column'>
              {rrmData && <HighlightCard type={'rrm'} new={rrmData.new} applied={rrmData.applied} />}
              {airFlexData && <HighlightCard type={'airflex'} new={airFlexData.new} applied={airFlexData.applied} />}
              {operationData && <HighlightCard type={'operations'} new={operationData.new} applied={operationData.applied} />}
            </div>
        } */}
        {/* TODO: do we need autoSizer at this layer? */}
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
                {/* TODO: how to fix grid height and fix max-2-column? */}
                {/* TODO: do we still need className? */}
                <Row gutter={[20, 20]} className='grid-with-max-2-column'>
                  {
                    highlightList.map((highlightCard, index) => (
                      <Col span={12} key={index}>
                        <HighlightCard type={highlightCard.type} new={highlightCard.new} applied={highlightCard.applied} />
                      </Col>
                    ))
                  }
                </Row>
                {/* <Row gutter={[24, 24]} className='grid-with-max-2-column'> */}
                {/* <Row gutter={[20, 20]} className='grid-with-max-2-column'>
                  {
                    highlightList.map((highlightCard, index) => (
                      <Col span={12} key={index}>
                        <HighlightCard type={highlightCard.type} new={highlightCard.new} applied={highlightCard.applied} />
                      </Col>
                    ))
                  }
                </Row> */}
                {/* <Row gutter={[20, 20]} className='grid-with-max-2-column'>
                  <AutoSizer>
                    {({ width, height }) => (
                      <div style={{ width, height }}>
                        {
                          highlightList.map((highlightCard, index) => (
                            <Col span={12} key={index} >
                              {index < 10 && <HighlightCard type={highlightCard.type} new={highlightCard.new} applied={highlightCard.applied} />}
                            </Col>
                          ))
                        }
                      </div>
                    )}
                  </AutoSizer>
                </Row> */}
                {/* <AutoSizer>
                  {({ width, height }) => (
                    <div style={{ width, height }}>
                      <Row gutter={[20, 20]} className='grid-with-max-2-column'>
                        {
                          highlightList.map((highlightCard, index) => (
                            <Col span={12} key={index}>
                              {index < 10 && <HighlightCard type={highlightCard.type} new={highlightCard.new} applied={highlightCard.applied} />}
                            </Col>
                          ))
                        }
                      </Row>
                      <Row gutter={[20, 20]} className='grid-with-max-2-column'>
                        {
                          highlightList.map((highlightCard, index) => (
                            <Col span={12} key={index}>
                              {index < 2 && <HighlightCard type={highlightCard.type} new={highlightCard.new} applied={highlightCard.applied} />}
                            </Col>
                          ))
                        }
                      </Row>
                      <Row gutter={[20, 20]} className='grid-with-max-2-column'>
                        {
                          highlightList.map((highlightCard, index) => (
                            <Col span={12} key={index}>
                              {index < 3 && <HighlightCard type={highlightCard.type} new={highlightCard.new} applied={highlightCard.applied} />}
                            </Col>
                          ))
                        }
                      </Row>
                    </div>
                  )}
                </AutoSizer> */}
                {/* <Col span={12}>
                    {rrmData && <HighlightCard type={'rrm'} new={rrmData.new} applied={rrmData.applied} />}
                    <HighlightCard type={highlightList[0].type} new={highlightList[0].new} applied={highlightList[0].applied} />
                  </Col>
                  <Col span={12}>
                    {airFlexData && <HighlightCard type={'airflex'} new={airFlexData.new} applied={airFlexData.applied} />}
                    <HighlightCard type={highlightList[1].type} new={highlightList[1].new} applied={highlightList[1].applied} />
                  </Col>
                  <Col span={12}>
                    {operationData && <HighlightCard type={'operations'} new={operationData.new} applied={operationData.applied} />}
                    <HighlightCard type={highlightList[2].type} new={highlightList[2].new} applied={highlightList[2].applied} />
                  </Col> */}
                {/* <Col span={12}>
                    {operationData && <HighlightCard type={'operations'} new={operationData.new} applied={operationData.applied} />}
                  </Col> */}
                {/* <div className='grid-with-max-2-column'>
                  {rrmData && <HighlightCard type={'rrm'} new={rrmData.new} applied={rrmData.applied} />}
                  {airFlexData && <HighlightCard type={'airflex'} new={airFlexData.new} applied={airFlexData.applied} />}
                  {operationData && <HighlightCard type={'operations'} new={operationData.new} applied={operationData.applied} />}
                </div> */}
              </div>
          )}
        </AutoSizer>
      </UI.ContentWrapper>
    </Card>
  </Loader>
}

type HighlightCardProps = HighlightItem & {
  type: 'rrm' | 'airflex' | 'operations'
}

// type RRMCardProps = {
//   newCount: number
//   linkCount: number
//   apCount: number
// }
// type AirFlexCardProps = {
//   newCount: number
//   traffic: number
// }
// type AIOperationCardProps = {
//   newCount: number
//   appliedCount: number
// }

function HighlightCard (props: HighlightCardProps) {
  const { $t } = useIntl()
  const { type, new: newCount, applied: appliedCount } = props

  let cardTitle = $t({ defaultMessage: 'AI-Driven RRM' })
  if (type === 'airflex') {
    cardTitle = $t({ defaultMessage: 'AirFlexAI' })
  } else if (type === 'operations') {
    cardTitle = $t({ defaultMessage: 'AI Operations' })
  }

  const title = {
    title: cardTitle,
    icon: <ColorPill
      color='var(--acx-accents-orange-50)'
      value={$t(countFormat, { value: newCount })}
    />
  }
  const content = appliedCount > 0
    ? $t(
      {
        defaultMessage: '{appliedCount} Automated recommendations applied.'
      },
      { appliedCount }
    )
    // TODO: where should we put link & redirect to where?
    : $t({ defaultMessage: 'Click here to view available Intents in the network.' })

  return <div>
    <AntCard>
      {/* TODO: how to make icon left */}
      {type === 'rrm' && <AIDrivenRRM />}
      {type === 'airflex' && <AirFlexAI />}
      {type === 'operations' && <AIOperation />}
      <Card className='card-no-border' title={title}>
        {/* TODO: content font may use 3-font size */}
        {content}
      </Card>
    </AntCard>
  </div>
}

// function RRMCard (props: CommonCardProps) {
//   const { $t } = useIntl()
//   const { newCount, appliedCount } = props
//   const title = {
//     title: $t({ defaultMessage: 'AI-Driven RRM' }),
//     icon: <ColorPill
//       color='var(--acx-accents-orange-50)'
//       value={$t(countFormat, { value: newCount })}
//     />
//   }
//   const subtitle = appliedCount > 0
//     ? $t(
//       {
//         defaultMessage: '{appliedCount} Automated recommendations applied.'
//       },
//       { appliedCount }
//     )
//     : $t({ defaultMessage: 'Click here to view available Intents in the network.' })

//   return <div>
//     <AntCard>
//       {/* TODO: how to make icon left */}
//       <AIDrivenRRM />
//       <Card className='card-no-border' title={title} subTitle={subtitle} />
//     </AntCard>
//   </div>
// }

// function AirFlexCard (props: CommonCardProps) {
//   const { $t } = useIntl()
//   const { newCount, appliedCount } = props
//   const title = {
//     title: $t({ defaultMessage: 'AirFlexAI' }),
//     icon: <ColorPill
//       color='var(--acx-accents-orange-50)'
//       value={$t(countFormat, { value: newCount })}
//     />
//   }
//   const subtitle = appliedCount > 0
//     ? $t(
//       {
//         defaultMessage: '{appliedCount} Automated recommendations applied.'
//       },
//       { appliedCount }
//     )
//     : $t({ defaultMessage: 'Click here to view available Intents in the network.' })

//   return <div>
//     <AntCard>
//       <AirFlexAI />
//       <Card className='card-no-border' title={title} subTitle={subtitle} />
//     </AntCard>
//   </div>
// }

// function AIOperationCard (props: CommonCardProps) {
//   const { $t } = useIntl()
//   const { newCount, appliedCount } = props
//   const title = {
//     title: $t({ defaultMessage: 'AI Operations' }),
//     icon: <ColorPill
//       color='var(--acx-accents-orange-50)'
//       value={$t(countFormat, { value: newCount })}
//     />
//   }

//   const subtitle = appliedCount > 0
//     ? $t(
//       {
//         defaultMessage: '{appliedCount} Automated recommendations applied.'
//       },
//       { appliedCount }
//     )
//     : $t({ defaultMessage: 'Click here to view available Intents in the network.' })

//   return <div>
//     <AntCard>
//       <AIOperation />
//       <Card className='card-no-border' title={title} subTitle={subtitle} />
//     </AntCard>
//   </div>
// }

import { useEffect, useRef } from 'react'

import * as d3     from 'd3'
import { set }     from 'lodash'
import { useIntl } from 'react-intl'

import { Loader }                                           from '@acx-ui/components'
import { PersonalIdentityNetworks, transformDisplayNumber } from '@acx-ui/rc/utils'

import Diagram                        from '../../assets/images/personal-identity-diagrams/pin-edge-switch-ap-horizontal.svg'
import { PinDetailTableGroupTabType } from '../type'

import { diagramItemInfo }   from './configs'
import { TopologyContainer } from './styledComponents'


type TextType = d3.Selection<SVGTextElement, unknown, null, undefined> | null
type ActionFrameType = d3.Selection<SVGRectElement, unknown, null, undefined> | null
type GraphRefInterface = {
  img: d3.Selection<d3.BaseType, unknown, null, undefined> | null ,
  identityFrame: ActionFrameType,
  identityLabel: TextType,
  networkFrame: ActionFrameType,
  networkLabel: TextType,
  apFrame: ActionFrameType,
  apLabel: TextType,
  distributionSwitchFrame: ActionFrameType,
  distributionSwitchLabel: TextType,
  accessSwitchFrame: ActionFrameType,
  accessSwitchLabel: TextType,
  edgeLabel: TextType
}

export interface TopologyDiagramProps {
  pinData: PersonalIdentityNetworks | undefined
  apCount: number | undefined
  identityCount: number | undefined
  onClick: (type: PinDetailTableGroupTabType) => void
  isLoading?: boolean
}

const TopologyDiagram = (props: TopologyDiagramProps) => {
  const { pinData, apCount, identityCount, onClick, isLoading = false } = props
  const { $t } = useIntl()

  const graphRef = useRef<SVGSVGElement>(null)
  const graphElemRef = useRef<GraphRefInterface>({
    img: null,
    identityLabel: null,
    identityFrame: null,
    networkLabel: null,
    networkFrame: null,
    apLabel: null,
    apFrame: null,
    distributionSwitchLabel: null,
    distributionSwitchFrame: null,
    accessSwitchLabel: null,
    accessSwitchFrame: null,
    edgeLabel: null
  })


  const getD3Instance = () => {
    return d3.select(graphRef.current)
  }

  const initControlFrameAndLabel = () => {
    const d3Object = getD3Instance()
    const refKeys = Object.keys(graphElemRef.current)

    diagramItemInfo.forEach((item) => {
      // item label
      const labelId = item.label.id

      if (refKeys.includes(labelId)) {
        const svgText = d3Object.append('text')
        Object.entries(item.label.attr).forEach(([key, value]) => svgText.attr(key, value))

        svgText.attr('data-testid', 'diagramLabel')
        svgText.style('font-size', '12px')
        svgText.style('fill', 'black')
        set(graphElemRef.current, labelId, svgText)
      }

      // item control frame
      if (!item.controlFrame) return
      const frameId = item.controlFrame.id

      if (refKeys.includes(frameId)) {
        const svgRect = d3Object.append('rect')
        Object.entries(item.controlFrame.attr).forEach(([key, value]) => svgRect.attr(key, value))
        svgRect.attr('data-testid', 'diagramControlFrame')
        svgRect.style('fill', 'transparent')
        svgRect.style('cursor', 'pointer')
        svgRect.on('click', () => onClick(item.controlFrame.type))
        set(graphElemRef.current, frameId, svgRect)
      }
    })

    graphElemRef.current['edgeLabel']?.text($t({ defaultMessage: 'RUCKUS Edge' } ))
  }

  const updatePinInfo = (data: PersonalIdentityNetworks) => {
    const wlanCount = transformDisplayNumber(data?.tunneledWlans.length)
    const asCount = transformDisplayNumber(data.accessSwitchInfos.length)
    const dsCount = transformDisplayNumber(data.distributionSwitchInfos.length)

    graphElemRef.current.networkLabel?.text(
      $t({ defaultMessage: 'Network: {wlanCount}' },
        { wlanCount })
    )

    graphElemRef.current.accessSwitchLabel?.text(
      $t({ defaultMessage: 'Access Switch: {asCount}' },
        { asCount })
    )

    graphElemRef.current.distributionSwitchLabel?.text(
      $t({ defaultMessage: 'Dist. Switch: {dsCount}' },
        { dsCount })
    )
  }

  useEffect(() => {
    if (graphElemRef.current.img) return

    const d3Object = getD3Instance()
    graphElemRef.current.img = d3Object.append('svg:image')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('data-testid', 'diagram')
      .attr('xlink:href', Diagram)

    initControlFrameAndLabel()
  }, [])

  useEffect(() => {
    if (pinData) updatePinInfo(pinData)
  }, [pinData])

  useEffect(() => {
    graphElemRef.current.apLabel?.text(
      $t({ defaultMessage: 'Access Point: {apCount}' },
        { apCount })
    )
  }, [apCount])

  useEffect(() => {
    graphElemRef.current.identityLabel?.text(
      $t({ defaultMessage: 'Identity: {identityCount}' },
        { identityCount })
    )
  }, [identityCount])

  // cannot use props.isLoading as Loader state,
  // because svg needs to be in document when initializing
  return <Loader states={[ { isLoading: false, isFetching: isLoading } ]}>
    <TopologyContainer>
      <svg ref={graphRef} width='100%' height='100%' overflow='visible' />
    </TopologyContainer>
  </Loader>
}

export default TopologyDiagram
import { useEffect, useRef } from 'react'

import * as d3     from 'd3'
import { useIntl } from 'react-intl'

// import { Loader }                   from '@acx-ui/components'
import { PersonalIdentityNetworks, transformDisplayNumber } from '@acx-ui/rc/utils'

import Diagram                        from '../../assets/images/personal-identity-diagrams/pin-edge-switch-ap-horizontal.svg'
import { PinDetailTableGroupTabType } from '../type'

type TextType = d3.Selection<SVGTextElement, unknown, null, undefined> | null
type ActionFrameType = d3.Selection<SVGRectElement, unknown, null, undefined> | null

interface TopologyDiagramProps {
  pinData: PersonalIdentityNetworks | undefined
  apCount: number
  identityCount: number
  onClick: (type: PinDetailTableGroupTabType) => void
  isLoading?: boolean
}

const TopologyDiagram = (props: TopologyDiagramProps) => {
  const { pinData, apCount, identityCount, onClick, isLoading = false } = props
  const { $t } = useIntl()
  const graphRef = useRef<SVGSVGElement>(null)
  const graphElemRef = useRef<{
    img: d3.Selection<d3.BaseType, unknown, null, undefined> | null ,
    identityFrame: ActionFrameType,
    identityText: TextType,
    networkFrame: ActionFrameType,
    networkText: TextType,
    apFrame: ActionFrameType,
    apText: TextType,
    distributionSwitchFrame: ActionFrameType,
    distributionSwitchText: TextType,
    accessSwitchFrame: ActionFrameType,
    accessSwitchText: TextType,
    edgeFrame: ActionFrameType,
    edgeText: TextType
  }>({
    img: null,
    identityText: null,
    identityFrame: null,
    networkText: null,
    networkFrame: null,
    apText: null,
    apFrame: null,
    distributionSwitchText: null,
    distributionSwitchFrame: null,
    accessSwitchText: null,
    accessSwitchFrame: null,
    edgeText: null,
    edgeFrame: null
  })


  const getD3Instance = () => {
    return d3.select(graphRef.current)
  }

  const initIdentity = () => {
    const d3Object = getD3Instance()
    graphElemRef.current.identityFrame = d3Object.append('rect')
      .attr('x', 0)
      .attr('y', 65)
      .attr('width', '75px')
      .attr('height', '60px')
      .attr('data-testid', 'diagramNode')
      .style('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('click', () => {
        console.log('click identityFrame')
        onClick(PinDetailTableGroupTabType.IDENTITY)
      })

    graphElemRef.current['identityText'] = d3Object.append('text')
      .attr('x', 5)
      .attr('y', 150)
      .style('font-size', '12px')
      .style('fill', 'black')

  }

  const initNetwork = () => {
    const d3Object = getD3Instance()
    graphElemRef.current.networkFrame = d3Object.append('rect')
      .attr('x', 75)
      .attr('y', 20)
      .attr('width', '50px')
      .attr('height', '65px')
      .attr('data-testid', 'diagramNode')
      .style('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('click', () => {
        console.log('click networkFrame')
        onClick(PinDetailTableGroupTabType.NETWORK)
      })

    graphElemRef.current['networkText'] = d3Object.append('text')
      .attr('x', 80)
      .attr('y', 10)
      .style('font-size', '12px')
      .style('fill', 'black')

  }

  const initAp = () => {
    const d3Object = getD3Instance()
    graphElemRef.current.apFrame = d3Object.append('rect')
      .attr('x', 125)
      .attr('y', 60)
      .attr('width', '85px')
      .attr('height', '60px')
      .attr('data-testid', 'diagramNode')
      .style('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('click', () => {
        console.log('click apFrame')
        onClick(PinDetailTableGroupTabType.AP)
      })

    graphElemRef.current['apText'] = d3Object.append('text')
      .attr('x', '155')
      .attr('y', '150')
      .style('font-size', '12px')
      .style('fill', 'black')
  }

  const initAccessSwitch = () => {
    const d3Object = getD3Instance()
    graphElemRef.current.accessSwitchFrame = d3Object.append('rect')
      .attr('x', 255)
      .attr('y', 60)
      .attr('width', '90px')
      .attr('height', '60px')
      .attr('data-testid', 'diagramNode')
      .style('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('click', () => {
        console.log('click accessSwitchFrame')
        onClick(PinDetailTableGroupTabType.AS)
      })

    graphElemRef.current['accessSwitchText'] = d3Object.append('text')
      .attr('x', '255')
      .attr('y', '150')
      .style('font-size', '12px')
      .style('fill', 'black')
  }

  const initDistributionSwitch = () => {
    const d3Object = getD3Instance()
    graphElemRef.current.distributionSwitchFrame = d3Object.append('rect')
      .attr('x', 395)
      .attr('y', 60)
      .attr('width', '90px')
      .attr('height', '60px')
      .attr('data-testid', 'diagramNode')
      .style('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('click', () => {
        console.log('click distributionFrame')
        onClick(PinDetailTableGroupTabType.DS)
      })

    graphElemRef.current['distributionSwitchText'] = d3Object.append('text')
      .attr('x', '400')
      .attr('y', '150')
      .style('font-size', '12px')
      .style('fill', 'black')
  }

  const initTexts = () => {
    const d3Object = getD3Instance()
    initIdentity()
    initNetwork()
    initAp()
    initDistributionSwitch()
    initAccessSwitch()

    graphElemRef.current['edgeText'] = d3Object.append('text')
      .attr('x', '535')
      .attr('y', '150')
      .style('font-size', '12px')
      .style('fill', 'black')
      .text($t({ defaultMessage: 'RUCKUS Edge' } ))
  }

  const updateInfo = (data: PersonalIdentityNetworks) => {
    console.log('pinData', data)
    const wlanCount = transformDisplayNumber(data?.tunneledWlans.length)
    const asCount = transformDisplayNumber(data.accessSwitchInfos.length)
    const dsCount = transformDisplayNumber(data.distributionSwitchInfos.length)

    graphElemRef.current.networkText?.text(
      $t({ defaultMessage: 'Network: {wlanCount}' },
        { wlanCount })
    )

    graphElemRef.current.accessSwitchText?.text(
      $t({ defaultMessage: 'Access Switch: {asCount}' },
        { asCount })
    )

    graphElemRef.current.distributionSwitchText?.text(
      $t({ defaultMessage: 'Dist. Switch: {dsCount}' },
        { dsCount })
    )
  }

  useEffect(() => {
    const d3Object = getD3Instance()

    if (graphElemRef.current.img === null) {
      graphElemRef.current.img = d3Object.append('svg:image')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('data-testid', 'diagramNode')
        .attr('xlink:href', Diagram)

      initTexts()
    }
  }, [])

  useEffect(() => {
    console.log('Diagram', pinData)
    if (pinData)
      updateInfo(pinData)
  }, [pinData])

  useEffect(() => {
    graphElemRef.current.apText?.text(
      $t({ defaultMessage: 'AP: {apCount}' },
        { apCount })
    )
  }, [apCount])

  useEffect(() => {
    graphElemRef.current.identityText?.text(
      $t({ defaultMessage: 'Identity: {identityCount}' },
        { identityCount })
    )
  }, [identityCount])

  return <svg ref={graphRef} width='100%' height='100%' />
}

export default TopologyDiagram
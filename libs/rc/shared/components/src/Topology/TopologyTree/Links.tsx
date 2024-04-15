import React, { useContext } from 'react'

import * as d3 from 'd3'

import { ConnectionStatus } from '@acx-ui/rc/utils'

import { getDeviceColor } from '../utils'

import { TopologyTreeContext } from './TopologyTreeContext'

export interface Edge {
  source: {
    data: {
      id: string;
      status: string;
    };
    depth: number;
    x: number;
    y: number;
  };
  target: {
    data: {
      id: string;
      status: string;
    };
    x: number;
    y: number;
  };
  connectionStatus: ConnectionStatus
  connectionType: string
}

interface LinksProps {
  links: Edge[];
  linksInfo: { [key: string]: Edge };
  sourceNode?: string;
  targetNode?: string;
  onClick: (node: Edge, event: MouseEvent) => void;
  onMouseLeave: () => void;
}

// eslint-disable-next-line max-len

export const Links: React.FC<LinksProps> = (props) => {
  const { links, linksInfo, onClick } = props
  const { selectedVlanPortList } = useContext(TopologyTreeContext)
  let delayHandler: NodeJS.Timeout

  const linkColor: { [key in ConnectionStatus]: string } = {
    [ConnectionStatus.Good]: 'd3-tree-good-links',
    [ConnectionStatus.Disconnected]: 'd3-tree-disconnected-links',
    [ConnectionStatus.Degraded]: 'd3-tree-degraded-links',
    [ConnectionStatus.Unknown]: 'd3-tree-unknown-links'
  }

  const markerColor: { [key in ConnectionStatus]: string } = {
    [ConnectionStatus.Good]: 'goodMarker',
    [ConnectionStatus.Disconnected]: 'disconnectedMarker',
    [ConnectionStatus.Degraded]: 'degradedMarker',
    [ConnectionStatus.Unknown]: 'unknownMarker'
  }

  const targetNodeColor: { [key in string]: string } = {
    'var(--acx-semantics-green-50)': 'd3-tree-good-links',
    'var(--acx-semantics-red-70)': 'd3-tree-disconnected-links',
    'var(--acx-semantics-yellow-40)': 'd3-tree-degraded-links',
    'var(--acx-neutrals-50)': 'd3-tree-degraded-links'
  }

  const targetNodeMarkerColor: { [key in string]: string } = {
    'var(--acx-semantics-green-50)': 'goodMarker',
    'var(--acx-semantics-red-70)': 'disconnectedMarker',
    'var(--acx-semantics-yellow-40)': 'degradedMarker',
    'var(--acx-neutrals-50)': 'degradedMarker'
  }

  const linkCustom = ({ source, target }: Edge, linksInfo: { [key: string]: Edge }) => {
    const linkInfo = linksInfo[`${source.data.id}_${target.data.id}`]
    const sourceX = linkInfo?.source?.x
    const sourceY = linkInfo?.source?.y
    const targetX = linkInfo?.target?.x
    const targetY = linkInfo?.target?.y

    if (sourceY === targetY) {
      return `M${sourceY} ${sourceX}  L${targetY} ${targetX - 100}`
    } else {
      const path = d3.path()
      path.moveTo(sourceY, sourceX)
      const isClockwise = targetY < sourceY
      path.bezierCurveTo(
        sourceY,
        sourceX + 25,
        isClockwise ? targetY - 5 : targetY + 5,
        targetX - 140,
        targetY,
        targetX - 100
      )
      return path.toString()
    }
  }

  const handleMouseEnter = (link: Edge , event: MouseEvent) => {
    delayHandler = setTimeout(() => {
      onClick(link, event)
    }, 1000)
  }

  const handleMouseLeave = () => {
    clearTimeout(delayHandler)
  }

  return (
    <g>
      <marker
        id='goodMarker'
        viewBox='0 0 10 10'
        refX='5'
        refY='5'
        markerWidth='3'
        markerHeight='3'
        className='goodMarker'>
        <circle cx='5' cy='5' r='5' />
      </marker>

      <marker
        id='degradedMarker'
        viewBox='0 0 10 10'
        refX='5'
        refY='5'
        markerWidth='3'
        markerHeight='3'
        className='degradedMarker'>
        <circle cx='5' cy='5' r='5' />
      </marker>

      <marker
        id='disconnectedMarker'
        viewBox='0 0 10 10'
        refX='5'
        refY='5'
        markerWidth='3'
        markerHeight='3'
        className='disconnectedMarker'>
        <circle cx='5' cy='5' r='5' />
      </marker>

      <marker
        id='unknownMarker'
        viewBox='0 0 10 10'
        refX='5'
        refY='5'
        markerWidth='3'
        markerHeight='3'
        className='unknownMarker'>
        <circle cx='5' cy='5' r='5' />
      </marker>
      {links.map((link) => {
        const linkInfo = linksInfo[`${link.source.data.id}_${link.target.data.id}`]
        const targetNodeStatusColor = targetNodeColor[getDeviceColor(link.target.data.status)]
        const targetNodeMarker = targetNodeMarkerColor[getDeviceColor(link.target.data.status)]
        const linkClass = linkInfo?.connectionStatus ?
          linkColor[linkInfo?.connectionStatus as ConnectionStatus] :
          (Object.values(ConnectionStatus).includes(link.target.data.status as ConnectionStatus) ?
            linkColor[link.target.data.status as ConnectionStatus] :
            targetNodeStatusColor)

        const markerClass = linkInfo?.connectionStatus ?
          markerColor[linkInfo?.connectionStatus as ConnectionStatus] :
          (Object.values(ConnectionStatus).includes(link.target.data.status as ConnectionStatus) ?
            markerColor[link.target.data.status as ConnectionStatus] :
            targetNodeMarker)

        return (
          <g
            transform={`translate(0, -${40 + 65 * link.source.depth})`}
            // eslint-disable-next-line max-len
            className={`edgePath ${linkClass} ${link.source.data.id} ${selectedVlanPortList && selectedVlanPortList.includes('link_'+link.source.data.id+'_'+link.target.data.id) && 'focusNode'}`}
            onMouseEnter={(e) => handleMouseEnter(link, e as unknown as MouseEvent)}
            onMouseLeave={handleMouseLeave}
            data-testid={`link_${link.source.data.id}_${link.target.data.id}`}
            id={`link_${link.source.data.id}_${link.target.data.id}`}
          >
            <path
              d={linkCustom(link, linksInfo)}
              markerStart={link.source.depth === 0 ? `url(#${markerClass})` : ''}
              markerEnd={`url(#${markerClass})`}
              strokeDasharray={linkInfo?.connectionType === 'Mesh' ? '1' : '0'}
            />
            <path
              d={linkCustom(link, linksInfo)}
              strokeWidth={10}
              strokeOpacity={0}
            />
          </g>
        )
      })}
    </g>
  )
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'

import * as d3 from 'd3'

import { ConnectionStatus } from '@acx-ui/rc/utils'

export interface Link {
  source: {
    data: {
      id: string;
    };
    depth: number;
  };
  target: {
    data: {
      id: string;
    };
  };
}

interface LinksProps {
  links: any[];
  linksInfo: any;
}

// eslint-disable-next-line max-len

export const Links: React.FC<LinksProps> = (props) => {
  const { links, linksInfo } = props

  const linkColor: { [key in ConnectionStatus]: string } = {
    [ConnectionStatus.Good]: 'd3-tree-good-links',
    [ConnectionStatus.Degraded]: 'd3-tree-degraded-links',
    [ConnectionStatus.Unknown]: 'd3-tree-unknown-links'
  }

  const markerColor: { [key in ConnectionStatus]: string } = {
    [ConnectionStatus.Good]: 'goodMarker',
    [ConnectionStatus.Degraded]: 'degradedMarker',
    [ConnectionStatus.Unknown]: 'unknownMarker'
  }

  const linkCustom = ({ source, target }: any,
    linksInfo: { [key: string]: any }) => {
    const linkInfo = linksInfo[`${source.data.id}_${target.data.id}`]
    const sourceX = linkInfo.source.x
    const sourceY = linkInfo.source.y
    const targetX = linkInfo.target.x
    const targetY = linkInfo.target.y

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
        targetX-100
      )
      return path.toString()
    }
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
        id='unknownMarker'
        viewBox='0 0 10 10'
        refX='5'
        refY='5'
        markerWidth='3'
        markerHeight='3'
        className='unknownMarker'>
        <circle cx='5' cy='5' r='5' />
      </marker>
      {links.map((link, i) => {
        const linkInfo = linksInfo[`${link.source.data.id}_${link.target.data.id}`]

        const linkClass = linkInfo.connectionStatus !== undefined ?
          linkColor[linkInfo.connectionStatus as ConnectionStatus] :
          linkColor[ConnectionStatus.Good]

        const markerClass = linkInfo.connectionStatus !== undefined ?
          markerColor[linkInfo.connectionStatus as ConnectionStatus] :
          markerColor[ConnectionStatus.Good]

        return (
          <g key={i}
            transform={`translate(0, -${40 + 65 * link.source.depth})`}
            className={linkClass}>
            <path
              d={linkCustom(link, linksInfo)}
              markerStart={link.source.depth === 0 ? `url(#${markerClass})` : ''}
              markerEnd={`url(#${markerClass})`}
              stroke-dasharray={link.target.data.type.includes('Mesh')?'1':'0'}
            />
          </g>
        )
      })}
    </g>
  )
}
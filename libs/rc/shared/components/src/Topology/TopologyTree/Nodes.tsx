import React, { useState, useEffect, MouseEvent, useContext } from 'react'

import { HierarchyPointNode } from 'd3'
import { useIntl }            from 'react-intl'
import { useParams }          from 'react-router-dom'

import { Tooltip }                                                         from '@acx-ui/components'
import { Features, useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { MinusCircleOutlined, PlusCircleOutlined, R1Cloud, LeafSolidIcon } from '@acx-ui/icons'
import {
  DeviceTypes,
  NodeData,
  TopologyDeviceStatus,
  PowerSavingStatusEnum,
  getPowerSavingStatusEnabledTopologyStatus
} from '@acx-ui/rc/utils'

import { getDeviceIcon, getDeviceColor, truncateLabel } from '../utils'

import { TopologyTreeContext } from './TopologyTreeContext'

interface NodeProps {
  nodes: HierarchyPointNode<NodeData>[];
  expColEvent: (nodeId: string) => void;
  onHover: (node: NodeData, event: MouseEvent) => void;
  onClick: (node: NodeData, event: MouseEvent) => void;
  onMouseLeave: () => void;
  nodesCoordinate: { [id: string]: { x: number; y: number } };
}

const Nodes: React.FC<NodeProps> = (props) => {
  const params = useParams()
  const [color, setColor] = useState<{ [id: string]: string }>({})
  let delayHandler: NodeJS.Timeout
  const { nodes, expColEvent, onHover, onClick, nodesCoordinate } = props
  const { selectedNode, selectedVlanPortList } = useContext(TopologyTreeContext)
  const { $t } = useIntl()
  const isSupportPowerSavingMode = useIsSplitOn(Features.WIFI_POWER_SAVING_MODE_TOGGLE)

  useEffect(() => {
    nodes
      .filter((node: HierarchyPointNode<NodeData>) => node.ancestors().length === 2)
      .forEach((node: HierarchyPointNode<NodeData>) => {
        const r = Math.floor(Math.random() * 255)
        const g = Math.floor(Math.random() * 255)
        const b = Math.floor(Math.random() * 255)
        setColor((prevState) => ({
          ...prevState,
          [node.data.id]: `rgb(${r}, ${g}, ${b})`
        }))
      })
  }, [nodes])

  function coordinateTransform (node: HierarchyPointNode<NodeData>) {
    return `translate(${nodesCoordinate[node.data.id].y},
      ${nodesCoordinate[node.data.id].x - 65 * node.ancestors().length})`
  }
  const handleMouseEnter = (node: HierarchyPointNode<NodeData>,
    event: React.MouseEvent<Element, globalThis.MouseEvent> |
    React.MouseEvent<SVGGElement, globalThis.MouseEvent>) => {
    if(node.data.id === 'Cloud'){
      return
    }
    delayHandler = setTimeout(() => {
      onHover(node as unknown as NodeData, event)
    }, 1000)
  }

  const handleMouseLeave = () => {
    clearTimeout(delayHandler)
  }

  const handleClick = (node: HierarchyPointNode<NodeData> ,
    event: React.MouseEvent<Element, globalThis.MouseEvent> |
    React.MouseEvent<SVGGElement, globalThis.MouseEvent>) => {
    onClick(node as unknown as NodeData, event)
    clearTimeout(delayHandler)
  }

  return (
    <g className='output d3-tree-nodes'>
      {
        nodes.map((node: HierarchyPointNode<NodeData>) => {
          const ancestorName = node.parent
            ? node
              .ancestors()
              .filter((ancestor) => ancestor.ancestors().length === 2)[0].data
              .id
            : ''
          const children = node.data?.children && node.data.children?.length > 0 ?
            `(${node.data.children.length})` :
            (node.data?._children && node.data._children?.length > 0 ?
              `(${node.data._children.length})` : '')
          const deviceType = node.data.meshRole === 'EMAP' ? DeviceTypes.ApWired : node.data.type
          const nodeName = children !== '' && node.data.id !== 'Cloud' && node.data.name ?
            node.data.name.substring(0,6)+children+'...'
            :truncateLabel(node.data.name || node.data.id, 11)
          return (
            <g
              transform={coordinateTransform(node)}
              style={{
                fill: color[ancestorName],
                cursor: node.data.id !== 'Cloud' ? 'pointer' : 'default'
              }}
              // eslint-disable-next-line max-len
              className={`node tree-node ${(params?.switchId === node.data.id || params?.apId === node.data.id || selectedNode === node.data.id) && 'focusNode'} ${selectedVlanPortList && selectedVlanPortList.includes(node.data.id) && 'focusNode'}`
              }
              id={node.data.id}
              key={node.data.id}
            >
              <g
                onMouseEnter={(e) => handleMouseEnter(node, e)}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => handleClick(node, e)}
                data-testid={`node_${node.data.id}`}
              >
                <circle cx='0' cy='0' r='15' className={`${node.data.status}-circle`} />
                <g className={`${node.data.status}-icon`}>
                  {node.parent ? (
                    getDeviceIcon(deviceType as DeviceTypes,
                      node.data.status as TopologyDeviceStatus)
                  ) : (
                    <R1Cloud width={24} height={24} x={-12} y={-12} />
                  )}
                </g>
                <g>
                  <text
                    className='node-text'
                    style={{
                      fontSize: '6px',
                      stroke: node.data.status ? getDeviceColor(node.data.status) : 'black',
                      fill: node.data.status ? getDeviceColor(node.data.status) : 'black'
                    }}
                    dominantBaseline='middle'
                    textAnchor='middle'
                    dy='13'
                  >
                    {nodeName}
                  </text>
                </g>
              </g>
              {node.data.id !== 'Cloud' && node.data.children?.length > 0 && (
                <g onClick={(e) => {
                  e.preventDefault()
                  expColEvent(node.data.id)
                }}
                data-testid='collapseButton'
                >
                  <MinusCircleOutlined
                    width={10}
                    height={10}
                    x={-5}
                    y={22}
                    style={{ fill: 'white' }}
                  />
                </g>
              )}
              {node.data?._children && node.data._children?.length > 0 && (
                <g onClick={(e) => {
                  e.preventDefault()
                  expColEvent(node.data.id)
                }}
                data-testid='expandButton'>
                  <PlusCircleOutlined
                    width={10}
                    height={10}
                    x={-5}
                    y={22}
                    id={node.data.id}
                    style={{ fill: 'white' }}
                  />
                </g>
              )}
              {isSupportPowerSavingMode && getPowerSavingStatusEnabledTopologyStatus(
                node.data.status as TopologyDeviceStatus,
                node.data.powerSavingStatus as PowerSavingStatusEnum) &&
                <Tooltip
                  title={$t(
                    { defaultMessage: 'Device is controlled by Energy Saving AI. '
                      + 'Radio may not be broadcasting.' }
                  )}
                  placement='bottom'
                >
                  <LeafSolidIcon
                    x={nodeName.length*3/2 + (nodeName.includes('...') ? 0:2)}
                    y={9}
                    width={6}
                    height={6}
                  />
                </Tooltip>
              }
            </g>
          )
        })}
    </g>
  )
}

export default Nodes

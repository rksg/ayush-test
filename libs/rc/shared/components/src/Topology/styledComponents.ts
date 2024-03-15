import { createElement } from 'react'

import { Divider, Space } from 'antd'
import styled             from 'styled-components'

import { Button, Modal }          from '@acx-ui/components'
import { TagsOutline, TagsSolid } from '@acx-ui/icons'
import { TopologyDeviceStatus }           from '@acx-ui/rc/utils'

import { getDeviceColor } from './utils'


export const Graph = styled('svg')`
.node rect {
    stroke: none;
    fill: #fff;
    stroke-width: 1.5px;
  }
  .node {
    cursor: pointer;

    .label {
      pointer-events: none
    }
  }

  .edgePath path {
    stroke: #333;
    stroke-width: 2px;
    cursor: pointer;
  }`

export const Device = styled('div')<{ deviceStatus: TopologyDeviceStatus }>`
   svg {
     color: ${props => getDeviceColor(props.deviceStatus)};
   }
  `
export const FullScreenButtonsContainer = styled(Space).attrs({
  size: 0,
  direction: 'vertical',
  split: createElement(Divider, {
    style: {
      lineHeight: '0px',
      margin: '0px',
      borderTop: '1px solid var(--acx-neutrals-30)'
    }
  })
})`
    position: absolute;
    cursor: pointer;
    top: 0;
    z-index: 1;
    right: 15px;
  `
export const ImageButtonsContainer = styled(Space).attrs({
  size: 0,
  direction: 'vertical',
  split: createElement(Divider, {
    style: {
      lineHeight: '0px',
      margin: '0px',
      borderTop: '1px solid var(--acx-neutrals-30)'
    }
  })
})`
    position: absolute;
    bottom: 100px;
    z-index: 1;
    right: 15px;
    border: 1px solid var(--acx-neutrals-30);
    border-radius: 4px;
    
    .ant-space-item {
      background-color: var(--acx-neutrals-10)
    }
  `

export const WirelessRadioTableContainer = styled('div')`
  background: var(--acx-neutrals-10);
  padding: 2px;
`

export const TextHeader = styled.div`
  display: grid;
  grid-template-columns: auto 25% 26% 25%;
  text-align: center;
  align-items: center;
  line-height: var(--acx-body-6-line-height);
  > span, label {
    padding-bottom: 5px;
    > span {
      font-size: var(--acx-body-5-font-size);
      display: block;
    }
  }
`

export const TextNumber = styled.div`
  display: grid;
  grid-template-columns: auto 25% 26% 25%;
  border-top: 1px solid var(--acx-neutrals-30);
  > span {
    text-align: center;
    padding: 6px 0;
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
  }
  > label {
    padding: 6px;
    .ant-typography {
      font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
      margin-bottom: 0;
    }
  }
`

export const NodeTitle = styled(Button)`
span {
    width: 288px;
    display: inline-block;
    flex: 1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}
`
export const Topology = styled.div`
font-family: sans-serif;
text-align: center;
width: 100%;
height: 100%;

.d3-tree-container {
  width: 100%;
  height: 100%;

  svg {
    width: 100%;
    height: 100%;
  }
  
  .d3-tree-main{
    .tree-node{
      .node-text {
        stroke-width: 0.05
      }
      .undefined-circle {
        fill: none;
      }
      .Operational-circle {
        fill: none;
      }
      .Degraded-circle {
        fill: none;
      }
      .Disconnected-circle {
        fill: none;
      }
      .Unknown-circle {
        fill: none;
      }
    }

    .tree-node.focusNode, .tree-node:hover{
      .undefined-circle {
        fill: var(--acx-accents-orange-30);
        opacity: 0.2;
      }
      .Operational-circle {
        fill: var(--acx-semantics-green-50);
        opacity: 0.2;
      }
      .Degraded-circle {
        fill: var(--acx-semantics-yellow-40);
        opacity: 0.2;
      }
      .Disconnected-circle {
        fill: var(--acx-semantics-red-70);
        opacity: 0.2;
      }
      .Unknown-circle {
        fill: var(--acx-neutrals-50);
        opacity: 0.2;
      }
      .node-text {
        stroke-width: 0.25;
      }
    }

    .d3-tree-good-links {
      cursor: pointer;
      fill: none;
      stroke: var(--acx-semantics-green-50);
      stroke-width: 0.7;
    }

    .d3-tree-good-links.Cloud{
      cursor: default;
    }

    .d3-tree-good-links:hover {
      filter: drop-shadow(0 0 1px var(--acx-semantics-green-50));
    }

    .d3-tree-degraded-links {
      cursor: pointer;
      fill: none;
      stroke: var(--acx-semantics-yellow-40);
      stroke-width: 0.7;
    }

    .d3-tree-degraded-links.Cloud{
      cursor: default;
    }

    .d3-tree-degraded-links:hover {
      filter: drop-shadow(0 0 1px var(--acx-semantics-yellow-40));
    }

    .d3-tree-disconnected-links {
      cursor: pointer;
      fill: none;
      stroke: var(--acx-semantics-red-70);
      stroke-width: 0.7;
    }

    .d3-tree-disconnected-links.Cloud{
      cursor: default;
    }

    .d3-tree-disconnected-links:hover {
      filter: drop-shadow(0 0 1px var(--acx-semantics-red-70));
    }

    .d3-tree-unknown-links {
      cursor: pointer;
      fill: none;
      stroke: var(--acx-neutrals-50);
      stroke-width: 0.7;
    }
  
    .d3-tree-unknown-links.Cloud{
      cursor: default;
    }

    .d3-tree-unknown-links:hover {
      filter: drop-shadow(0 0 1px var(--acx-neutrals-50));
    }

    .rect-test {
      transform: rotateZ(90);
      stroke: var(--acx-semantics-green-50);
      stroke-opacity: 1;
    }

    .rect-text {
      font-size: 8px;
      stroke-width: 0;
      fill: white;
    }

    .text-time-stamp {
      font-size: 6px;
      stroke-width: 0;
      fill: #aaa;
    }

    .goodMarker {
      fill: var(--acx-semantics-green-50);
    }

    .degradedMarker {
      fill: var(--acx-semantics-yellow-40);
    }

    .disconnectedMarker {
      fill: var(--acx-semantics-red-70);
    }

    .unknownMarker {
      fill: var(--acx-neutrals-50);
    }
  }
}
`


export const TopologyGraphModal = styled(Modal)`
  .TopologyGraphContainer{
    height: calc(100vh - 220px);
    padding: 20px;
  }
  .ant-modal-footer{
    display: none;
  }
`

export const TagsOutlineIcon = styled(TagsOutline)`
  width: 12px;
  height: 14px;
  vertical-align: middle;
  path {
    fill: var(--acx-primary-black);
  }
`

export const TagsSolidIcon = styled(TagsSolid)`
  width: 12px;
  height: 14px;
  vertical-align: middle;
  margin-top: 5px;
  path {
    fill: var(--acx-primary-black);
  }
`
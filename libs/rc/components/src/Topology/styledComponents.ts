import { createElement } from 'react'

import { Divider, Space } from 'antd'
import styled             from 'styled-components'

import { DeviceStatus } from '@acx-ui/rc/utils'

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

export const Device = styled('div')<{ deviceStatus: DeviceStatus }>`
   svg {
     width: 32px !important;
     height: 32px !important;


    color: ${props => getDeviceColor(props.deviceStatus)};

   }
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
  `

export const WirelessRadioTableContainer = styled('div')`
.ant-table.ant-table-small {
  font-size: inherit !important;
}
.ant-table-cell {
  background: var(--acx-neutrals-10);
}
`
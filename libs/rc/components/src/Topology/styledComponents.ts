import { createElement } from 'react'

import { Divider, Space } from 'antd'
import styled             from 'styled-components'

import { Button }       from '@acx-ui/components'
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
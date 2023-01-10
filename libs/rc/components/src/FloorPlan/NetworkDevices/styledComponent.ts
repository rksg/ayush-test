/* eslint-disable max-len */
import styled from 'styled-components'

import { deviceCategoryColors } from '@acx-ui/components'

const rougeTypeColors = {
  malicious: deviceCategoryColors.Malicious,
  ignored: deviceCategoryColors.Ignored,
  unclassified: deviceCategoryColors.Unclassified,
  known: deviceCategoryColors.Known
}

function getRougeTypeCss () {
  let str = ''
  Object.keys(rougeTypeColors).forEach((rougeType) => {
    str += `&.${rougeType} {
      background-color: var(${rougeTypeColors[rougeType as keyof typeof rougeTypeColors]});
    }
    `
  })
  return str
}

function getRougeTypeBorderCss () {
  let str = ''
  Object.keys(rougeTypeColors).forEach((rougeType) => {
    str += `&.${rougeType} {
      border-color: var(${rougeTypeColors[rougeType as keyof typeof rougeTypeColors]});
    }
    `
  })
  return str
}

function getRougeApMarkerCss () {
  let str = ''
  Object.keys(rougeTypeColors).forEach((rougeType) => {
    str += `&.ap-rogue-type-${rougeType} {
      background-color: var(${rougeTypeColors[rougeType as keyof typeof rougeTypeColors]});
    }
    `
  })
  return str
}

export const DeviceContainer = styled('div')`
&.device-container {
  z-index: 3;
  width: 36px;
  height: 36px;
  position: absolute;
  &:not(.context-Unplaced) {
    margin: -21px 0 0 -21px;
  }

  &.context-Album {
    width:6px;
    height:6px;
    margin: -3px 0 0 -3px;
  }

  svg {
    transform: rotate(45deg);
  }
  
  .marker {
    border: 3px solid white;
    box-shadow: -2px 0px 4px -1px rgba(0, 0, 0, 0.75);
    z-index: 1;
    width: 100%;
    height: 100%;
    border-radius: 50% 50% 50% 0;
    position: absolute;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
    cursor: 'pointer';

    path {
      fill: var(--acx-primary-white);
      stroke: var(--acx-neutrals-50);
    }

    &.ap-status-severity-critical {
      background-color: var(--acx-semantics-red-70) !important;
    }

    &.ap-status-severity-cleared {
      background-color: var(--acx-semantics-green-50) !important;
    }

    &.ap-status-severity-attention {
      background-color: var(--acx-neutrals-50) !important;
    }

    &.ap-status-severity-critical {
      background-color: var(--acx-semantics-red-50) !important;
    }

    &.ap-status-severity-minor {
      background-color: var(--acx-semantics-yellow-50) !important;
    }

    &.ap-rogue-type-offline {
      opacity: .3;
    }

    &.switch-status-never-contacted-cloud {
      background-color: var(--acx-neutrals-50) !important;
    }
    &.switch-status-operational {
      background-color: var(--acx-semantics-green-50) !important;
    }
    &.switch-status-disconnected {
      background-color: var(--acx-semantics-red-50) !important;
    }

    &.cloudpath-server {
      background-color: var(--acx-semantics-green-50) !important;
    }

    ${getRougeApMarkerCss()}

    &:after {
      position: relative;
      border-radius: 50%;
      font-family: ruckus;
      color: white;
      font-size: 26px;
      bottom: 5px;
      left: 4px;
      position: absolute;
      -webkit-transform: rotate(41deg);
      transform: rotate(41deg);
    }
  }

  &:not(.context-Venue):not(.context-Unplaced):not(.context-Ap):not(.context-LteAp):not(.context-Switch):not(.gallery):not(.context-RogueAp) {
    .marker {
      border-radius: 50% 50% 50% 50%;
      border: 0;

      &:not(.gallery-mode):after {
        content: '';
      }

      &.gallery-mode:after {
        bottom: 7px;
        left: 7px;
      }
    }
  }
  &.gallery {
    width: 24px;
    height: 24px;
    .marker {

      border-radius: 50% 50% 50% 50%;
      border: 0;
      padding: 4px;

      &.ap, &.LTEAP, &.switches, &.CloudpathServer {
        &:after {
          font-size: 20px;
          bottom: 2px;
          left: 1px;
        }
      }
    }
  }
}
`
export const RougeApContainer = styled('div')`
&.rogue-snr {
  z-index: 2;
  width: 168px;
  height: 168px;
  position: absolute;
  border-radius: 50%;
  opacity: .2;

  &:not(.context-Unplaced) {
    margin: -84px 0 0 -84px;
  }

  ${getRougeTypeCss()}

  &.ap-rogue-snr-over-40-db {
    opacity: .4;
  }

  &.ap-rogue-snr-26-40-db {
    opacity: .3;
  }

  &.ap-rogue-snr-16-25-db {
    opacity: .2;
  }

  &.ap-rogue-snr-0-15-db {
    opacity: .1;
  }
}

`

export const RougeApIcon = styled('span')`
  position: relative;
  display: inline-block;
  top: 0px;
  width: 8px;
  height: 8px;
  border-radius: 50%;

  ${getRougeTypeCss()}
`

export const SpecificRougeAp = styled('div')`
.wifi-signal-snr {
  margin-left: 2px;
  display: inline-block;
  font-size: 0;

  position: relative;
  width: 16px;
  height: 16px;
  top: 2px;

  .bar {
    position: absolute;
    background: #7f7f7f;
    border-top-right-radius: 100%;
    border-right: 1px solid rgba(51, 51, 51, .9);
    border-top: 1px solid rgba(51, 51, 51, .9);

    &.activated {
      background-color: var(--acx-primary-white);
    }
  }

  .bar1 {
    width: 80%;
    height: 80%;
    top: 20%;
  }

  .bar2 {
    width: 60%;
    height: 60%;
    top: 40%;
  }

  .bar3 {
    width: 40%;
    height: 40%;
    top: 60%;
  }

  .bar4 {
    width: 20%;
    height: 20%;
    top: 80%;
  }
}
`

export const RougeApCountBadge = styled('div')`
&.mark-number-rogue {
  border: 3px solid;
  background-color: var(--acx-primary-white);
  color: black;
  z-index: 2;
  width: 60%;
  height: 60%;
  border-radius: 50%;
  position: absolute;
  transform: translate(100%, -30%);
  text-align: center;
  line-height: 200%;
  font-size: 8px;

  ${getRougeTypeBorderCss()}
}
`
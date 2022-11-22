/* eslint-disable max-len */
import styled from 'styled-components'

export const DeviceContainer = styled('div')`
&.device-container {
  z-index: 3;
  width: 36px;
  height: 36px;
  position: absolute;

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
  &.context-Album {
    width:6px;
    height:6px;
    margin: 6px 0 0 6px;
  }
}
`
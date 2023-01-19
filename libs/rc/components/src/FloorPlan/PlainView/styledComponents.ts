import React from 'react'

import { Card, Divider, Space } from 'antd'
import styled                   from 'styled-components'

import { Button, deviceCategoryColors } from '@acx-ui/components'

import { ImageMode } from './PlainView'

export const StyledSpace = styled(Space)`
  scroll-behavior: smooth;
  overflow-x: scroll;
  width: 100%;
  height: 80px;
  overflow-y: hidden;
  overflow: overlay;
`

export const StyledCardGrid = styled(Card.Grid)<{ active: number }>`
  width: 100px;
  padding: 6px;
  border-radius: 4px;
  height: 68px;
  border: 1px solid;
  border-color: var(${props => props.active ? '--acx-accents-orange-55' : '--acx-neutrals-30'});
  box-shadow: none;
`

export const GallaryWrapper = styled(Space)`
  padding-right: 4px;
`
export const GallaryIcon = styled(Button)`
  border: 1px solid var(--acx-neutrals-30);
  height: 68px;
  width: 28px;

  svg {
    width: 18px;
    height: 18px;
  }
`
export const ImageDesc = styled('div')<{ active: number }>`
  position: absolute;
  width: 100px;
  height: 20px;
  top: 48px;
  opacity: 0.95;
  border-radius: 0px 0px 4px 4px;
  color: var(--acx-primary-white);
  text-align: center;
  font-style: normal;
  font-weight: var(--acx-subtitle-6-font-weight);
  font-size: var(--acx-subtitle-6-font-size);
  line-height: var(--acx-subtitle-4-line-height);
  background: var(${props => props.active ? '--acx-accents-orange-55' : '--acx-neutrals-80'});
`

export const Thumbnail = styled('div')`
  position: relative;
  cursor: pointer;
`

export const ImageContainerWrapper = styled('div')`
  margin: 30px auto 20px;
  position: relative;
  display: block;
  overflow: auto;
  width: 100%;
  height: 280px;
  max-width: 100%;
  max-height: 100%;
  padding-right: 35px;
`

export const ImageContainer = styled('div')< { currentZoom: number, imageMode: ImageMode } >`
  width: calc(${props => 100 * props.currentZoom}%);
  position: relative;
  margin: 0 auto;
`
export const ImageLoaderContainer = styled('div')`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0 auto;
  display: flex;
`
export const ImageButtonsContainer = styled(Space).attrs({
  size: 0,
  direction: 'vertical',
  split: React.createElement(Divider, {
    style: {
      lineHeight: '0px',
      margin: '0px',
      borderTop: '1px solid var(--acx-neutrals-30)'
    }
  })
})<{ alignbottom: number }>`
  position: absolute;
  bottom: ${ props => props.alignbottom ? '88px' : '135px' };
  z-index: 1;
  right: 15px;
  border: 1px solid var(--acx-neutrals-30);
  border-radius: 4px;
`
export const RogueAPHelpIcon = styled('div')`
&.rogue-help-info {
  position: absolute;
  bottom: 30px;
  left: 20px;
  z-index: 2;

  svg path {
    stroke: var(--acx-primary-white)
  }
}
`

export const TooltipContent = styled('div')`

  .rogue-help {
  line-height: 20px;
  margin-bottom: 8px;

  .rogue-mark {
    border: 1px solid var(--acx-primary-white);
    z-index: 1;
    width: 16px;
    height: 16px;
    border-radius: 50% 50% 50% 0;
    position: absolute;
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);

    svg {
      width: 12px;
      height: 12px;
      transform: rotate(45deg);

      path {
        stroke: var(--acx-primary-white)
      }
    }

    &.malicious {
      background-color: var(${deviceCategoryColors.Malicious});
    }

    &.ignored {
      background-color: var(${deviceCategoryColors.Ignored});
    }

    &.unclassified {
      background-color: var(${deviceCategoryColors.Unclassified});
    }

    &.known {
      background-color: var(${deviceCategoryColors.Known});
    }
  }

  .info {
    padding-left: 25px;
  }
  
}
`

import { Card, Space } from 'antd'
import styled          from 'styled-components'

import { Button } from '@acx-ui/components'

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
    padding: 9px 13px 6px;
    border-radius: 4px;
    height: 68px;
    border: 1px solid;
    border-color: ${ props => props.active ?
    'var(--acx-accents-orange-55)'
    : 'var(--acx-neutrals-30)'};
    box-shadow: none;
`

export const GallaryWrapper = styled(Space)`
    padding-right: 4px;
`
export const GallaryIcon = styled(Button)`
    border: 1px solid 'var(--acx-neutrals-30)';
    height: 68px;
    width: 28px;
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
    background: ${ props => props.active
    ? 'var(--acx-accents-orange-55)' : 'var(--acx-neutrals-80)'};
`

export const Thumbnail = styled('div')`
    position: relative;
    cursor: pointer;
`

export const ImageContainerWrapper = styled('div')`
    margin: 30px auto 20px;
    position: relative;
    display: block;
    overflow: overlay;
    width: 100%;
    height: 460px;
    max-width: 100%;
    max-height: 100%;
    padding-right: 35px;
`

export const ImageContainer = styled('div')< { currentZoom: number, imageMode: ImageMode } >`
    width: calc(${props => 100 * props.currentZoom}%);
    position: relative;
    margin: 0 auto;
    height: ${props => props.imageMode === ImageMode.FIT ? '100%' : 'auto'};
    padding: 30px auto;
    max-height: 100%;
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
export const ImageButtonsContainer = styled('div')`
    position: absolute;
    bottom: 88px;
    right: 0;
    display: flex;
    flex-direction: column;
`
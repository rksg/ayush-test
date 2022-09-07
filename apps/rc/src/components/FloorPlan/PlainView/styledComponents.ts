import { Card, Space } from 'antd'
import styled          from 'styled-components'

import { Button } from '@acx-ui/components'

export const StyledSpace = styled(Space)`
    scroll-behavior: smooth;
    overflow-x: scroll;
    width: 100%;
    height: 80px;
`

export const StyledCardGrid = styled(Card.Grid)<{ active: boolean }>`
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
export const ImageDesc = styled('div')<{ active: boolean }>`
    position: absolute;
    width: 100px;
    height: 20px;
    top: 48px;
    opacity: 0.95;
    border-radius: 0px 0px 4px 4px;
    color: #ffffff;
    text-align: center;
    font-family: 'Open Sans';
    font-style: normal;
    font-weight: 400;
    font-size: 10px;
    line-height: 20px;
    background: ${ props => props.active
    ? 'var(--acx-accents-orange-55)' : 'var(--acx-neutrals-80)'};
`

export const Thumbnail = styled('div')`
    position: relative;
    cursor: pointer;
`

export const ImageContainerWrapper = styled('div')`
    margin: 30px 0;
    position: relative;
    display: block;
    overflow: scroll;
    width: 100%;
    height: 400px;
    max-width: 100%;
    max-height: 100%;
`

export const ImageContainer = styled('div')< { currentZoom: number } >`
    width: calc(${props => 100 * props.currentZoom}%);
    position: relative;
    margin: 0 auto;
    height: 100%;
    padding: 30px auto;
    max-height: 100%;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`
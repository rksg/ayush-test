import styled from 'styled-components/macro'

import { Typography, Card as AntCard } from 'antd'

import { Card }               from '@acx-ui/components'
import { SettingsSolid } from '@acx-ui/icons'

export const Setting = {
  Icon: styled(SettingsSolid)`
    width: 24px;
    height: 24px;
  `,
  Line: styled.div`
    border-bottom: 1px solid var(--acx-neutrals-25);
    margin: 16px 0;
    display: block;
    width: 100%;
    height: 2px;
  `
}

export const SliderLabel = styled.div`
  padding-top: 5px;
  color: var(--acx-neutrals-60);
`

export const Buttons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: var(--acx-modal-footer-small-button-space);
  padding: var(--acx-modal-footer-small-padding);
`

export const Spacer = styled.div`
  padding-top: 5px;
  height: 5px;
`

export const IconWrapper = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 100%;
`

export const ListWrapper = styled.div<{ $showCursor: boolean }>`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: ${props => props.$showCursor
    ? 'pointer'
    : 'default'};
  white-space: nowrap;
  min-height: 48px;
`

export const ListContainer = styled.div`
  overflow: hidden;
`

export const HighlightedIcon = styled.div<{ $highlight?: boolean }>`
  ${props => props.$highlight
    ? 'color: var(--acx-neutrals-60);'
    : 'color: var(--acx-neutrals-40);'}
`

export const ValueWrapper = styled.div`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-2-font-size);
  line-height: var(--acx-headline-2-line-height);
  font-weight: var(--acx-headline-4-font-weight-bold);
  color: var(--acx-primary-black);
  display: flex;
  justify-content: center;
  padding-top: 10px;
`

export const ChangeWrapper = styled.span<{ $isNegative: boolean }>`
  padding-left: 10px;
  font-size: var(--acx-headline-4-font-size);
  ${props => props.$isNegative
    ? 'color: var(--acx-semantics-red-40)'
    : 'color: var(--acx-semantics-green-40)'}
`

export const SubtitleWrapper = styled.div`
  font-family: var(--acx-neutral-brand-font);
  color: var(--acx-neutrals-50);
  text-align: center;
`

export const ChartWrapper = styled.div`
  flex: 1;
`

export const SliderWrapper = styled.div`
  height: 300px;
`

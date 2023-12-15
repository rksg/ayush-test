import styled from 'styled-components/macro'

import { SettingsSolid } from '@acx-ui/icons'

export const ComplianceSetting = {
  Icon: styled(SettingsSolid)`
    position: absolute;
    right: 10px;
    top: 10px;
    cursor: pointer;
  `,
  Wrapper: styled.div`
    margin-bottom: 20px
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

export const ListWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  cursor: pointer;
  white-space: nowrap;
`

export const HighlightedIcon = styled.div<{ $highlight?: boolean }>`
  ${props => props.$highlight
    ? 'color: var(--acx-neutrals-60);'
    : 'color: var(--acx-neutrals-40);'}
`

export const ValueWrapper = styled.div`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-headline-1-font-size);
  font-weight: var(--acx-body-font-weight-bold);
  color: var(--acx-neutrals-50);
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

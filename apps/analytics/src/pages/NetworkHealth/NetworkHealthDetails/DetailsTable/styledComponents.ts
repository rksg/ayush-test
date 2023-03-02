import styled, { css } from 'styled-components/macro'

export type TrendType = 'success' | 'fail' | 'n/a' | 'error'


const badgeColor = ({ type }: { type: TrendType }) => {
  switch (type) {
    case 'success': return '--acx-semantics-green-50'
    case 'fail': return '--acx-semantics-red-50'
    case 'n/a': return '--acx-neutrals-50'
    case 'error': return '--acx-accents-orange-50'
  }
}
const textStyle = css`
  font-family: var(--acx-neutral-brand-font);
  font-size: var(--acx-subtitle-6-font-size);
  color: var(--acx-primary-white);
`
export const ColumnAnchorText = styled.div`
    white-space: nowrap;
    width: 125px;
    overflow: hidden;
    text-overflow: ellipsis;
`
export const Badge = styled.span`
  display: inline-block;
  border-radius: 10px;
  padding: 3px 8px;
  background-color: var(${badgeColor});
  line-height: var(--acx-subtitle-6-line-height);
  ${textStyle}
  font-weight: var(--acx-subtitle-6-font-weight-bold);
  cursor: default;
`

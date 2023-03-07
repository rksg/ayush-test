import styled, { css } from 'styled-components/macro'

import { EyeOpenSolid } from '@acx-ui/icons'

export type TrendType = 'success' | 'fail' | 'n/a' | 'error'

export const Eye = styled(EyeOpenSolid)`
  transform: scale(1.75);
  path:nth-child(1){
    stroke: currentColor;
  }
  path:nth-child(2){
    fill: currentColor;
  }
  path:nth-child(3){
    stroke: currentColor;
  }
`

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

import styled, { css } from 'styled-components/macro'
import { ArrowChevronLeft, ArrowChevronRight } from '@acx-ui/icons'

const arrowStyle = css`
  path {
    stroke: var(--acx-primary-black);
  }
  width: 24px;
  height: 24px;
  vertical-align: middle;
`
export const LeftArrow = styled(ArrowChevronLeft)`
  ${arrowStyle}
  stroke-width: 2px;
  `
export const RightArrow = styled(ArrowChevronRight)`
  ${arrowStyle}
  stroke-width: 2px;
  `
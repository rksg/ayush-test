import styled from 'styled-components/macro'

export const ApplyOnboardOnlySpan = styled.span`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  margin-left: 5px;
  margin-right: 5px;
  display: inline-block;
`

export const Hint = styled.span`
  display: inline-block;
  line-height: var(--acx-body-4-line-height);
  align-items: center;
  svg {
    height: 16px;
    width: 16px;
    margin-left: 3px;
    color: var(--acx-primary-white);
    path {
      stroke: var(--acx-neutrals-70);
    }
  }
`
import styled from 'styled-components'

export const ContentWrapper = styled.div`
  flex: 1;
  p {
    font-family: var(--acx-neutral-brand-font);
    font-weight: var(--acx-body-3-font-weight);
    font-size: var(--acx-body-3-font-size);
    line-height: var(--acx-body-3-line-height);
    color: var(--acx-primary-black);
  }
  svg {
    width: 36px;
    height: 36px;
  }
`
export const NoDataWrapper = styled.div`
  padding: 16px 16px;
`
import styled, { createGlobalStyle } from 'styled-components'

export const ContentWrapper = styled.div`
  flex: 1;
  p {
    font-family: var(--acx-neutral-brand-font);
    font-weight: var(--acx-body-4-font-weight);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
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
export const HighlightCardTitle = createGlobalStyle`
  .highlight-card-title {
    .ant-space-item:first-child > div {
      font-family: var(--acx-accent-brand-font);
      font-size: var(--acx-headline-5-font-size);
      line-height: var(--acx-headline-5-line-height);
      color: var(--acx-primary-black);
      font-weight: var(--acx-headline-5-font-weight-bold);
    }
  }
`
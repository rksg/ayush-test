import styled from 'styled-components'

export const SummaryType = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  flex-basis: 0;
  text-align: center;
  line-height: 1;
  &:not(:first-of-type) {
    border-left: 1px solid var(--acx-neutrals-30);
  }
  padding-top: 10px;
  margin-bottom: 50px;
`

export const Summary = styled.div`
  display: block;
  margin-right: 20px;
`

export const SummaryCount = styled.div`
  font-size: var(--acx-headline-2-font-size);
  font-weight: var(--acx-body-font-weight-bold);
  line-height: var(--acx-headline-2-line-height);
  font-family: var(--acx-accent-brand-font);
`

export const SummaryList = styled.div`
  color: var(--acx-primary-black);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  > div {
    text-align: left;
    > * { vertical-align: middle; }
    span { margin-left: 6px; }
  }
  > span { padding-left: 4px; }
`

export const SummaryTitle = styled.div`
  margin-top: 4px;
  font-size: var(--acx-subtitle-4-font-size);
  font-weight: var(--acx-subtitle-4-font-weight);
  line-height: var(--acx-subtitle-4-line-height);
`

export const SummaryDetails = styled.div`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
`

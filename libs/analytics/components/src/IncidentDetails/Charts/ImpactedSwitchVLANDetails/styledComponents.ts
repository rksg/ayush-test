import styled from 'styled-components'

export const SummaryWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

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
  margin-bottom: 30px;
`

export const Summary = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-right: 20px;
`

export const SummaryCount = styled.div`
  font-size: var(--acx-headline-2-font-size);
  font-weight: var(--acx-headline-2-font-weight-bold);
  line-height: var(--acx-headline-2-line-height);
  font-family: var(--acx-accent-brand-font);
`

export const SummaryList = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: var(--acx-primary-black);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  text-align: left;
  > div {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 24px;
    svg[width="32"] { margin-left: -2px; } // switch icon has extra space around
    span { margin-left: 6px; }
  }
  > span {
    line-height: 24px;
    padding-left: 3px;
  }
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

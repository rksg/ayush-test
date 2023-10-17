import styled from 'styled-components'

export const SummaryType = styled.div`
  display: flex;
  justify-content: center;
  flex-grow: 1;
  flex-basis: 0;
  text-align: center;
  line-height: 1;
  &:not(:first-of-type) {
    border-left: 1px solid rgba(0, 0, 0, .2);
  }
  padding-bottom: 10px;
`

export const Summary = styled.div`
  display: block;
  margin-right: 20px;
`

export const SummaryCount = styled.div`
  font-size: var(--acx-headline-2-font-size);
  font-weight: var(--acx-body-font-weight-bold);
`

export const SummaryList = styled.div`
  font-size: var(--acx-body-4-font-size);
  font-weight: var(--acx-body-font-weight-bold);
  line-height: 1.5;
  & > div {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: left;
    & > span:last-child {
      opacity: 0.6;
    }
  }
`

export const SummaryTitle = styled.div`
  margin-top: 10px;
  font-size: var(--acx-body-3-font-size);
  font-weight: 550;
`

export const SummaryDetails = styled.div`
  margin-top: 6px;
  font-size: var(--acx-body-4-font-size);
`

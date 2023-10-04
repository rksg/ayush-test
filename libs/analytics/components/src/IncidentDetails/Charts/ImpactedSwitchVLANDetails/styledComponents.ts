import styled from 'styled-components'

export const SummaryType = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-basis: 0;
  text-align: center;
  line-height: 1;
  &:not(:first-of-type) {
    border-left: 1px solid black;
  }
  padding-bottom: 10px;
`

export const Summary = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
`

export const SummaryCount = styled.div`
  font-size: 3.5rem;
  margin-right: 20px;
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
  margin-top: 20px;
  font-size: var(--acx-body-3-font-size);
  font-weight: var(--acx-body-font-weight-bold);
`

export const SummaryDetails = styled.div`
  margin-top: 8px;
  font-size: var(--acx-body-4-font-size);
  opacity: 0.6;
`

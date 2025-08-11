import { Space } from 'antd'
import styled    from 'styled-components/macro'


export const OntHeader = styled.div`
  display: flex;
  margin-bottom: 4px;
  justify-content: space-between;
`

export const OntHeaderContent = styled(Space)`
  flex-direction: column;
  gap: 4px !important;
  align-items: flex-start;
`

export const OntTitle = styled.div`
  font-size: var(--acx-headline-4-font-size);
  font-family: var(--acx-accent-brand-font);
  font-weight: var(--acx-headline-3-font-weight);
  line-height: var(--acx-headline-4-line-height);
`
export const OntInfo = styled(Space)`
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
`

export const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0px !important;
  button {
    display: flex;
    &:after {
      content: '';
      display: block;
      width: 1px;
      height: 16px;
      background-color: var(--acx-neutrals-40);
      margin: 0 10px;
    }
    &:last-child {
      &:after {
        display: none;
      }
    }
  }
`
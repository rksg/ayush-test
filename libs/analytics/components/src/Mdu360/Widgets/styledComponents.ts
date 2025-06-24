import styled from 'styled-components/macro'

export const ContentSwitcherWrapper = styled.div`
  margin-top: -38px;
  margin-bottom: 16px;
`

export const ColumnWrapper = styled.div`
  display: flex;
  align-items: flex-start;
`

export const ColumnHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
`

export const ColumnItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

export const ColumnItemIconWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ColumnValue = styled.span`
  white-space: nowrap;
  font-weight: var(--acx-body-font-weight-bold);
  padding-left: 10px;
`

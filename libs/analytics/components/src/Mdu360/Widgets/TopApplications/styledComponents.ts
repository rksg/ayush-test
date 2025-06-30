import styled from 'styled-components/macro'

export const ContentSwitcherWrapper = styled.div`
  margin-top: -38px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
`

export const ColumnWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: stretch;
`

export const ColumnHeaderWrapper = styled.div<{ itemCount?: number }>`
  display: flex;
  flex-direction: column;
  justify-content: ${({ itemCount }) =>
    itemCount && itemCount < 5 ? 'flex-start' : 'space-between'};
  gap: ${({ itemCount }) =>
    itemCount && itemCount < 5 ? '25px' : 'auto'};
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

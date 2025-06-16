import styled from 'styled-components/macro'

import { GridCol } from '@acx-ui/components'

export const ContentSwitcherWrapper = styled.div`
  margin-top: -38px;
  margin-bottom: 16px;
`

export const ColumnWrapper = styled(GridCol)`
  padding-left: 150px;
  padding-right: 150px;
`

export const LeftColumnWrapper = styled(GridCol)`
  padding-left: 30px;
  padding-right: 30px;
`

export const RightColumnWrapper = styled(GridCol)`
  border-left: 1px solid var(--acx-neutrals-30);
  padding-left: 30px;
  padding-right: 30px;
`

export const ColumnHeaderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

export const ColumnItemWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

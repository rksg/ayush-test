import { Space, Typography } from 'antd'
import styled                from 'styled-components/macro'


export const InfoMargin = styled.div`
  margin: 10px 10px;
`

export const InstancesContainer = styled(Space)`
  margin: 10px 0px 22px 0px;
  justify-content: space-between;
`
export const InstancesTitle = styled(Typography.Title)`
  &.ant-typography {
    margin-bottom: 0px;
  }
`

export const StyledTableInfoText = styled(Typography.Text)`
  color: var(--acx-neutrals-50)
`

export const StyledSpace = styled(Space)`
  & > .ant-space-item:not(:last-child) {
    margin-bottom: -15px;
  }
`
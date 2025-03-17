import { Spin } from 'antd'
import styled   from 'styled-components/macro'

export const StyledTunnelInfoLabel = styled.span`
  text-align: center;
`

export const StyledSpinner = styled(Spin)`
  & > span.ant-spin-dot.ant-spin-dot-spin {
    margin-top: -5px;
  }
`
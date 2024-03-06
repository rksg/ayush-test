import { Typography } from 'antd'
import styled         from 'styled-components/macro'


export const WarningTitle = styled(Typography.Title)`
  color: var(--acx-semantics-red-50)!important;
`

export const WarningTxt = styled(Typography.Text)`
  color: var(--acx-semantics-red-50);
`

export const ActionsContainer = styled.div`
  position: fixed;
  bottom: 0;
  width: 100%;
  padding: 12px 0;
`
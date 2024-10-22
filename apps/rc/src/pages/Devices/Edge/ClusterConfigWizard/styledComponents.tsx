import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const WarningTitle = styled(Typography.Title)`
  color: var(--acx-semantics-red-50)!important;
`

export const WarningTxt = styled(Typography.Text)`
  color: var(--acx-semantics-red-50);
`

export const IpAndMac = styled.div`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 1fr;
  align-items: baseline;
  margin: 5px 0px 15px 0px
`

import { Typography } from 'antd'
import styled         from 'styled-components/macro'

import { InformationOutlined } from '@acx-ui/icons'

export const InformationOutlinedIcon = styled(InformationOutlined)`
  width: 16px;
  height: 16px;
  path {
    stroke: var(--acx-accents-blue-50);
  }
`

export const TooltipTitle = styled(Typography)`
  font-weight: 700;
  color: var(--acx-neutrals-30);
`

export const StrengthStatus = styled.span`
  min-width: 50px;
  text-align: center;
`
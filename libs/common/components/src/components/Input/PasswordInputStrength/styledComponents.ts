import { Typography } from 'antd'
import styled         from 'styled-components/macro'

import { InformationOutlined, QuestionMarkCircleSolid } from '@acx-ui/icons'

export const InformationOutlinedIcon = styled(InformationOutlined)`
  width: 16px;
  height: 16px;
  padding-top: 2px;
  path {
    stroke: var(--acx-accents-blue-50);
  }
`
export const QuestionMarkCircleSolidIcon = styled(QuestionMarkCircleSolid)`
    width: 6px;
    height: 6px;
    vertical-align: top;
    margin-top: 5px;
    margin-left: 3px;
`

export const TooltipTitle = styled(Typography)`
  font-weight: 700;
  color: var(--acx-primary-white);
`

export const StrengthStatus = styled.span`
  min-width: 50px;
  text-align: center;
`

export const PasswordBarContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 5px;
`
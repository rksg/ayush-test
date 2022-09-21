import styled from 'styled-components/macro'

import { QuestionMarkCircleOutlined } from '@acx-ui/icons'

export const Diagram = styled.div`
  width: 358px;
  margin-top: 40px;
`

export const Title = styled.h1`
  padding-top: 11px;
  color: #7f7f7f;
  font-size: 20px;
`

export const RadioDescription = styled.div`
  color: var(--acx-neutrals-50);
  margin-top: 4px;
`

export const QuestionMarkOutlinedIcon = styled(QuestionMarkCircleOutlined)<{
  required?: boolean
}>`
  width: 16px;
  position: ${props => props.required ? 'absolute' : 'relative'};
  right: ${props => props.required ? '-22px' : '-6px'};
  path {
    stroke: var(--acx-primary-black);
  }
`
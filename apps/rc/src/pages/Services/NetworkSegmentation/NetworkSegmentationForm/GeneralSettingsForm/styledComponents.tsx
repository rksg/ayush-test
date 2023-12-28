import styled from 'styled-components'

import { CheckMark } from '@acx-ui/icons'

import { FieldTitle } from '../styledComponents'

export const AlertCheckMarkIcon = styled(CheckMark)`
fill: var(--acx-semantics-green-50);
display: inline-block;
vertical-align: middle;
width: 20px;
height: 20px;
`

export const Sub5Bold = styled.span`
font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
`

export const WarningMsg = styled(FieldTitle)`
color: var(--acx-semantics-red-50);
`

export const Diagram = styled.div`
  margin-top: 40px;
`

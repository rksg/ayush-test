import styled from 'styled-components'

import { FieldTitle } from '../styledComponents'

export const Sub5Bold = styled.span`
font-weight: var(--acx-subtitle-5-font-weight-semi-bold);
`

export const WarningMsg = styled(FieldTitle)`
color: var(--acx-semantics-red-50);
`

export const Diagram = styled.div`
  margin-top: 45px;
`
export const List = styled.div`
  padding-top: 10px;
  text-align: left;
  ol {
    padding-left: 29px;
  }
  ul {
    list-style-type: disc;
    padding-left: 20px;
  }
  dl {
    padding-top: 7px;
    padding-left: 18px;
  }
  li {
    padding-top: 12px;
  }
  dt {
    padding-top: 7px;
    padding-left: 13px;
  }
  dd {
    padding-left: 10px;
  }
`
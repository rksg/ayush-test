import { Button as AntButton } from 'antd'
import styled                  from 'styled-components/macro'

import { WarningTriangleSolid } from '@acx-ui/icons'

export const Button = styled(AntButton)`
  display: inline-flex;
  vertical-align: bottom;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;

  &:hover {
    background: white;
  }

  svg {
    &:before {
      content: 'a';
    }
    path {
      stroke: var(--acx-primary-black);
    }
  }

  &[disabled] {
    svg { path { stroke: var(--acx-primary-white); } }

    &.ant-btn-default,
    &.ant-btn-primary,
    &.ant-btn-text {
      svg { path { stroke: var(--acx-neutrals-40); } }
    }
  }
`

export const CcdResultContainer = styled.div`
  height: auto;
  display: grid;
  grid-template-columns: auto 1000px;
  padding: 10px;
`

export const ApInfoRadioExtendInfo =styled.div`
  display: grid;
  grid-template-columns: 80px auto;
  padding-top: 3px;
`

export const WarningTriangleSolidIcon = styled(WarningTriangleSolid)`
  width: 18px;
  path{
    &:first-child {
      fill: var(--acx-semantics-red-50);
    }
    &:nth-child(odd) {      
      stroke: var(--acx-semantics-red-50);
    }
  }
`
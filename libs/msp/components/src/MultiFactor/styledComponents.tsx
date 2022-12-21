import { Space }       from 'antd'
import styled, { css } from 'styled-components/macro'

import { EnvelopClosedSolid } from '@acx-ui/icons'

export const EnvelopClosedSolidIcon = styled(EnvelopClosedSolid)`
  width: 16px;
  height: 16px;
  margin-right: 4px;
`
export const OtpLabel = styled(Space).attrs({ direction: 'vertical', size: 0 })`
  margin-bottom: 16px;
  .ant-space-item:last-of-type {
    color: var(--acx-neutrals-60);
    font-size: var(--acx-body-5-font-size);
  }
`
const linkStyle = css`
  color:var(--acx-accents-blue-50);
  cursor:pointer;
  margin-bottom:10px;
  &:hover{
    color:var(--acx-accents-blue-50);
  }
`
export const FieldTextLink = styled.div`
  ${linkStyle}
`

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: ${props => props.width} 1fr;
  align-items: baseline;
`
export const FieldLabel2 = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: ${props => props.width} 43px 20px;
  align-items: baseline;
`

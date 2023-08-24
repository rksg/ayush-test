import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const Expired = styled(Space)`
  color: var(--acx-semantics-red-50)
`

export const Warning = styled(Space)`
  color: var(--acx-accents-orange-50)
`
export const FieldLabel2 = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 180px 150px;
  align-items: baseline;
`
export const FieldLabelSubs = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 180px 110px 200px;
  align-items: baseline;
`
export const FieldLabeServiceDate = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 180px 150px 150px;
  align-items: baseline;
`

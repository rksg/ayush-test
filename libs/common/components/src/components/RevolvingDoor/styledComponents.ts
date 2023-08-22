import styled from 'styled-components/macro'

export type SeveritySpanProps = {
  severity: string
}
export const SeveritySpan = styled.span.attrs((props: SeveritySpanProps) => props)`
  background-color: var(--acx-accents-orange-50);
  width: 20px;
  border-radius: 20px;
  height: 16px;
  gap: 10px;
  padding: 2px 5px;
  justify-content: center;
  align-items: center;
  color: var(--acx-primary-white);
  font-size: 10px;
  font-style: normal;
  font-weight: 700;
  line-height: 16px;
  `
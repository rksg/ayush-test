import styled from 'styled-components/macro'

export type TrendType = 'none' | 'positive' | 'negative'

const pillColor = ({ trend }: { trend: TrendType }) => {
  switch (trend) {
    case 'positive': return '--acx-semantics-green-50'
    case 'negative': return '--acx-semantics-red-50'
    case 'none': return '--acx-neutrals-50'
  }
}
export const Pill = styled.span`
  border-radius: 10px;
  padding: 3px 8px;
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-subtitle-6-font-weight-bold);
  font-size: var(--acx-subtitle-6-font-size);
  line-height: var(--acx-subtitle-6-line-height);
  color: var(--acx-primary-white);
  background-color: var(${pillColor});
`

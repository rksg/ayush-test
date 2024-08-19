import styled from 'styled-components'

import { TrendPill as Pill } from '@acx-ui/components'

export const Title = styled.div`
  color: var(--acx-primary-black);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-headline-5-line-height);
  font-weight: var(--acx-headline-5-font-weight-bold);
  margin-bottom: 12px;
`

export const Value = styled.span`
  color: var(--acx-primary-black);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-2-font-size);
  line-height: var(--acx-headline-2-line-height);
  font-weight: var(--acx-headline-2-font-weight-bold);
`

export const TrendPill = styled(Pill)`
  width: 40px;
  text-align: center;
  margin-left: 6px;
`

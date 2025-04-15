import styled, { css } from 'styled-components/macro'

import { GridCol, HistoricalCard } from '@acx-ui/components'

export const Styles = css`
  background-color: var(--acx-neutrals-10);

  & > .ant-col {
    height: 176px;
  }
`

export const EdgeStatusHeader = styled(GridCol)`
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-4-font-size);
  line-height: var(--acx-headline-4-line-height);
  color: var(--acx-primary-black);
  font-weight: var(--acx-headline-4-font-weight-bold);
`
export const Status = styled(GridCol)`
  height: 20px;
  font-weight: var(--acx-body-4-font-weight);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  align-items: end;
`
export const HistoricalIcon = styled(HistoricalCard.Icon)`
  margin: 0px 0px -4px 4px;
`
export const Duration = styled.span`
  height: 20px;
  font-weight: var(--acx-body-4-font-weight);
  font-weight: var(--acx-body-font-weight-bold);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  display: contents;
`
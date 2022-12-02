import styled from 'styled-components'

import { GridCol } from '@acx-ui/components'

export const List = styled.li`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-headline-4-font-weight);
  font-style: normal;
  font-size: var(--acx--body-4-font-size);
  line-height: var(--acx-body-4-line-height);
`

export const StyledGridCol = styled(GridCol)`
  background: var(--acx-neutrals-10);
  margin-top: var(--acx-content-vertical-space);
  margin-bottom: var(--acx-content-vertical-space)
`

export const StyledSubTitle = styled.div`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-headline-5-font-weight-bold);
  font-size: var(--acx-subtitle-4-font-size);
  line-height: 19px;
  padding-left: 15px;
  padding-top: 14px;
  padding-bottom: 15px;
`
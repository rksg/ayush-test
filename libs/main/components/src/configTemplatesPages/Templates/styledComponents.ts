import styled from 'styled-components'

import { ArrowChevronRight } from '@acx-ui/icons'

export const MenuExpandArrow = styled(ArrowChevronRight)`
  width: 16px;
  height: 16px;
  margin: 0.3em;
`
export const SelectedInstancesIndicator = styled.div`
  padding: 6px;
  background-color: var(--acx-accents-blue-10);
  border-radius: 4px;
  font-size: var(--acx-body-4-font-size);
  font-weight: normal;
`
export const Warning = styled.div`
  color: var(--acx-accents-orange-50);
`

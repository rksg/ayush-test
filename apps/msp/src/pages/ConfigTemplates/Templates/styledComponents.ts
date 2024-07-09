import styled from 'styled-components'

import { ArrowChevronRight } from '@acx-ui/icons'

export const TemplateListContainer = styled.ul`
  padding-left: 16px;
  list-style-type: none;
  li {
    margin: 4px 0;
  }
`
export const MenuExpandArrow = styled(ArrowChevronRight)`
  width: 16px;
  height: 16px;
  margin: 0.3em;
`
export const Warning = styled.div`
  color: var(--acx-accents-orange-50);
`

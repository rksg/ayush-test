import styled from 'styled-components/macro'

import { ArrowChevronLeft, ArrowChevronRight } from '@acx-ui/icons'

export const ConfigDetail = styled.div`
display: flex;
margin-top: 15px;

.code-mirror-container {
  min-width: 400px;
  width: 100%;
  margin-right: 5px;
}

.header {
  background-color: var(--acx-neutrals-20);
  font-weight: var(--acx-body-font-weight-bold);
  font-size: var(--acx-subtitle-6-font-size);
  padding: 6px 8px;
}

.errors-table {
  width: calc(100% - 20px);
  transition: 0.5s;
}

.expanded {
  border-bottom : 0px;
  position: relative;
}

.vertical-text {
  transform: rotate(90deg);
  width: 194px;
  transform-origin: 13% 42%;
  padding-left: 139px;
  padding-top: 15px;
  font-weight: var(--acx-body-font-weight-bold);
  font-size: var(--acx-subtitle-6-font-size);
}
`
export const ArrowCollapsed = styled(ArrowChevronRight)`
  path {
    stroke: var(--acx-accents-blue-50);
  }
  vertical-align: middle;
  height: 16px;
  position: absolute;
  top: 5px;
  right: 0px;
`

export const ArrowExpand = styled(ArrowChevronLeft)`
  path {
    stroke: var(--acx-accents-blue-50);
  }
  vertical-align: middle;
  height: 16px;
  padding-right: 7px;
`

export const SwitchConfigHeader = styled('div')`
  display: flex;
  justify-content: space-between;
  font-size: var(--acx-body-4-font-size);
  align-items: center;
  padding: 8px 0;
`
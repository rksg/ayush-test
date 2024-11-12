import styled, { css } from 'styled-components'


import {
  IncidentSeverities,
  incidentSeverities
} from '@acx-ui/analytics/utils'
import { cssStr, Table, TableProps } from '@acx-ui/components'
import { Link }                      from '@acx-ui/react-router-dom'

import { IncidentTableRow } from './services'


export type IncidentImpactedClientProps = {
  showImpactedClient: boolean
}

export const withEllipsis = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const DescriptionSpan = styled.div`
  ${withEllipsis}
  color: var(--acx-accents-blue-50);
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`

export const IncidentDrawerContent = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`
export const IncidentCause = styled.div`
  font-weight: var(--acx-subtitle-1-font-weight);
  margin-top: 10px;
`
export const IncidentImpactedClient = styled.div<IncidentImpactedClientProps>`
  font-weight: var(--acx-subtitle-1-font-weight);
  display : ${(props) => props.showImpactedClient ? 'block' : 'none' }
`
export const IncidentRootCauses = styled.div`
 text-decoration: underline;
`
export type SeveritySpanProps = {
  severity: IncidentSeverities
}

export const SeveritySpan = styled.span.attrs((props: SeveritySpanProps) => props)`
  color: ${(props) => {
    const color = incidentSeverities[props.severity].color
    return cssStr(color)
  }};
  font-weight: var(--acx-body-font-weight-bold);
`

export const UnstyledLink = styled(Link)`
  color: inherit;
  text-decoration: inherit;
`
export const DrawerPara = styled.p`
  margin-block-end: 1em;
`
export const DrawerList = styled.li`
  margin-block-end: 1em;
`
export const DrawerOrderList = styled.ol`
  padding-inline-start: 1em;
`
export const DrawerUnorderedList = styled.ul`
  padding-inline-start: 1em;
`

export const mutedStyles = css`
  --acx-table-muted-row-font-color: var(--acx-neutrals-40);
  --acx-table-muted-row-background-color: var(--acx-neutrals-20);

  .table-row-disabled {
    color: var(--acx-table-muted-row-font-color);
    background-color: var(--acx-table-muted-row-background-color);
  }

  && tbody > tr.table-row-disabled:hover > td {
    background: var(--acx-table-muted-row-background-color);
  }

  .ant-table-row-selected.table-row-disabled {
    background-color: var(--acx-table-muted-row-background-color);
  }

  .table-row-disabled .ant-table-cell {
    background-color: var(--acx-table-muted-row-background-color);
  }

  .ant-table-row.table-row-disabled:hover {
    background-color: var(--acx-table-muted-row-background-color);
  }

  .table-row-disabled .ant-table-cell-row-hover {
    background-color: var(--acx-table-muted-row-background-color);
  }

  .ant-radio-inner {
    background-color: var(--acx-primary-white);
  }
`

export const IncidentTableWrapper =
styled((props: TableProps<IncidentTableRow>) => <Table {...props} />)`
  ${mutedStyles}
`

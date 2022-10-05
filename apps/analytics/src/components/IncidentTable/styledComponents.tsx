import styled from 'styled-components'


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

export const withEllipsis = `
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const withDottedUnderline = `
  text-decoration: dotted underline;
  // below css will hide the default safari tooltip
  :after {
    content: '';
    display: block;
  }
`

export const DescriptionSpan = styled.div`
  cursor: pointer;
  ${withEllipsis}
  ${withDottedUnderline}
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
  margin-bottom: 0;
`
export const DrawerList = styled.li`
  margin-bottom: 5px;
`
export const DrawerOrderList = styled.ol`
  padding-inline-start: 30px;
`

export const IncidentTableWrapper =
styled((props: TableProps<IncidentTableRow>) => <Table {...props} />)`
  --incident-table-muted-row-font-color: var(--acx-neutrals-40);
  --incident-table-muted-row-background-color: var(--acx-neutrals-20);

  .table-row-muted {
    color: var(--incident-table-muted-row-font-color);
    background-color: var(--incident-table-muted-row-background-color);
  }

  && tbody > tr.table-row-muted:hover > td {
    background: var(--incident-table-muted-row-background-color);
  }

  .ant-table-row-selected.table-row-muted {
    background-color: var(--incident-table-muted-row-background-color);
  }

  .table-row-muted .ant-table-cell {
    background-color: var(--incident-table-muted-row-background-color);
  }

  .ant-table-row.table-row-muted:hover {
    background-color: var(--incident-table-muted-row-background-color);
  }

  .table-row-muted .ant-table-cell-row-hover {
    background-color: var(--incident-table-muted-row-background-color);
  }

  .ant-table-cell {
    color: unset;

    &-fix-left, 
    &-fix-right {
      background: unset;
    }
  }
  
  .ant-radio-inner {
    background-color: var(--acx-primary-white);
  }

  .ant-typography {
    color: unset;
  }
`
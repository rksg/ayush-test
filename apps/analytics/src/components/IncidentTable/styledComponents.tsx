import styled from 'styled-components'

import {
  IncidentSeverities,
  incidentSeverities
} from '@acx-ui/analytics/utils'
import { cssStr, Table as AcxTable, TableProps } from '@acx-ui/components'

import { IncidentTableRows } from './services'


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
  ${withEllipsis}
  ${withDottedUnderline}
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

export const DateSpan = styled.span`
  font-weight: var(--acx-body-font-weight-bold);
`

export const Table = styled((props: TableProps<IncidentTableRows>) => <AcxTable {...props} />)`
.ant {
    &-pagination {
      &-jump {
        &-next {
          :hover, :focus-visible {
            color: var(--acx-accents-blue-50);
          }

          &-custom-icon {
            color: var(--acx-accents-blue-50);
          }
        }
      }

      &-next:hover {
        color: var(--acx-accents-blue-50);
      }

      &-item {
        &-container {
          color: var(--acx-accents-blue-50);
        }

        &-link {
          :hover {
            color: var(--acx-accents-blue-50);
          }
          &-icon {
            color: var(--acx-accents-blue-50);
          }
        }

        &:not(-active) {
          &:hover, :focus-visible {
            a {
              color: var(--acx-accents-blue-50);
            }
          }
        }
        &-active {
          border-color: var(--acx-accents-blue-50);
          a {
            color: var(--acx-accents-blue-50);
          }      
        }      
      }
    }
  }
`
import styled from 'styled-components'

import { Table, TableProps } from '@acx-ui/components'

import { IntentListItem } from './services'

export const IntentAITableWrapper =
styled((props: TableProps<IntentListItem>) => <Table {...props} />)`
  .ant-picker-suffix {
    margin: 0 !important;
  }
`
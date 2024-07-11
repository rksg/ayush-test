import styled from 'styled-components'

import { Table, TableProps } from '@acx-ui/components'

import { IntentAIRecommendationListItem } from './services'

export const IntentAITableWrapper =
styled((props: TableProps<IntentAIRecommendationListItem>) => <Table {...props} />)`
  .ant-picker-suffix {
    margin: 0 !important;
  }
`
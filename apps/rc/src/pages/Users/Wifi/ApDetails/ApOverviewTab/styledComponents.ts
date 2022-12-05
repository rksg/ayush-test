import styled from 'styled-components/macro'

import { GridCol as GridColComponent  } from '@acx-ui/components'

export const CardWrapper = styled.div`
  height: 210px;
  .ant-card {
    padding: 24px;
  }
  .ant-row {
    align-items: center;
    text-align: center;
  }
  .ant-col {
    height: 81px;
    .ant-typography {
      margin-bottom: 0;
      color: var(--acx-neutrals-100);
    }
  }
  .echarts-for-react {
    > div {
      overflow: visible !important;
    }
    svg {
      overflow: visible;
    }
  }
`

export const GridCol = styled(GridColComponent)`
  justify-content: center;
`

export const Title = styled.div`
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height)
  color: var(--acx-neutrals-70);
  margin-bottom: 6px;
`
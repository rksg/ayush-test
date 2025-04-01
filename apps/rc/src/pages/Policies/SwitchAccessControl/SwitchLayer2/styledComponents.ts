
import { Typography } from 'antd'
import styled         from 'styled-components/macro'

export const SubTitle = styled.div`
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-headline-5-line-height);
  padding-bottom: 20px;
  color: var(--acx-neutrals-60);
  font-weight: var(--acx-headline-5-font-weight);
`

export const MacACLsWrapper = styled.div`
.editable-cell {
  position: relative;
}

.editable-cell-value-wrap {
  padding: 5px 12px;
  cursor: pointer;
}

.editable-row:hover .editable-cell-value-wrap {
  padding: 4px 11px;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}

[data-theme='dark'] .editable-row:hover .editable-cell-value-wrap {
  border: 1px solid #434343;
}
`

export const TooltipTitle = styled(Typography)`
  font-size: 10px;
  font-weight: 400;
  color: var(--acx-neutrals-40);
`

export const TooltipContainer = styled.div`
  padding: 5px;
`

export const RowSpace = styled.div`
  margin-top: 10px;
`
import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const FieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: ${props => props.width} 1fr;
  align-items: baseline;
`

export const TypeSpace = styled(Space)`
    gap: 0px !important;
  .ant-divider-vertical{
    background-color: var(--acx-neutrals-60);
  }
`

export const FieldSpace = styled(Space)`
  .ant-space-item:first-child {
    width: 100%;
  }
`
import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const PopOverDiv = styled.div`
  span {
    color: var(--acx-neutrals-60);
  }
`
export const FieldLabel = styled.div`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  line-height: 32px;
  grid-template-columns: 192px;
`

export const TypeSpace = styled(Space)`
    gap: 0px !important;
  .ant-divider-vertical{
    background-color: var(--acx-neutrals-60);
  }
`

export const DivByFraction = styled.div`
  display: grid;
  grid-template-columns: 6fr 4fr;
  column-gap: 10px
`

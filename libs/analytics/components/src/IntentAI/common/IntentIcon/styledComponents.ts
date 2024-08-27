import { Space } from 'antd'
import styled    from 'styled-components/macro'

export const Wrapper = styled(Space).attrs({ size: 10, align: 'center' })`
  margin-bottom: 1em;

  svg {
    display: block;
  }

  .ant-typography {
    margin-bottom: 0;
  }
`

import { Divider as AntDivider } from 'antd'
import styled                    from 'styled-components/macro'

export const Divider = styled(AntDivider).attrs({ type: 'vertical' })`
  border-right: 1px solid var(--acx-primary-black);
`

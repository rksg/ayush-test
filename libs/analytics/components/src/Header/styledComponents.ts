import { Divider as AntDivider } from 'antd'
import styled                    from 'styled-components/macro'

import { LayoutUI }      from '@acx-ui/components'
import {
  LogOut as AntdLogOut
} from '@acx-ui/icons'

export const Divider = styled(AntDivider).attrs({ type: 'vertical' })`
  border-right: 1px solid var(--acx-primary-black);
`
export const UserNameButton = styled(LayoutUI.ButtonSolid)`
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: var(--acx-headline-5-font-weight-bold);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-5-font-size);
`
export const LogOut = styled(AntdLogOut)`
  width: 16px;
  height: 16px;
  margin-right: 5px;
`

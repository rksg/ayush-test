import styled from 'styled-components'

import { CancelCircleOutlined, CheckMarkCircleOutline, Reload } from '@acx-ui/icons'

export const GreenTickIcon = styled(CheckMarkCircleOutline)`
  height: 12px;
  width: 12px;
  margin-right: 5px;
  color: var(--acx-semantics-green-50);
`

export const RedCancelIcon = styled(CancelCircleOutlined)`
  height: 12px;
  width: 12px;
  margin-right: 5px;
  color: var(--acx-semantics-red-50);
`

export const OrangeRevertIcon = styled(Reload)`
  height: 12px;
  width: 12px;
  margin-right: 5px;
  color: var(--acx-accents-orange-50);
`

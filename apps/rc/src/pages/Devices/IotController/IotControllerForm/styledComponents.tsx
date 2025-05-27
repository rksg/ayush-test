import { Space } from 'antd'
import styled    from 'styled-components'

import { Check } from '@acx-ui/icons'

export const FieldTitle = styled.div`
line-height: 28px;
padding-bottom: 8px;
color: var(--acx-neutrals-60);
font-size: var(--acx-body-4-font-size);
`

export const CheckMarkIcon = styled(Check)`
  width: 18px;
  height: 18px;
`

export const SpaceWrapper = styled(Space)`
  width: 100%;

  & .ant-space-item:first-child {
    width: 100%;
  }
`

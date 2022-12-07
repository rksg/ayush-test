import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { EnvelopClosedSolid } from '@acx-ui/icons'

export const EnvelopClosedSolidIcon = styled(EnvelopClosedSolid)`
  width: 16px;
  height: 16px;
  margin-right: 4px;
`
export const UserCircle = styled.div`
  text-align: center;
  width: 100px;
  height: 100px;
  line-height: 100px;
  font-size: var(--acx-headline-0-font-size);
  font-family: var(--acx-accent-brand-font);
  font-weight: var(--acx-headline-0-font-weight);
  color: var(--acx-primary-white);
  background: var(--acx-neutrals-40);
  border-radius: 50px;
`
export const UserEmailLabel = styled(Space).attrs({ direction: 'vertical', size: 0 })`
  margin-bottom: 16px;
  .ant-space-item:last-of-type {
    color: var(--acx-neutrals-60);
    font-size: var(--acx-body-5-font-size);
  }
`

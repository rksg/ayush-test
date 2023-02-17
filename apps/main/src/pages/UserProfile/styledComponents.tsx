import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { Subtitle }           from '@acx-ui/components'
import { EnvelopClosedSolid } from '@acx-ui/icons'

export const EnvelopClosedSolidIcon = styled(EnvelopClosedSolid)`
  width: 16px;
  height: 16px;
`
export const UserDataWrapper = styled.div`
  height: 100px;
  margin-bottom: 15px;
`
export const UserData = styled(Space).attrs({ size: 20 })``
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
export const UserName = styled(Subtitle).attrs({ level: 2 })`
  margin-bottom: 0 !important;
`
export const UserRole = styled.div`
  color: var(--acx-neutrals-50);
`
export const UserAttributes = styled(Space).attrs({ size: 20, align: 'start' })`
  margin-top: 1em;
  > div > div {
    display: flex;
    b {
      margin-right: 6px;
    }
    .ant-typography {
      margin-bottom: 0;
    }
  }
`
export const UserEmailLabel = styled(Space).attrs({ direction: 'vertical', size: 0 })`
  margin-bottom: 16px;
  .ant-space-item:last-of-type {
    color: var(--acx-neutrals-60);
    font-size: var(--acx-body-5-font-size);
  }
`

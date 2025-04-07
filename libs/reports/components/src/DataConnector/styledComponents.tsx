import styled from 'styled-components/macro'

import { Button } from '@acx-ui/components'


export const QuotaUsageTitle = styled.div`
  font-size: var(--acx-headline-3-font-size);
  line-height: var(--acx-headline-3-line-heigh);
  font-weight: var(--acx-headline-3-font-weight);
  display: block;
  margin-bottom: 14px;
`
export const QuotaUsageSubTitle = styled.div`
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-headline-5-line-height);
  font-weight: var(--acx-headline-5-font-weight);
  color: var(--acx-neutrals-60);
`

export const QuotaUsageBarContent = styled.div`
  display: flex;
  height: 16px;
  align-items: center;
`

export const QuotaUsageBar = styled.div`
  height: 16px;
  flex: 1;
  flex-direction: column;
  justify-content: center;
`

export const QuotaUsageButton = styled(Button)`
  &.ant-btn.ant-btn-default {
    color: var(--acx-primary-black);
    border-color: transparent;
    font-size: var(--acx-headline-3-font-size);
    width: 16px;
    height: 16px;
    min-width: 16px;
    margin-left: 6px;
    &:hover {
     border-color: transparent;
   }
  }
`

export const ConnectedDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: var(--acx-semantics-green-50);
  border-radius: 50%;
`

export const DisconnectedDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: var(--acx-neutrals-50);
  border-radius: 50%;
`
import styled from 'styled-components'
import { createGlobalStyle } from 'styled-components/macro'

import { Table, TableProps } from '@acx-ui/components'
import { Reload }            from '@acx-ui/icons'

import { IntentListItem } from './services'

export const IntentAITableWrapper =
styled((props: TableProps<IntentListItem>) => <Table {...props} />)`
  .ant-picker-suffix {
    margin: 0 !important;
  }
`

export const IconWrapper = styled.span<{ $disabled?: boolean }>`
  ${props => props.$disabled
    ? `
      cursor: not-allowed;
      pointer-events: none;
      color: var(--acx-neutrals-50);
    `
    : `
      cursor: pointer;
      color: var(--acx-primary-black);
    `}
`

export const RevertIcon = styled(Reload)`
  height: 24px;
  width: 24px;
`

export const ActionsText = styled.span`
  color: var(--acx-accents-blue-50);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
`

export const ApplyMsgWrapper = styled.div`
  padding: 5px 12px;
  white-space: normal;
  font-size: var(--acx-body-5-font-size);
  line-height: var(--acx-body-5-line-height);
`


export const ApplyModalStyle = createGlobalStyle`
  .intent-ai-optimize-modal {
    .ant-modal-confirm-content > span {
      display: inline-block;
    }
  }
`

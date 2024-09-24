import { Space } from 'antd'
import styled    from 'styled-components/macro'
import 'codemirror/addon/hint/show-hint.css'

import { Select as AcxSelect, Subtitle } from '@acx-ui/components'

export const RequiredMark = styled(Space)`
  color: var(--acx-accents-orange-50);
`

export const CustomizedSubtitle = styled(Subtitle)`
  display: flex;
  gap: 4px;
`

export const CustomizedFields = styled(Space)`
  display: grid;
  grid-template-columns: 1fr 4px 1fr 24px;
  gap: 0 8px !important;
  align-items: flex-start;
`

export const Select = styled(AcxSelect)`
  max-width: 238px;
  &.string-type {
    .ant-select-selector {
      height: 50.5px;
      align-items: flex-start;
      .ant-select-selection-placeholder {
        top: 14px;
      }
    }
  }
`
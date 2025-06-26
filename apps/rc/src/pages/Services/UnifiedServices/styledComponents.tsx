import { Select } from 'antd'
import styled from 'styled-components'

export const FilterSelect = styled(Select)`
  .ant-select-selector:has(.ant-select-selection-item) {
    background-color: var(--acx-accents-orange-10) !important;
    border-color: var(--acx-neutrals-70) !important;
  }
  .ant-select-clear {
    span[role=img] {
      background-color: var(--acx-accents-orange-10) !important;
    }
  }
}
`
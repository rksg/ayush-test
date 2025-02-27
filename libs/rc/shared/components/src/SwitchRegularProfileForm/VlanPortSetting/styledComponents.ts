import { Divider, Space } from 'antd'
import styled             from 'styled-components/macro'


export const TableWrapper = styled(Space)`
  .wrapper-table {
    margin-bottom: 40px;
  }
  .ant-table-expanded-row-fixed {
    margin: -18px -8px !important;
  }
  .ant-table-row-expand-icon-cell,
  .ant-table-selection-column {
    padding-right: 0 !important;
  }
  .ant-table-row-level-0 {
    td {
      background: var(--acx-neutrals-20);
      border: 0;
    }
  }
  .ant-table-expanded-row-level-1 {
    > td {
      border: 0 !important;
    }    
    .ant-table-row-level-0 {
      td {
        background: var(--acx-neutrals-15);
      }
    }
    .ant-table-expanded-row-level-1 {
      td {
        background: var(--acx-primary-white);
      }
    }
  }

  .groupby-module-table {
    margin: -12px -16px !important;
    .ant-table-row-expand-icon-cell {
      text-align: right !important;
      padding-right: 0 !important;
    }
    &.default-module {
      .ant-table-row-level-0 {
        display: none;
      }
      .ant-table-expanded-row {
        .ant-table-row-level-0 {
          display: table-row;
        }
      }
    }
  }

  .ports-table {
    margin: -12px -16px !important;
    .ant-table-thead th:first-child,
    .ant-table-tbody td:first-child {
        padding-left: 102px;
      }
    }
  }
}
`

export const ModelModuleText = styled(Space)`
  color: var(--acx-accents-orange-50);
  margin-left: 4px;
`

export const ModuleTitle = styled(Space)`
  font-weight: var(--acx-body-font-weight-bold);
`

export const ModuleDesp = styled(Space)`
  color: var(--acx-accents-orange-50);
  font-weight: var(--acx-body-font-weight-bold);
  margin: 0 4px;
`

export const ModuleDivider = styled(Divider)`
  border-color: var(--acx-neutrals-50);
  border-width: 1.5px;
`

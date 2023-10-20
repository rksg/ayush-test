import styled from 'styled-components/macro'

import { Button } from '@acx-ui/components'

export const DateContainer = styled.div`
  height: auto;
  display: grid;
  grid-template-columns: 180px 280px;
  padding: 10px;
  margin-top: 10px;
  background-color: #f7f7f7;
  label {
    margin-top: 4px;
  }
  .ant-picker-clear {
    display: none;
  }
`

export const Section = styled.div`
  margin-top: 12px;
`

export const PreferencesSection = styled.div`
  background-color: #e3e4e5;
`

export const TitleActive = styled.div`
  color: #7f7f7f;
`

export const TitleLegacy = styled.div`
  color: #7f7f7f;
`

export const ItemModel = styled.div`
  margin-left: 28px;
`

export const Ul = styled.ul`
  padding-left: 35px;
  li {
    margin-bottom: 8px;
  }
`

export const Li = styled.li`
  &:before {
    position: absolute;
    margin-left: -1em;
  }
  margin-top: 5px;
`

export const ChangeButton = styled(Button)`
  position: absolute;
  top: 40px;
  right: 12px;
  width: 50px !important;
`

export const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: [column-1] 150px [column-2] auto;
  margin-bottom: 10px;
`

export const ExpanderTableWrapper = styled.div`
  min-height: 50vh;
  margin-bottom: 30px;

  .ant-table-tbody {
    background-color: #EBEDEE;
  }

  /* Selected Row Styles */
  .ant-table-tbody > tr.ant-table-row-selected > td {
    background: #EBEDEE;
  }

  /* Right-Fixed Cell Styles */
  .ant-table-cell-fix-right-first {
    /* display: none; */
  }

  /* Expanded Row Styles */
  .ant-table-expanded-row-fixed {
    padding-left: 7px;
    padding-right: 0px;
    padding-bottom: 0px;

    .ant-table-fixed-column {
      margin-bottom: 10px;
      top: -3px;
    }
  }

  /* Last Child TD Styles */
  .ant-table-tbody > tr:last-child > td {
    border: none;
  }

  /* Right-Fixed Cell Styles */
  .ant-table-cell-fix-right:not(.react-resizable) {
    background-color: #EBEDEE;
  }

  /* Table Body Styles */
  .ant-table-body {
    background-color: #EBEDEE;
  }

  /* Switch Table Styles */
  .switchTable {
    .ant-table-tbody {
      background-color: white;
    }

    .ant-table-tbody > tr.ant-table-row-selected > td {
      background: white;
    }

    .ant-table-body {
      background-color: white;
    }

    .ant-table-cell-fix-right {
      background-color: white;
    }
  }
`

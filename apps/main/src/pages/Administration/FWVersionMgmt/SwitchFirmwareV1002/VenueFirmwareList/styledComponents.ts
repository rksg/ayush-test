import { Form } from 'antd'
import styled   from 'styled-components/macro'

import { Button, StepsForm } from '@acx-ui/components'

import { SwitchFirmwareWizardType } from './SwitchUpgradeWizard'

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
  margin-bottom: 15px;
`

export const TitleLegacy = styled.div`
  color: #7f7f7f;
`

export const ItemModel = styled.div`
  margin-left: 28px;
`

export const Ul = styled.ul`
  list-style-type: none;
  padding-left: 0px;
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
export const ValidateField = styled(Form.Item)`
  .ant-form-item-control-input{
    display: none;
  }
`

export const WithTooltip = styled.span`
  cursor: default;
`

export const TextButton = styled(Button)`
  color: var(--acx-accents-blue-50) !important;
  padding: 0px !important;
  margin-left: 5px;
  margin-bottom: 2px;
`

export const SwitchFirmwareStepsForm = styled(StepsForm)<{ wizardtype: SwitchFirmwareWizardType }>`
    ${(props) => (props.wizardtype === SwitchFirmwareWizardType.skip ? `
    [class*="styledComponents__ActionsContainer"]{
      display: flex;
      justify-content: flex-end;
    }
    ` : '')}
`

export const ExpanderTableWrapper = styled.div`
  min-height: 50vh;
  margin-bottom: 30px;
  [class*="styledComponents__Header"]{
    background: transparent;
    }

  overflow-x: auto;

  .ant-table-tbody {
    background-color: var(--acx-neutrals-20);
    .ant-table-cell-fix-right-first {
      background-color: var(--acx-neutrals-20);
    }
  }

  /* Selected Row Styles */
  .ant-table-tbody > tr.ant-table-row-selected > td {
    background: var(--acx-neutrals-20);
  }

  .ant-table-thead {
    .ant-table-cell-fix-right-first{
      background-color: var(--acx-primary-white);
    }
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

  /* Table Body Styles */
  .ant-table-body {
    background-color: var(--acx-neutrals-20);
  }

  /* Switch Table Styles */
  .switchTable {
    margin: -12px 0px -12px -7px !important;
    .ant-table-tbody {
      background-color: var(--acx-primary-white);
    }

    .ant-table-tbody > tr.ant-table-row-selected > td {
      background: var(--acx-primary-white);
    }

    .ant-table-body {
      background-color: var(--acx-primary-white);
    }

    .ant-table-cell-fix-right {
      background-color: var(--acx-primary-white);
    }
  }
`

export const Description = styled.div`
  background: var(--acx-neutrals-10);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: var(--acx-primary-black);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 40px;
  ol, ul {
    list-style-type: "*   ";
    padding-left: 15px;
    padding-top: 15px;
    line-height: 20px;
    ul {
      list-style-type: disc;
      li {
        margin-bottom: 10px;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
  ol {
    margin-bottom: 0;
  }
`

export const NoteButton = styled(Button)`
  color: var(--acx-accents-blue-50) !important;
  padding: 4px 0px !important;
  span {
    margin-top: 7px;
  }
`

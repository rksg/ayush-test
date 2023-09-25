import styled from 'styled-components/macro'

import { Button, Modal } from '@acx-ui/components'

export const SelectDiv = styled.div`
  .ant-select-selector {
    // padding: 0 2px !important;
  }
`

export const DateContainer = styled.div`
  height: auto;
  display: grid;
  grid-template-columns: 180px 280px;
  padding: 10px;
  background-color: #f7f7f7;
  label {
    margin-top: 4px;
  }
  .ant-picker-clear {
    display: none;
  }
  .ant-picker-input > input {
    font-size: 12px;
  }
`

export const Section = styled.div`
  margin-bottom: 12px;
`

export const PreferencesSection = styled.div`
  background-color: #e3e4e5;
`

export const TitleActive = styled.div`
  color: #333333;
  font-weight: 600;
  margin: 12px 10px 0;
`

export const Title2Active = styled.div`
  color: #333333;
  margin: 12px 10px 12px;
`

export const TitleDate = styled.div`
  color: #333333;
  font-weight: 600;
  margin: 12px 10px 0 0;
`

export const Title2Date = styled.div`
  color: #333333;
  margin: 12px 10px 12px 0;
`

export const TitleLegacy = styled.div`
  color: #333333;
  font-weight: 600;
  margin: 12px 10px 0;
`

export const ItemModel = styled.div`
  font-size: 12px;
  margin: -10px 0 0 37px;
`

export const Ul = styled.ul`
  list-style-type: none;
  padding-left: 1em;
`

export const Li = styled.li`
  &:before {
    content: "-";
    position: absolute;
    margin-left: -1em;
  }
  margin-top: 5px;
`

export const ScheduleModal = styled(Modal)`
.ant-modal-body{
  overflow: initial;
}
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

export const ValueContainer = styled.div`
  margin: 12px 12px 4px 32px;
  .ant-radio-group {
    font-size: unset;
  }
`
export const ApModelsContainer = styled.div`
  margin-left: 2px;
  .empty {
    color: var(--acx-neutrals-50);
    font-style: italic;
  }
`

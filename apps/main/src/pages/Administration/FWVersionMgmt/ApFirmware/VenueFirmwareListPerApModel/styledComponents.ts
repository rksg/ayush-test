import styled from 'styled-components/macro'

import { Modal } from '@acx-ui/components'

export const ScheduleTooltipText = styled.span`
  font-size: 12px;
`

export const WithTooltip = styled.span`
  cursor: default;
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

export const ScheduleModal = styled(Modal)`
  .ant-modal-body{
    overflow: initial;
  }
  .ant-modal-content{
    max-height: initial;
  }
`

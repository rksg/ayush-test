import styled from 'styled-components/macro'

import { Modal } from '@acx-ui/components'


export const Section = styled.div`
  margin-top: 12px;
`

export const TitleActive = styled.div`
  color: #7f7f7f;
`

export const ItemModel = styled.div`
  margin-left: 28px;
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
`

export const ScheduleModal = styled(Modal)`
.ant-modal-body{
  overflow: initial;
}
.ant-modal-content{
  max-height: initial;
}
`

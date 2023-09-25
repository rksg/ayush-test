import styled from 'styled-components/macro'

import { Button, Modal } from '@acx-ui/components'

export const PreDownloadLabel = styled.label`
  font-size: 15px;
  font-weight: 600;
  font-family: Arial Bold, Arial, sans-serif;
  margin: 15px 0px;
  display: block;
`

export const ScheduleTooltipText = styled.span`
  font-size: 12px;
`

export const WithTooltip = styled.span`
  cursor: default;
`

export const BannerType = styled.div`
  font-family: "OpenSans-Regular", "Open Sans", sans-serif;
  fontSize: 14px;
  color: #797979;
  text-align: left;
  line-height: 20px;
`

export const DateContainer = styled.div`
  // height: auto;
  // display: grid;
  // grid-template-columns: 180px 280px;
  // padding: 10px;
  // background-color: #f7f7f7;
  label {
    margin-bottom: 14px;
  }
`

export const Section = styled.div`
  margin-top: 12px;
`

export const PreferencesSection = styled.div`
  margin-top: 12px;
  margin-Left: 8;
  font-weight: bold;
`

export const GreyTextSection = styled.div`
  color: var(--acx-neutrals-50)
`

export const ItemModel = styled.div`
  margin-left: 28px;
`

export const ScheduleModal = styled(Modal)`
.ant-modal-body{
  overflow: initial;
}
`
export const ChangeButton = styled(Button)`
  position: absolute;
  top: 88px;
  left: 290px;
  margin: 8px;
  width: 80px !important;
  font-size: 13px;
`

export const LatestVersion = styled.div`
  font-weight: 600;
  margin-bottom: 14px;
  line-height: 18px;
`
export const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: [column-1] 150px [column-2] auto;
  margin-bottom: 10px;
`

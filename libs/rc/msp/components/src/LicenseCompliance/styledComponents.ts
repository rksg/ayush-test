import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { Button, Card, Modal }                      from '@acx-ui/components'
import { CheckMarkCircleSolid, WarningCircleSolid } from '@acx-ui/icons'

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
  height: auto;
  display: grid;
  grid-template-columns: 180px 280px;
  padding: 10px;
  background-color: #f7f7f7;
  label {
    margin-top: 4px;
  }
`

export const Section = styled.div`
  margin-top: 12px;
`

export const PreferencesSection = styled.div`
  margin-top: 8px;
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
  margin: 8px;
  width: 50px !important;
  font-size: 12px;
`

export const FieldGroup = styled.div`
  display: grid;
  grid-template-columns: [column-1] 150px [column-2] auto;
  margin-bottom: 10px;
`
export const TabWithHint = styled.span`
  display: flex;
  align-items: center;
  svg {
    height: 18px;
    width: 18px;
    margin-left: 5px;
    color: var(--acx-accents-orange-50);
  }
`

export const BannerVersionOld = styled.div`
  font-family: "OpenSans-Regular", "Open Sans", sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #333333;
  text-align: left;
  line-height: 20px;
`

export const BannerComplianceNotes = styled.div`
  background-color: var(--acx-accents-orange-10);
  // width: fit-content;
  width: 100%;
  padding: 7px 15px 15px 15px;
  .note {
    font-size: 12px;
    margin-bottom: 10px;
  }
  .detail {
    padding-left: 8px;
  }
`

export const BannerVersionName = styled.span`
  font-weight: 600;
  color: var(--acx-neutrals-70);
`

export const ComplianceNotesLabel = styled.div`
  font-weight: 600;
  line-height: 31px;
  display: flex;
  align-items: center;
  gap: 5px;
  svg {
    height: 18px;
    width: 18px;
    color: var(--acx-accents-orange-50);
  }
`
export const TypeSpace = styled(Space)`
    gap: 0px !important;
  .ant-divider-vertical{
    background-color: var(--acx-neutrals-60);
  }
`
export const FwContainer = styled.div`
  color: var(--acx-neutrals-70);
  font-size: 12px;
  line-height: 20px;
  margin-right: 30px;
`
export const FieldLabelSubs = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 160px 80px 100px;
  align-items: baseline;
  label:nth-child(2), label:nth-child(3) {
    text-align: center;
    line-height: 20px;
  }
`
export const FieldLabelSubs2 = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 140px 45px 180px;
  align-items: baseline;
  label:nth-child(2) {
    text-align: right;
    font-weight: 600;
  }
`
export const LicenseGap = styled(Space)`
  color: var(--acx-semantics-red-50)
`
export const LicenseAvailable = styled(Space)`
  color: var(--acx-semantics-green-50);
`
export const ComplianceContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 13px;
`
export const Title = styled(Card.Title)`
  font-size: var(--acx-headline-3-font-size);
`
export const SubTitle = styled.div`
  margin-top: 2px;
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: var(--acx-primary-black);
  font-weight: var(--acx-subtitle-1-font-weight);
  white-space: normal;
`
export const GreenTickIcon = styled(CheckMarkCircleSolid)`
  height: 30px;
  width: 30px;
  path:nth-child(1) {
    fill: var(--acx-semantics-green-50);
  }
  path:nth-child(3) {
    stroke: var(--acx-semantics-green-50);
  }
  path:nth-child(2) {
    stroke-width: 3px
  }
`
export const YellowTickIcon = styled(CheckMarkCircleSolid)`
  height: 30px;
  width: 30px;
  path:nth-child(1) {
    fill: var(--acx-semantics-orange-30);
  }
  path:nth-child(3) {
    stroke: var(--acx-semantics-orange-30);
  }
  path:nth-child(2) {
    stroke-width: 3px
  }
`
export const RedTickIcon = styled(WarningCircleSolid)`
  height: 30px;
  width: 30px;
  path:nth-child(2) {
    fill: var(--acx-semantics-red-50);
    stroke: var(--acx-semantics-red-50);
  }
  path:nth-child(3) {
    d: path('M12 7V12.75');
    stroke-width: 3px;
  }
  path:nth-child(4) {
    stroke: white;
    stroke-width: 2px;
  }
`
export const Expired = styled(Space)`
  color: var(--acx-semantics-red-50)
`
export const Warning = styled(Space)`
  color: var(--acx-accents-orange-50)
`

export const FieldLabelSubs3 = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  grid-template-columns: 208px 130px;
  align-items: baseline;
  line-height: 24px;
  label {
    font-size: 12px;
  }
  .ant-checkbox-inner {
    width: 14px;
    height: 14px;
  }
`

export const SettingsFieldLabel = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  display: grid;
  border-bottom: 1px solid var(--acx-neutrals-100);
  grid-template-columns: 164px 130px 124px 150px;
  align-items: baseline;
  line-height: 24px;
  label {
    font-weight: 600;
    font-size: 12px;
  }
  .ant-checkbox-inner {
    width: 14px;
    height: 14px;
  }
`

export const SettingsFieldLabelKeyValue = styled.div<{ width: string }>`
  font-size: var(--acx-body-4-font-size);
  padding-top: 12px;
  display: grid;
  grid-template-columns: 164px 130px 124px 150px;
  gap: 8px 0;
  align-items: baseline;
  line-height: 24px;
  label {
    font-size: 12px;
  }
  .ant-checkbox-inner {
    width: 14px;
    height: 14px;
  }
`
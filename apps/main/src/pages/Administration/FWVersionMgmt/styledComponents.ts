import { Space } from 'antd'
import styled    from 'styled-components/macro'

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
    path {
      stroke: var(--acx-primary-white);
      fill: var(--acx-accents-orange-50);
    }
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

export const BannerVersion = styled.div`
  background-color: var(--acx-accents-orange-10);
  width: fit-content;
  padding: 7px 15px 15px 15px;
`

export const BannerVersionName = styled.span`
  font-weight: 600;
  color: var(--acx-neutrals-70);
`

export const LatestVersion = styled.div`
  font-weight: 600;
  margin-bottom: 14px;
  line-height: 18px;
`
export const TypeSpace = styled(Space)`
    gap: 0px !important;
  .ant-divider-vertical{
    background-color: var(--acx-neutrals-60);
  }
`

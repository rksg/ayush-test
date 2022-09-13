import { Button as AntButton, Divider as AntDivider } from 'antd'
import styled, { css }                                from 'styled-components/macro'

import {
  AI,
  AccountCircleOutlined,
  AccountCircleSolid,
  AccountCircleSolidSmall,
  CalendarDateOutlined,
  CalendarDateSolid,
  ConfigurationOutlined,
  ConfigurationSolid,
  DeleteOutlined,
  DevicesOutlined,
  DevicesSolid,
  LocationOutlined,
  LocationSolid,
  NetworksOutlined,
  NetworksSolid,
  NotificationSolid,
  QuestionMarkCircleSolid,
  ReportsOutlined,
  ReportsSolid,
  RocketOutlined,
  SearchOutlined,
  ServicesOutlined,
  ServicesSolid,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid
} from '@acx-ui/icons'

export const Wrapper = styled.div`
  --acx-header-divider-margin: 10px;
`

export const HeaderDropDownWrapper = styled.div`
  margin-left: calc(-1 * var(--acx-header-divider-margin));
  .ant-dropdown-trigger {
    font-size: var(--acx-body-2-font-size);
  }
`

export const Divider = styled(AntDivider).attrs({ type: 'vertical' })`
  border-right: 1px solid var(--acx-neutrals-70);
  height: 32px;
  margin: 0 var(--acx-header-divider-margin) 0
    calc(var(--acx-header-divider-margin) - 1px);
  top: 0;
`

export const Button = styled(AntButton)`
  background-color: var(--acx-neutrals-70);
  border: none;
  margin: 0 6px;
  :last-of-type {
    margin-right: 0;
  }
`

const buttonIconStyle = css`
  height: 100%;
  fill: var(--acx-primary-white);
  stroke: var(--acx-neutrals-70);
`

export const AccountIconSmall = styled(AccountCircleSolidSmall)`
  ${buttonIconStyle}
`

export const NotificationIcon = styled(NotificationSolid)`
  ${buttonIconStyle}
  stroke: var(--acx-primary-white);
`

export const QuestionIcon = styled(QuestionMarkCircleSolid)`
  ${buttonIconStyle}
`

const iconStyle = css`
  height: 100%;
  path {
    stroke: var(--acx-primary-white);
  }
`

export const SearchIcon = styled(SearchOutlined)`
  ${iconStyle}
`

export const RocketIcon = styled(RocketOutlined)`
  ${iconStyle}
  vertical-align: text-bottom;
`

const menuIconStyle = `
  height: 20px;
  width: 20px;
  vertical-align: middle;
  margin-right: 15px;
`

const enabledMenuIconStyle = `
  ${menuIconStyle}
  path {
    fill: var(--acx-primary-white);
    stroke: var(--acx-primary-black);
  }
`
const disabledMenuIconStyle = `
  ${menuIconStyle}
  path {
    stroke: var(--acx-primary-white);
  }
`

export const AccountIcon = styled(AccountCircleOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledAccountIcon = styled(AccountCircleSolid)`
  ${enabledMenuIconStyle}
`

export const CalendarIcon = styled(CalendarDateOutlined)`
  ${disabledMenuIconStyle}
  circle {
    fill: var(--acx-primary-black);
    stroke: var(--acx-primary-white);
  }
`
export const EnabledCalendarIcon = styled(CalendarDateSolid)`
  ${enabledMenuIconStyle}
  circle {
    fill: var(--acx-primary-white);
    stroke: var(--acx-primary-black);
  }
`

export const ConfigurationIcon = styled(ConfigurationOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledConfigurationIcon = styled(ConfigurationSolid)`
  ${enabledMenuIconStyle}
`

export const DevicesIcon = styled(DevicesOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledDevicesIcon = styled(DevicesSolid)`
  ${enabledMenuIconStyle}
`

export const LocationIcon = styled(LocationOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledLocationIcon = styled(LocationSolid)`
  ${enabledMenuIconStyle}
`

export const AIAnalyticsIcon = styled(AI)`
  ${enabledMenuIconStyle}
  path { stroke: none; }
`
export const NetworksIcon = styled(NetworksOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledNetworksIcon = styled(NetworksSolid)`
  ${menuIconStyle}
  fill: var(--acx-primary-white);
  stroke: var(--acx-primary-white);
`

export const ReportsIcon = styled(ReportsOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledReportsIcon = styled(ReportsSolid)`
  ${enabledMenuIconStyle}
`

export const ServicesIcon = styled(ServicesOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledServicesIcon = styled(ServicesSolid)`
  ${enabledMenuIconStyle}
`

export const SpeedIndicatorIcon = styled(SpeedIndicatorOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledSpeedIndicatorIcon = styled(SpeedIndicatorSolid)`
  ${enabledMenuIconStyle}
`

export const DeleteOutlinedIcon = styled(DeleteOutlined)`
  path {
    stroke: var(--acx-accents-blue-50) !important;
  }
`
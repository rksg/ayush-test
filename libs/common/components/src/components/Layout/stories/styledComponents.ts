import styled from 'styled-components/macro'

import {
  AI,
  AccountCircleOutlined,
  AccountCircleSolid,
  CalendarDateOutlined,
  CalendarDateSolid,
  ConfigurationOutlined,
  ConfigurationSolid,
  DevicesOutlined,
  DevicesSolid,
  LocationOutlined,
  LocationSolid,
  NetworksOutlined,
  NetworksSolid,
  ReportsOutlined,
  ReportsSolid,
  ServicesOutlined,
  ServicesSolid,
  SpeedIndicatorOutlined,
  SpeedIndicatorSolid
} from '@acx-ui/icons'

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

import styled, { css } from 'styled-components/macro'

import {
  AccountCircleOutlined,
  AccountCircleSolid,
  AccountCircleSolidSmall,
  CalendarDateOutlined,
  CalendarDateSolid,
  ConfigurationOutlined,
  ConfigurationSolid,
  DevicesOutlined,
  DevicesSolid,
  LocationOutlined,
  LocationSolid,
  MelissaAIIcon,
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

export const MelissaIcon = styled(MelissaAIIcon)`
  ${disabledMenuIconStyle}
  stroke-width: 0;
`
export const EnabledMelissaIcon = styled(MelissaAIIcon)`
  ${disabledMenuIconStyle}
  stroke-width: 1;
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

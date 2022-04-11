import { Button as AntButton, Divider as AntDivider } from 'antd'

import { ReactComponent as AccountCircleOutlined }   from 'src/assets/icons/AccountCircleOutlined.svg'
import { ReactComponent as AccountCircleSolid }      from 'src/assets/icons/AccountCircleSolid.svg'
import { ReactComponent as AccountCircleSolidSmall } from 'src/assets/icons/AccountCircleSolidSmall.svg'
import { ReactComponent as CalendarDateOutlined }    from 'src/assets/icons/CalendarDateOutlined.svg'
import { ReactComponent as CalendarDateSolid }       from 'src/assets/icons/CalendarDateSolid.svg'
import { ReactComponent as ConfigurationOutlined }   from 'src/assets/icons/ConfigurationOutlined.svg'
import { ReactComponent as ConfigurationSolid }      from 'src/assets/icons/ConfigurationSolid.svg'
import { ReactComponent as DevicesOutlined }         from 'src/assets/icons/DevicesOutlined.svg'
import { ReactComponent as DevicesSolid }            from 'src/assets/icons/DevicesSolid.svg'
import { ReactComponent as LocationOutlined }        from 'src/assets/icons/LocationOutlined.svg'
import { ReactComponent as LocationSolid }           from 'src/assets/icons/LocationSolid.svg'
import { ReactComponent as MelissaAIIcon }           from 'src/assets/icons/MelissaAIIcon.svg'
import { ReactComponent as NetworksOutlined }        from 'src/assets/icons/NetworksOutlined.svg'
import { ReactComponent as NetworksSolid }           from 'src/assets/icons/NetworksSolid.svg'
import { ReactComponent as NotificationSolid }       from 'src/assets/icons/NotificationSolid.svg'
import { ReactComponent as QuestionMarkCircleSolid } from 'src/assets/icons/QuestionMarkCircleSolid.svg'
import { ReactComponent as ReportsOutlined }         from 'src/assets/icons/ReportsOutlined.svg'
import { ReactComponent as ReportsSolid }            from 'src/assets/icons/ReportsSolid.svg'
import { ReactComponent as RocketOutlined }          from 'src/assets/icons/RocketOutlined.svg'
import { ReactComponent as SearchOutlined }          from 'src/assets/icons/SearchOutlined.svg'
import { ReactComponent as ServicesOutlined }        from 'src/assets/icons/ServicesOutlined.svg'
import { ReactComponent as ServicesSolid }           from 'src/assets/icons/ServicesSolid.svg'
import { ReactComponent as SpeedIndicatorOutlined }  from 'src/assets/icons/SpeedIndicatorOutlined.svg'
import { ReactComponent as SpeedIndicatorSolid }     from 'src/assets/icons/SpeedIndicatorSolid.svg'
import styled, { css }                               from 'styled-components/macro'

export const Wrapper = styled.div`
  --acx-header-divider-margin: 10px;
`

export const HeaderDropDownWrapper = styled.div`
  margin-left: calc(-1 * var(--acx-header-divider-margin));
`

export const Divider = styled(AntDivider).attrs({ type: 'vertical' })`
  border-right: 1px solid var(--acx-neutrals-70);
  height: 32px;
  margin: 0 var(--acx-header-divider-margin) 0 calc(var(--acx-header-divider-margin) - 1px);
  top: 0;
`

export const Button = styled(AntButton)`
  background-color: var(--acx-neutrals-70);
  border: none;
  margin: 0 6px;
  :last-of-type { margin-right: 0; }
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

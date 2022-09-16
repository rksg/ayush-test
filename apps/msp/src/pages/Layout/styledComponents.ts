import { Button as AntButton, Divider as AntDivider } from 'antd'
import styled, { css }                                from 'styled-components/macro'

import {
  AccountCircleSolidSmall,
  QuestionMarkCircleSolid,
  ConfigurationOutlined,
  ConfigurationSolid,
  MspCustomersOutlined,
  MspCustomersSolid,
  MspIntegratorsOutlined,
  MspIntegratorsSolid,
  MspInventoryOutlined,
  MspInventorySolid,
  MspLicenseOutlined,
  MspLicenseSolid,
  NotificationSolid,
  SearchOutlined,
  WorldSmall
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

export const RegionIcon = styled(WorldSmall)`
  ${iconStyle}
  vertical-align: text-bottom;
`
export const SearchIcon = styled(SearchOutlined)`
  ${iconStyle}
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
export const CustomerIcon = styled(MspCustomersOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledCustomerIcon = styled(MspCustomersSolid)`
  ${enabledMenuIconStyle}
`
export const IntegratorIcon = styled(MspIntegratorsOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledIntegratorIcon = styled(MspIntegratorsSolid)`
  ${enabledMenuIconStyle}
`
export const InventoryIcon = styled(MspInventoryOutlined)`
  ${disabledMenuIconStyle}
`
export const EnableInventoryIcon = styled(MspInventorySolid)`
  ${enabledMenuIconStyle}
`
export const MspLicenseIcon = styled(MspLicenseOutlined)`
  ${disabledMenuIconStyle}
`
export const EnableMspLicenseIcon = styled(MspLicenseSolid)`
  ${enabledMenuIconStyle}
`
export const ConfigurationIcon = styled(ConfigurationOutlined)`
  ${disabledMenuIconStyle}
`
export const EnabledConfigurationIcon = styled(ConfigurationSolid)`
  ${enabledMenuIconStyle}
`

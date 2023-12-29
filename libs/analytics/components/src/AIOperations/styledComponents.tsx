import styled, { css } from 'styled-components'

import { CancelCircleOutlined, CheckMarkCircleOutline, Reload } from '@acx-ui/icons'

export * from '../AIDrivenRRM/styledComponents'

const iconStyle = css`
  --size: 12px;
  height: var(--size);
  width: var(--size);
  margin-right: 5px;
`

export const AppliedIcon = styled(CheckMarkCircleOutline)`
  ${iconStyle}
  color: var(--acx-semantics-green-50);
`
export const FailedIcon = styled(CancelCircleOutlined)`
  ${iconStyle}
  color: var(--acx-semantics-red-50);
`
export const RevertIcon = styled(Reload)`
  ${iconStyle}
`

export const OptimalConfigurationWrapper = styled.div`
  padding: 46px 0;
  border-bottom: 1px solid var(--acx-neutrals-25);
  margin-bottom: 5px;
`
export const LicenseWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: flex-end;
  padding-bottom: 3px;
`

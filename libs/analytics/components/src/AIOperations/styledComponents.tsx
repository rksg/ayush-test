import styled, { css } from 'styled-components'

import { CheckMarkCircleSolid, CancelCircleOutlined, CheckMarkCircleOutline, Reload, NoData } from '@acx-ui/icons'

import * as UI from '../AIDrivenRRM/styledComponents'

export * from '../AIDrivenRRM/styledComponents'

const iconStyle = css`
  --size: 12px;
  height: var(--size);
  width: var(--size);
  margin-right: 5px;
`

export const GreenTickIcon = styled(CheckMarkCircleOutline)`
  ${iconStyle}
  color: var(--acx-semantics-green-50);
`
export const RedCancelIcon = styled(CancelCircleOutlined)`
  ${iconStyle}
  color: var(--acx-semantics-red-50);
`
export const OrangeRevertIcon = styled(Reload)`
  ${iconStyle}
  color: var(--acx-accents-orange-50);
`

export const LargeGreenTickIcon = styled(CheckMarkCircleSolid)<{ $noData: boolean }>`
  --size: 48px;
  height: var(--size);
  width: var(--size);
  display: block;
  margin-block: 10px 16px;
  ${p => p.$noData && 'margin-top: 44px;'}

  ${UI.iconAndTextAlignCenter}
`

export const NoDataIcon = styled(NoData)`
  display: block;
  margin-block: 54px 2px;

  ${UI.iconAndTextAlignCenter}
`

export const ContentWrapper = styled(UI.ContentWrapper)<{ $noData?: boolean }>`
  ${p => !p.$noData && css`
    flex: unset;
    border-bottom: 1px solid var(--acx-neutrals-25);
    margin-bottom: 5px;
  `}
`

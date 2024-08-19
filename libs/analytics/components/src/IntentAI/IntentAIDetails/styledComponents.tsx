import styled, { css } from 'styled-components'

import { GridCol }     from '@acx-ui/components'
import { AIDrivenRRM } from '@acx-ui/icons'

// TODO: refactor: address dependency on this and remove this
export const detailsHeaderFontStyles = css`
  color: var(--acx-primary-black);
  font-family: var(--acx-accent-brand-font);
  font-size: var(--acx-headline-3-font-size);
  line-height: var(--acx-headline-3-line-height);
  font-weight: var(--acx-headline-3-font-weight);
`

export const StatusTrailDateLabel = styled.span`
  color: var(--acx-neutrals-50);
  margin-right: 10px;
`

export const StatusTrailItemWrapper = styled.div`
  font-size: var(--acx-body-4-font-size);
  font-weight: var(--acx-body-font-weight);
  line-height: 18px;
`

export const StatusTrailWrapper = styled.div`
  max-height: 150px;
  overflow-y: auto;
  overflow-x: hidden;
`

export const AIDrivenRRMHeader = styled(GridCol).attrs({ col: { span: 24 } })`
  ${detailsHeaderFontStyles}
  margin-bottom: 12px;
  display: flex;
  justify-items: center;
  flex-direction: row;
  align-items: center;
`

export const AIDrivenRRMIcon = styled(AIDrivenRRM)`
  height: 48px;
  width: 48px;
  min-width: 48px;
  margin-right: 10px;
`

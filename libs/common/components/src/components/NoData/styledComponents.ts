import { Space } from 'antd'
import styled    from 'styled-components/macro'

import { CheckMarkCircleSolid } from '@acx-ui/icons'

import { Button } from '../Button'

export const NoDataWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`
export const NoRecommendationDataWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  width: 85%;
  position: absolute;
  left: 50%;
  top: 35%;
  transform: translate(-50%, -50%);
`
export const NoAILicenseWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  height: 100%;
  align-items: end;
  width: 100%;
  position: absolute;
  left: 50%;
  top: 35%;
  transform: translate(-50%, -50%);
`
export const TextWrapper = styled(Space)`
  text-align: center;
  justify-content: center;
  width: 100%;
`
export const NoDataTextWrapper = styled(TextWrapper)`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-body-4-font-weight);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: var(--acx-primary-black);
`
export const GreenTickIcon = styled(CheckMarkCircleSolid)`
  height: 32px;
  width: 32px;
`
export const LargeGreenTickIcon = styled(CheckMarkCircleSolid)`
  height: 48px;
  width: 48px;
`
export const LicenseButton = styled(Button)`
  width: 90%;
`

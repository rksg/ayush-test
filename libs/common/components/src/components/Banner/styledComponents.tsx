import styled from 'styled-components/macro'

import { Alert }  from '../Alert'
import { Button } from '../Button'

export const BannerAlert = styled(Alert)`
&.ant-alert-info {
  padding: 0px 0px;
  border-radius: 10px;
  background-color: var(--acx-accents-blue-10);
  border: 0px solid;
}

.ant-alert-close-icon {
  float: right;
  position: absolute;
  right: 10px;
  top: 8px;
  background-color: var(--acx-primary-white);
  border-radius: 12px;
  padding: 5px;
}
`

export const BannerWrapper = styled.div`
  overflow: hidden;
  position: relative;
`

export const BannerBG = styled.img`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: auto;
  filter: invert(100%) opacity(0.8)
`

export const Banner = styled.div`
  position: relative;
  padding: 18px 20px;
`

export const BannerTitle = styled.div`
  font-size: var(--acx-headline-2-font-size);
  line-height: var(--acx-headline-2-line-height);
  font-weight: var(--acx-headline-5-font-weight-bold);
  display: block;
  margin-bottom: 10px;
`
export const BannerSubTitle = styled.div`
  font-size: var(--acx-headline-5-font-size);
  line-height: var(--acx-headline-5-line-height);
  font-weight: var(--acx-headline-5-font-weight);
  display: block;
  margin-bottom: 5px;
`

export const BannerButton = styled(Button)`
  margin-top: 20px;
  font-size: var(--acx-subtitle-4-font-size);
  line-height: var(--acx-subtitle-4-line-height);
  font-weight: var(--acx-subtitle-4-font-weight);
`
import styled from 'styled-components/macro'

import { Drawer, cssStr } from '@acx-ui/components'

import iconUrl from './MelissaIcon.png'

export const MelissaIcon = styled.div.attrs({
  'data-testid': 'MelissaIcon'
})`
  width: 56px;
  height: 56px;

  position: fixed;
  right: 15px;
  bottom: 15px;
  z-index: 999999;
  cursor: pointer;

  border-radius: 50%;
  background: url(${iconUrl}) center / 32px no-repeat #243A7A;
`

export const MelissaDrawer = styled(Drawer)`
    .ant-drawer-header {
        background: linear-gradient(#2B4181,#223878,#263C7B);
        margin: 0px !important;
        padding: 8px 10px 8px 10px !important;
    }
    .ant-drawer-title {
        color: ${cssStr('--acx-primary-white')};
        font-family: ${cssStr('--acx-accent-brand-font')};
    }
    .ant-drawer-close {
        padding-top: 8px;
    }
    .ant-drawer-close > svg > path{
        stroke: ${cssStr('--acx-primary-white')};
    }
`

export const Title = styled.span`
    font-weight: ${cssStr('--acx-headline-3-font-weight')};
    font-size: ${cssStr('--acx-headline-3-font-size')};
`
export const SubTitle = styled.span`
    font-weight: ${cssStr('--acx-subtitle-6-font-weight')};
    font-size: ${cssStr('--acx-subtitle-5-font-size')};
    padding-top: 3px;
    margin-left: -5px;
`

import { forwardRef } from 'react'

import { List as AntList } from 'antd'
import { Space }           from 'antd'
import styled              from 'styled-components'

import { Button }  from '@acx-ui/components'
import {  NoData } from '@acx-ui/icons'


import type { ListItemMetaProps } from 'antd/lib/list'

export const List = styled(AntList)``

List.Item = styled(AntList.Item)`
  &:first-of-type { padding-top: 5px; }
  border-bottom-color: var(--acx-neutrals-25) !important;
  padding: 10px 0;
  a {
    display: block;
    flex: 1;
    text-decoration: none;
  }
`

const MetaNoRef = styled(AntList.Item.Meta)`
  align-items: center;

  .ant-list-item-meta-avatar {
    margin-right: 0;
    .ant-badge-status-dot { top: -1px; }
  }

  .ant-list-item-meta-title {
    font-weight: var(--acx-body-font-weight);
    font-size: var(--acx-body-4-font-size);
    line-height: var(--acx-body-4-line-height);
    margin-bottom: 0;
  }

  .ant-list-item-meta-description {
    font-weight: var(--acx-body-font-weight);
    font-size: var(--acx-body-6-font-size);
    line-height: var(--acx-body-6-line-height);
    color: var(--acx-neutrals-50);
  }
`
List.Item.Meta = forwardRef<HTMLDivElement,ListItemMetaProps>((props, ref) =>
  <div ref={ref}><MetaNoRef {...props} /></div>)

export const TextWrapper = styled(Space)`
  text-align: center;
  justify-content: center;
  width: 100%;
  padding-top: 50px;
`
export const NoLicenseTextWrapper = styled(TextWrapper)`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-body-4-font-weight);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: 'var(--acx-neutrals-50)';
  padding-bottom: '10px';
  padding-top: '20px';
`
export const NoLicenseDetailsWrapper = styled(TextWrapper)`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-body-4-font-weight);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: 'var(--acx-neutrals-50)';
  padding-bottom: 50px;
`
export const TopTextWrapper = styled(TextWrapper)`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-body-4-font-weight);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: 'var(--acx-neutrals-50)';
  margin-top: 100px;
`
export const BottomTextWrapper = styled(TextWrapper)`
  font-family: var(--acx-neutral-brand-font);
  font-weight: var(--acx-body-4-font-weight);
  font-size: var(--acx-body-4-font-size);
  line-height: var(--acx-body-4-line-height);
  color: 'var(--acx-neutrals-50)';
  margin-top: -50px;
`
export const NoDataTextWrapper = styled(Space)`
  text-align: center;
  justify-content: center;
  width: 100%;
  color: var(--acx-neutrals-50);
  padding-bottom: 20px;
`
export const NoAILicenseWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: end;
  width: 85%;
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
export const LicenseButton = styled(Button)`
  width: 100%;
`
export const NoDataIcon = styled(NoData)``

import React from 'react'

import {
  PageHeader as AntPageHeader,
  PageHeaderProps as AntPageHeaderProps,
  Breadcrumb,
  Typography
} from 'antd'
import _ from 'lodash'

import { TenantLink, TenantType } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export interface PageHeaderProps
  extends Omit<AntPageHeaderProps, 'title' | 'breadcrumb' | 'children'>
{
  title: React.ReactNode,
  titleExtra?: React.ReactNode,
  breadcrumb?: { text: string, link: string, tenantType?: TenantType }[]
}

function PageHeader (props: PageHeaderProps) {
  const pageHeaderProps: AntPageHeaderProps = _.omit(props, 'breadcrumb', 'subTitle')
  pageHeaderProps.title = <Typography.Title ellipsis>{props.title}</Typography.Title>
  if (props.titleExtra) {
    pageHeaderProps.title = <>
      {pageHeaderProps.title}
      {props.titleExtra}
    </>
  }
  if (props.breadcrumb) {
    pageHeaderProps.breadcrumb = <Breadcrumb>
      {props.breadcrumb.map((breadcrumb, index) => {
        return <Breadcrumb.Item key={index}>
          <TenantLink to={breadcrumb.link}
            tenantType={breadcrumb.tenantType}>{breadcrumb.text}</TenantLink>
        </Breadcrumb.Item>
      })}
      <Breadcrumb.Item key='last'>&nbsp;</Breadcrumb.Item>
    </Breadcrumb>
  }
  return <>
    <UI.Wrapper><AntPageHeader {...pageHeaderProps}>
      {props.subTitle && <Typography.Text ellipsis>{props.subTitle}</Typography.Text>}
    </AntPageHeader></UI.Wrapper>
    {props.footer && <UI.Spacer />}
  </>
}

export { PageHeader }

import React from 'react'

import {
  PageHeader as AntPageHeader,
  PageHeaderProps as AntPageHeaderProps,
  Breadcrumb,
  Typography
} from 'antd'
import _ from 'lodash'

import { TenantLink } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'

export interface PageHeaderProps extends Omit<AntPageHeaderProps, 'title' | 'breadcrumb'> {
  title: string,
  titleExtra?: React.ReactNode
  breadcrumb?: { text: string, link: string }[],
}

function PageHeader (props: PageHeaderProps) {
  const pageHeaderProps: AntPageHeaderProps = _.omit(props, 'breadcrumb')
  pageHeaderProps.title = <Typography.Title>{props.title}</Typography.Title>
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
          <TenantLink to={breadcrumb.link}>{breadcrumb.text}</TenantLink>
        </Breadcrumb.Item>
      })}
      <Breadcrumb.Item key='last'>&nbsp;</Breadcrumb.Item>
    </Breadcrumb>
  }
  return <>
    <UI.Wrapper><AntPageHeader {...pageHeaderProps} /></UI.Wrapper>
    {props.footer && <UI.Spacer />}
  </>
}

export { PageHeader }

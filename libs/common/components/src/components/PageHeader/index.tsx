import React from 'react'

import {
  PageHeader as AntPageHeader,
  PageHeaderProps as AntPageHeaderProps,
  Breadcrumb,
  Typography
} from 'antd'
import _ from 'lodash'

import { TenantLink } from '@acx-ui/react-router-dom'

import { FooterWithDivider } from './FooterWithDivider'
import * as UI               from './styledComponents'

export interface PageHeaderProps extends Omit<AntPageHeaderProps, 'title' | 'breadcrumb'> {
  title: string,
  breadcrumb?: { text: string, link?: string }[]
}

function PageHeader (props: PageHeaderProps) {
  const pageHeaderProps: AntPageHeaderProps = _.omit(props, 'breadcrumb')
  pageHeaderProps.title = <Typography.Title>{props.title}</Typography.Title>
  if (props.breadcrumb) {
    pageHeaderProps.breadcrumb = <Breadcrumb>
      {props.breadcrumb.map((breadcrumb, index) => {
        return <Breadcrumb.Item key={index}>
          {
            breadcrumb.link
              ? <TenantLink to={breadcrumb.link}>{breadcrumb.text}</TenantLink>
              : breadcrumb.text
          }
        </Breadcrumb.Item>
      })}
    </Breadcrumb>
  }
  return <UI.Wrapper>
    <AntPageHeader {...pageHeaderProps} />
  </UI.Wrapper>
}

PageHeader.FooterWithDivider = FooterWithDivider

export { PageHeader }

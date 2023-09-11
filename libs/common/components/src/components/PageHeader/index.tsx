import React, { useLayoutEffect, useRef } from 'react'

import {
  PageHeader as AntPageHeader,
  PageHeaderProps as AntPageHeaderProps,
  Breadcrumb,
  Typography
} from 'antd'
import _ from 'lodash'

import { TenantLink, TenantType } from '@acx-ui/react-router-dom'

import { useLayoutContext } from '../Layout'

import * as UI from './styledComponents'

export interface PageHeaderProps
  extends Omit<AntPageHeaderProps, 'title' | 'breadcrumb' | 'children'>
{
  title: React.ReactNode,
  titleExtra?: React.ReactNode,
  footerSpacer?: boolean,
  breadcrumb?: { text: string, link?: string, tenantType?: TenantType }[]
}

PageHeader.defaultProps = {
  footerSpacer: true
}

function PageHeader (props: PageHeaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const layout = useLayoutContext()
  const pageHeaderProps: AntPageHeaderProps = _.omit(props, 'breadcrumb', 'subTitle')
  pageHeaderProps.title = <Typography.Title ellipsis>{props.title}</Typography.Title>

  useLayoutEffect(() => {
    const top = parseInt(getComputedStyle(ref.current!).top, 10)
    let height = ref.current!.getBoundingClientRect().height
    const tab = ref.current!.nextSibling as HTMLElement
    if (tab && tab.classList.contains('ant-tabs-card')) {
      height += 57 // second-tab height
    }
    layout.setPageHeaderY(top + height)
  })

  if (props.titleExtra) {
    pageHeaderProps.title = <>
      {pageHeaderProps.title}
      {props.titleExtra}
    </>
  }
  let extra = props.extra
  if (Array.isArray(extra)) {
    extra = (props.extra as JSX.Element[])
      .filter(Boolean)
      .map((node, index) => React.cloneElement(node, { key: `extra-${index}` }))
  }
  if (props.breadcrumb) {
    pageHeaderProps.breadcrumb = <Breadcrumb>
      {props.breadcrumb.map((breadcrumb, index) => {
        return <Breadcrumb.Item key={index}>
          {breadcrumb.link
            ? <TenantLink to={breadcrumb.link}
              tenantType={breadcrumb.tenantType}>{breadcrumb.text}</TenantLink>
            : breadcrumb.text
          }
        </Breadcrumb.Item>
      })}
      <Breadcrumb.Item key='last'>&nbsp;</Breadcrumb.Item>
    </Breadcrumb>
  }
  return <UI.Wrapper ref={ref}>
    <AntPageHeader {...pageHeaderProps} extra={extra}>
      {props.subTitle && <Typography.Text ellipsis>{props.subTitle}</Typography.Text>}
    </AntPageHeader>
    {props.footer && props.footerSpacer && <UI.Spacer />}
  </UI.Wrapper>
}

export { PageHeader }

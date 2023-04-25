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

declare global {
  // eslint-disable-next-line no-var
  var xxx: HTMLDivElement | null
}

function PageHeader (props: PageHeaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const layout = useLayoutContext()
  const pageHeaderProps: AntPageHeaderProps = _.omit(props, 'breadcrumb', 'subTitle')
  pageHeaderProps.title = <Typography.Title ellipsis>{props.title}</Typography.Title>

  useLayoutEffect(() => {
    window.xxx = ref.current
    if (!ref.current) return
    const box = ref.current.getBoundingClientRect()
    layout.setY(box.top + box.height)
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

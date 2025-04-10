import React, { useLayoutEffect, useRef } from 'react'

import {
  PageHeader as AntPageHeader,
  PageHeaderProps as AntPageHeaderProps,
  Breadcrumb,
  Typography,
  Divider
} from 'antd'
import _            from 'lodash'
import { useIntl  } from 'react-intl'

import { TenantLink, TenantType, useLocation } from '@acx-ui/react-router-dom'

import { useLayoutContext } from '../Layout'

import * as UI from './styledComponents'

type PageHeaderSubTitle = {
  label: string
  value: (number | string)[]
}

export interface PageHeaderProps
  extends Omit<AntPageHeaderProps, 'title' | 'subTitle' | 'breadcrumb' | 'children'>
{
  title: React.ReactNode,
  titlePrefix?: React.ReactNode,
  titleExtra?: React.ReactNode,
  subTitle?: AntPageHeaderProps['subTitle'] | PageHeaderSubTitle[],
  footerSpacer?: boolean,
  breadcrumb?: { text: string, link?: string, tenantType?: TenantType }[]
}

PageHeader.defaultProps = {
  footerSpacer: true
}

function PageHeader (props: PageHeaderProps) {
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const layout = useLayoutContext()
  const pageHeaderProps: AntPageHeaderProps = _.omit(props, 'breadcrumb', 'subTitle')
  const isDashboardPage = location.pathname?.includes('dashboard')
  const { $t } = useIntl()

  useLayoutEffect(() => {
    const top = parseInt(getComputedStyle(ref.current!).top, 10)
    let height = ref.current!.getBoundingClientRect().height
    const hasStickyTop = (dom?: Element | null) => (
      dom?.classList?.contains('sticky-top') ||
      dom?.querySelector('.sticky-top')
    )
    let tab = ref.current!.nextElementSibling
    while (tab && !hasStickyTop(tab)) tab = tab.nextElementSibling

    if (hasStickyTop(tab)) {
      height += 57 // second-tab height
    }
    layout.setPageHeaderY(top + height)
  })

  let titleNodes: React.ReactNode[] = [<Typography.Title ellipsis>{props.title}</Typography.Title>]
  if (props.titlePrefix) titleNodes = [props.titlePrefix, ...titleNodes]
  if (props.titleExtra) titleNodes = [...titleNodes, props.titleExtra]
  pageHeaderProps.title = (titleNodes as JSX.Element[])
    .map((node, index) => React.cloneElement(node, { key: `title-${index}` }))

  let subTitle = props.subTitle
  if (
    subTitle &&
    Array.isArray(subTitle) &&
    subTitle.every(({ label, value }) => Boolean(label) && Boolean(value))
  ) {
    const subTitles = subTitle as PageHeaderSubTitle[]
    subTitle = subTitles.map(({ label, value }, index) => (
      <span key={index} title={value.length > 1 ? value.join(', ') : undefined}>
        {$t(
          {
            defaultMessage:
              '{label}: {firstValue}{count, selectordinal, one {} other { ({count})}}',
            description: 'Translation string: <none>'
          },
          { label, firstValue: value[0], count: value.length }
        )}
        {index < subTitles.length - 1 && <Divider type='vertical' />}
      </span>
    ))
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

  return <UI.Wrapper ref={ref} greyBg={isDashboardPage}>
    <AntPageHeader {...pageHeaderProps} extra={extra}>
      {props.subTitle && <Typography.Text ellipsis>{subTitle as React.ReactNode}</Typography.Text>}
    </AntPageHeader>
    {props.footer && props.footerSpacer && <UI.Spacer />}
  </UI.Wrapper>
}

export { PageHeader }

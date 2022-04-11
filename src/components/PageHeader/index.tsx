import React   from 'react'
import {
  PageHeader as AntPageHeader,
  PageHeaderProps,
  Breadcrumb,
  Typography
} from 'antd'
import _        from 'lodash'
import { Link } from 'react-router-dom'
import * as UI  from './styledComponents'

export function PageHeader (
  props: Omit<PageHeaderProps, 'title'|'breadcrumb'> & {
    title: string,
    breadcrumb?: { text: string, link?: string }[]
  }
) {
  const pageHeaderProps: PageHeaderProps = _.omit(props, 'breadcrumb')
  pageHeaderProps.title = <Typography.Title>{props.title}</Typography.Title>
  if (props.breadcrumb) {
    pageHeaderProps.breadcrumb = <Breadcrumb>
      {props.breadcrumb.map((breadcrumb, index) => {
        return <Breadcrumb.Item key={index}>
          {
            breadcrumb.link
              ? <Link to={breadcrumb.link}>{breadcrumb.text}</Link>
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

import { forwardRef } from 'react'

import { List as AntList } from 'antd'
import styled              from 'styled-components'

import { Button as AntButton } from '@acx-ui/components'

import type { ListItemMetaProps } from 'antd/lib/list'

export const List = styled(AntList)`
  .ant-list-items {
    margin-top: -30px;
    filter: grayscale(1);
  }
`

export const Button = styled(AntButton)`
  opacity: 1;
  width: 150px;
  left: 50px;
  top 100px;
  z-index: 1;
`

List.Item = styled(AntList.Item)`
  filter: blur(2px);
  &:first-of-type { padding-top: 5px; }
  border-bottom-color: var(--acx-neutrals-25) !important;
  padding: 10px 0;
  a {
    display: block;
    flex: 1;
    text-decoration: none;
  }

  .ant-list-item-action {
    li {
      font-weight: var(--acx-body-font-weight);
      font-size: var(--acx-body-6-font-size);
      line-height: var(--acx-body-6-line-height);
      color: var(--acx-neutrals-50);
      margin-top: 15px;
    }
  }
`

const MetaNoRef = styled(AntList.Item.Meta)`
  align-items: center;

  .ant-list-item-meta-avatar {
    margin-right: 10px;
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

import { forwardRef } from 'react'

import { List as AntList } from 'antd'
import styled              from 'styled-components'

import { Button as AntButton } from '@acx-ui/components'

import type { ListItemMetaProps } from 'antd/lib/list'

export const Container = styled.div``

export const Mask = styled.div`
  backdrop-filter: grayscale(1) blur(2px);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
`

export const Button = styled(AntButton)`
  top: 80px;
  width: 150px;
`

export const ListItem = styled(AntList.Item)`
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
ListItem.Meta = forwardRef<HTMLDivElement,ListItemMetaProps>((props, ref) =>
  <div ref={ref}><MetaNoRef {...props} /></div>)

import { Collapse as AntdCollapse, CollapseProps } from 'antd'

import { CollapseActive, CollapseInactive } from '@acx-ui/icons'


const defaultCollapseIcon: CollapseProps['expandIcon'] = ({ isActive }) => (isActive)
  ? <CollapseInactive />
  : <CollapseActive />

export function Collapse (props: CollapseProps) {
  const { expandIcon, expandIconPosition, bordered, ...rest } = props

  return <AntdCollapse
    {...rest}
    expandIconPosition={expandIconPosition ?? 'end'}
    expandIcon={expandIcon ?? defaultCollapseIcon}
    bordered={bordered ?? false}
  />
}

Collapse.Panel = AntdCollapse.Panel


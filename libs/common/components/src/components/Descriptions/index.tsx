import { DescriptionsProps as AntDescriptionsProps } from 'antd'

import * as UI from './styledComponents'

export interface DescriptionsProps extends AntDescriptionsProps {
  labelWidthPercent?: number
  noSpace?: boolean
}

export function Descriptions (props: DescriptionsProps) {
  return <UI.Descriptions {...props} />
}
Descriptions.defaultProps = {
  labelWidthPercent: 40,
  noSpace: false,
  column: 1
}

Descriptions.Item = UI.Descriptions.Item
Descriptions.NoLabel = UI.NoLabel

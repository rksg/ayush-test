import { Form } from 'antd'

import { NetworkSaveData } from '@acx-ui/rc/utils'

export function AaaSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { summaryData } = props
  return (
    <Form.Item
      label='Proxy Service:'
      children={summaryData.enableAuthProxy ? 'Enabled' : 'Disabled'}
    />
  )
}

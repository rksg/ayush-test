import { Form } from 'antd'

import { NetworkSaveData } from '@acx-ui/rc/utils'

export function DpskSummaryForm (props: {
  summaryData: NetworkSaveData;
}) {
  const { summaryData } = props
  return (
    <Form.Item
      label='Security Protocol:'
      children={summaryData.wlanSecurity}
    />
  )
}


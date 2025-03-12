import {
  NetworkSaveData
} from '@acx-ui/rc/utils'

import { AaaSummary } from './AaaSummary'

type OpenSummaryFormProps = {
  summaryData: NetworkSaveData
}

export const OpenSummaryForm = (props: OpenSummaryFormProps) => {
  const { summaryData } = props
  return (<AaaSummary summaryData={summaryData} />)
}

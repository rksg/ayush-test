import React from 'react'

import {
  NetworkSaveData
} from '@acx-ui/rc/utils'


export function AaaSummaryForm (props: {
  summaryData: NetworkSaveData
}) {
  const { summaryData } = props
  return (<div>
    {summaryData.authenticationPolicyProfileId}
  </div>)
}


import React from 'react'

function rateToText (rate:number):string {
  if (rate === 0)
    return 'Unlimited'
  return rate + 'Mpbs'
}

export function RateLimitingTableCell (props: { uploadRate:number, downloadRate:number }) {
  const uploadRateText: string = rateToText(props.uploadRate)
  const downloadRateText: string = rateToText(props.downloadRate)
  return (<div>
    <div>
      <span>UP: {uploadRateText}</span>
    </div>
    <div>
      <span>Down: {downloadRateText} </span>
    </div>
  </div>)
}
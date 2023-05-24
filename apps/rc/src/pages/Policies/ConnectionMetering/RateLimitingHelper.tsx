import React from 'react'

import { useIntl } from 'react-intl'

export function RateLimitingTableCell (props: { uploadRate:number, downloadRate:number }) {
  const { $t } = useIntl()
  return (<div>
    <div>
      <span>{$t({ defaultMessage: `UP: {uploadRate, select, 
        0 {Unlimited}
        other {{uploadRate}Mbps}
        }` }, { uploadRate: props.uploadRate })}</span>
    </div>
    <div>
      <span>{$t({ defaultMessage: `DOWN: {downloadRate, select, 
        0 {Unlimited}
        other {{downloadRate}Mbps}
        }` }, { downloadRate: props.downloadRate })}</span>
    </div>
  </div>)
}
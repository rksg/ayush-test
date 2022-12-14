import { useIntl } from 'react-intl'

import { useParams } from '@acx-ui/react-router-dom'

import { ReportHeader }   from '../ReportHeader'
import { WiredReport }    from '../Reports/Wired'
import { WirelessReport } from '../Reports/Wireless'

const tabs = {
  wireless: WirelessReport,
  wired: WiredReport
}

export function NetworkReport () {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <ReportHeader name={$t({ defaultMessage: 'Network' })}/>
    { Tab && <Tab /> }
  </>
}

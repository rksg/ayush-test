import { useIntl } from 'react-intl'

import { useParams } from '@acx-ui/react-router-dom'

import { FilterMode, ReportHeader } from '../../ReportHeader'
import { Report }                   from '../../Reports'
import { ReportType }               from '../reportsMapping'

import { NetworkReportTabs } from './NetworkReportTabs'

const tabs = {
  wireless: () => <Report type={ReportType.WIRELESS} withHeader={false} />,
  wired: () => <Report type={ReportType.WIRED} withHeader={false} />
}

export function NetworkReport () {
  const { $t } = useIntl()
  const { activeTab } = useParams()
  const mode:FilterMode = activeTab === 'wired' ? 'switch' : 'ap'
  const Tab = tabs[activeTab as keyof typeof tabs]
  return <>
    <ReportHeader
      name={$t({ defaultMessage: 'Network' })}
      mode={mode}
      footer={<NetworkReportTabs />}/>
    { Tab && <Tab /> }
  </>
}

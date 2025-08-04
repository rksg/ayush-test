import { useEffect, useMemo, useState } from 'react'

import { useIntl } from 'react-intl'

import { Button, Tabs } from '@acx-ui/components'
import { Ipsec }        from '@acx-ui/rc/utils'

import { TabLabel } from '../styledComponents'

import FailoverSettings          from './FailoverSettings'
import GatewayConnectionSettings from './GatewayConnectionSettings'
import RekeySettings             from './RekeySettings'

export const MoreSettings = (props: {
  editData?: Ipsec
}) => {
  const { $t } = useIntl()
  const { editData } = props

  const [showMoreSettings, setShowMoreSettings] = useState(false)
  const [activeTabKey, setActiveTabKey] = useState<string | undefined>(undefined)

  const moreSettingsTabsInfo = useMemo(() => [
    {
      key: 'rekey',
      display: $t({ defaultMessage: 'Rekey' }),
      content: <RekeySettings editData={editData}
      />
    },
    {
      key: 'gatewayConnection',
      display: $t({ defaultMessage: 'Gateway & Connection' }),
      content: <GatewayConnectionSettings editData={editData}
      />
    },
    {
      key: 'failover',
      display: $t({ defaultMessage: 'Failover' }),
      content: <FailoverSettings editData={editData}
      />
    }
  ], [editData])

  const defaultTabKey = moreSettingsTabsInfo[0]?.key
  useEffect(() => {
    if (!activeTabKey) {
      setActiveTabKey(defaultTabKey)
    }
  }, [activeTabKey, defaultTabKey])

  return <>
    <Button type='link'
      style={{ maxWidth: '700px' }}
      onClick={() => setShowMoreSettings(!showMoreSettings)}>
      {showMoreSettings
        ? $t({ defaultMessage: 'Show less settings' })
        : $t({ defaultMessage: 'Show more settings' })}
    </Button>
    {showMoreSettings && <>
      <Tabs type='third'
        onChange={(key) => setActiveTabKey(key)}
        activeKey={activeTabKey}
      >
        {moreSettingsTabsInfo.map(({ key, display }) =>
          (<Tabs.TabPane key={key} tab={<TabLabel>{display}</TabLabel>} />))}
      </Tabs>
      <div style={{ maxHeight: '800px' }}>
        {moreSettingsTabsInfo.find(info => (info.key === activeTabKey))?.content}
      </div>
    </>}
  </>
}
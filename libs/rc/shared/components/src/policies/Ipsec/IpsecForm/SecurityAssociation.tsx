import { useEffect, useMemo, useState } from 'react'

import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle, Tabs } from '@acx-ui/components'
import { Ipsec }          from '@acx-ui/rc/utils'

import { TabLabel } from '../styledComponents'

import EspAssociationSettings from './EspAssociationSettings'
import IkeAssociationSettings from './IkeAssociationSettings'

export const SecurityAssociation = (props: {
  editData?: Ipsec
}) => {
  const { $t } = useIntl()
  const { editData } = props
  const form = Form.useFormInstance()
  const [activeTabKey, setActiveTabKey] = useState<string | undefined>(undefined)

  const secAssociationTabsInfo = useMemo(() => [
    {
      key: 'ike',
      display: $t({ defaultMessage: 'IKE' }),
      content: <IkeAssociationSettings editData={editData}
      />
    },
    {
      key: 'esp',
      display: $t({ defaultMessage: 'ESP' }),
      content: <EspAssociationSettings editData={editData}
      />
    }
  ], [editData])

  const defaultTabKey = useMemo(() => secAssociationTabsInfo[0]?.key, [secAssociationTabsInfo])

  useEffect(() => {
    if (!activeTabKey) {
      setActiveTabKey(defaultTabKey)
    }
  }, [activeTabKey, defaultTabKey])

  return <>
    <Subtitle level={5}>
      { $t({ defaultMessage: 'Security Association' }) }
    </Subtitle>
    <Tabs type='third'
      onChange={async (key) => {
        try {
          await form.validateFields([
            ['ikeSecurityAssociation',
              'ikeProposals', 'combinationValidator'],
            ['espSecurityAssociation',
              'espProposals', 'combinationValidator']])
          setActiveTabKey(key)
        } catch(e) {
          // eslint-disable-next-line no-console
          console.error(e)
        }
      }}
      activeKey={activeTabKey}
    >
      {secAssociationTabsInfo.map(({ key, display }) =>
        (<Tabs.TabPane key={key} tab={<TabLabel>{display}</TabLabel>} />))}
    </Tabs>
    <div style={{ marginBottom: '30px' }}>
      {secAssociationTabsInfo.find(info => (info.key === activeTabKey))?.content}
    </div>
  </>
}
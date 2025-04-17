/* eslint-disable react/jsx-no-comment-textnodes */
import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Drawer,
  Tabs
} from '@acx-ui/components'

import { AlarmsTable } from './AlarmsTable'

import { AlarmsType } from '.'

export function NewAlarmsDrawer (props: AlarmsType) {
  const { $t } = useIntl()
  const { visible, setVisible } = props

  window.addEventListener('showAlarmDrawer',(function (e:CustomEvent){
    setVisible(e.detail.data.visible ?? true)
    let filters = e.detail.data.name && e.detail.data.name !== 'all' ?
      { severity: [e.detail.data.name] } : {}
    if (e.detail.data.product && e.detail.data.product !== 'all') {
      filters = { ...filters, ...{ product: [e.detail.data.product] } }
    }
    setVenueId(e.detail.data.venueId ?? '')
    setSerialNumber(e.detail.data.serialNumber ?? '')
    setSelectedNewAlarmFilters(filters)
    setSelectedClearedAlarmFilters(filters)
    setNewKey('new' + (e.detail.data.name ?? '') + (e.detail.data.product ?? '') +
      (e.detail.data.venueId ?? '') + (e.detail.data.serialNumber ?? ''))
    setClearedKey('clear' + (e.detail.data.name ?? '') + (e.detail.data.product ?? '') +
      (e.detail.data.venueId ?? '') + (e.detail.data.serialNumber ?? ''))
  }) as EventListener)

  const [venueId, setVenueId] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [selectedNewAlarmFilters, setSelectedNewAlarmFilters] = useState({})
  const [selectedClearedAlarmFilters, setSelectedClearedAlarmFilters] = useState({})
  const [newKey, setNewKey] = useState('')
  const [clearedKey, setClearedKey] = useState('')
  const [currentTab, setCurrentTab] = useState('new')

  const tabs = [
    {
      key: 'new',
      title: $t({ defaultMessage: 'New Alarms' }),
      component: <AlarmsTable key={newKey}
        isNewAlarm={true}
        venueId={venueId}
        serialNumber={serialNumber}
        selectedFilters={selectedNewAlarmFilters}
        setSelectedFilters={setSelectedNewAlarmFilters} />
    },
    {
      key: 'clear',
      title: $t({ defaultMessage: 'Cleared Alarms' }),
      component:
      <AlarmsTable key={clearedKey}
        isNewAlarm={false}
        venueId={venueId}
        serialNumber={serialNumber}
        selectedFilters={selectedClearedAlarmFilters}
        setSelectedFilters={setSelectedClearedAlarmFilters} />
    }
  ]

  const onTabChange = (tab: string) => {
    setCurrentTab(tab)
  }

  const ActiveTabPane = tabs.find(({ key }) => key === currentTab)?.component

  const tabContent = <>
    <Tabs
      defaultActiveKey='new'
      activeKey={currentTab}
      onChange={onTabChange}
    >
      {tabs.map(({ key, title }) =>
        <Tabs.TabPane tab={title} key={key} />)}
    </Tabs>
    {ActiveTabPane}
  </>

  return <Drawer
    width={845}
    title={$t({ defaultMessage: 'Alarms' })}
    visible={visible}
    destroyOnClose={true}
    onClose={() => {
      setVisible(false)
      setCurrentTab('new')
    }} >
    {tabContent}
  </Drawer>
}

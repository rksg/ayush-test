/* eslint-disable react/jsx-no-comment-textnodes */
import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Tabs
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'

import { AlarmsTable } from './AlarmsTable'
import * as UI         from './styledComponents'

import { AlarmsType } from '.'

export function NewAlarmsDrawer (props: AlarmsType) {
  const { $t } = useIntl()
  const { visible, setVisible } = props
  const isFilterProductToggleEnabled = useIsSplitOn(Features.ALARM_WITH_PRODUCT_FILTER_TOGGLE)

  window.addEventListener('showAlarmDrawer',(function (e:CustomEvent){
    setVisible(true)
    let filters = e.detail.data.name && e.detail.data.name !== 'all' ?
      { severity: [e.detail.data.name] } : {}
    if (isFilterProductToggleEnabled && e.detail.data.product && e.detail.data.product !== 'all') {
      filters = { ...filters, ...{ product: [e.detail.data.product] } }
    }
    setVenueId(e.detail.data.venueId ?? '')
    setSerialNumber(e.detail.data.serialNumber ?? '')
    setSelectedNewAlarmFilters(filters)
    setSelectedClearedAlarmFilters(filters)
  }) as EventListener)

  const [venueId, setVenueId] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [selectedNewAlarmFilters, setSelectedNewAlarmFilters] = useState({})
  const [selectedClearedAlarmFilters, setSelectedClearedAlarmFilters] = useState({})
  const [currentTab, setCurrentTab] = useState('new')

  const tabs = [
    {
      key: 'new',
      title: $t({ defaultMessage: 'New Alarms' }),
      component: <AlarmsTable key='new'
        newAlarmType={true}
        venueId={venueId}
        serialNumber={serialNumber}
        filterProductEnabled={isFilterProductToggleEnabled}
        selectedFilters={selectedNewAlarmFilters}
        setSelectedFilters={setSelectedNewAlarmFilters} />
    },
    {
      key: 'clear',
      title: $t({ defaultMessage: 'Cleared Alarms' }),
      component:
      <AlarmsTable key='clear'
        newAlarmType={false}
        venueId={venueId}
        serialNumber={serialNumber}
        filterProductEnabled={isFilterProductToggleEnabled}
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

  return <UI.Drawer
    width={765}
    title={$t({ defaultMessage: 'Alarms' })}
    visible={visible}
    destroyOnClose={true}
    onClose={() => {
      setVisible(false)
      setCurrentTab('new')
    }}
    children={tabContent}
  />
}

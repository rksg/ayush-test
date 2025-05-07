import { useContext, useEffect, useRef, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, PageHeader, Tabs }                                                              from '@acx-ui/components'
import { EdgeEditContext }                                                                       from '@acx-ui/rc/components'
import { useEdgeBySerialNumberQuery }                                                            from '@acx-ui/rc/services'
import { isEdgeConfigurable }                                                                    from '@acx-ui/rc/utils'
import { UNSAFE_NavigationContext as NavigationContext, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                                                        from '@acx-ui/user'

import DnsServer                from './DnsServer'
import { EditEdgeDataProvider } from './EditEdgeDataProvider'
import GeneralSettings          from './GeneralSettings'
import Lags                     from './Lags'
import Ports                    from './Ports'
import StaticRoutes             from './StaticRoutes'
import SubInterfaces            from './SubInterfaces'

import type { History, Transition } from 'history'

const useTabs = () => {
  const { $t } = useIntl()
  const { serialNumber } = useParams()
  const { data: currentEdge } = useEdgeBySerialNumberQuery({
    params: { serialNumber },
    payload: {
      fields: ['deviceStatus', 'clusterId'],
      filters: { serialNumber: [serialNumber] } }
  })

  return {
    'general-settings': {
      title: $t({ defaultMessage: 'General Settings' }),
      content: <GeneralSettings />
    },
    ...(/*isEdgeConfigurable(currentEdge) &&*/
      {
        'ports': {
          title: $t({ defaultMessage: 'Ports' }),
          content: <Ports />
        },
        'lags': {
          title: $t({ defaultMessage: 'LAGs' }),
          content: <Lags />
        },
        'sub-interfaces': {
          title: $t({ defaultMessage: 'Sub-Interfaces' }),
          content: <SubInterfaces />
        },
        'dns': {
          title: $t({ defaultMessage: 'DNS Server' }),
          content: <DnsServer />
        },
        'routes': {
          title: $t({ defaultMessage: 'Static Routes' }),
          content: <StaticRoutes />
        }
      }
    )
  }
}

export const EditEdgeTabs = () => {

  const navigate = useNavigate()
  const { activeTab, serialNumber } = useParams()
  const basePath = useTenantLink(`/devices/edge/${serialNumber}/edit`)
  const { navigator } = useContext(NavigationContext)
  const blockNavigator = navigator as History
  const unblockRef = useRef<Function>()
  const editEdgeContext = useContext(EdgeEditContext.EditContext)
  const { formControl } = editEdgeContext
  const tabs = useTabs()

  useEffect(() => {
    if (formControl?.isDirty) {
      unblockRef.current?.()
      unblockRef.current = blockNavigator.block((tx: Transition) => {
        // do not trigger modal twice
        editEdgeContext.setFormControl({
          ...editEdgeContext.formControl,
          isDirty: false
        })
        EdgeEditContext.showUnsavedModal(
          editEdgeContext,
          {
            cancel: () => {
              editEdgeContext.setFormControl({
                ...editEdgeContext.formControl,
                isDirty: true
              })
            },
            discard: () => {
              editEdgeContext.setFormControl({
                ...editEdgeContext.formControl,
                isDirty: false
              })
              formControl?.discardFn?.()
              tx.retry()
            },
            save: () => {
              formControl?.applyFn?.()
              tx.retry()
            }
          }
        )
      })
    } else {
      unblockRef.current?.()
    }
  }, [editEdgeContext])

  const onTabChange = (activeKey: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${activeKey}`
    })
  }

  return (
    <Tabs onChange={onTabChange} activeKey={activeTab}>
      {Object.keys(tabs)
        .map((key) => <Tabs.TabPane tab={tabs[key as keyof typeof tabs]?.title} key={key} />)}
    </Tabs>
  )
}

const EditEdge = () => {

  const { $t } = useIntl()
  const params = useParams()
  const { serialNumber = '', activeTab } = params
  const { data: currentEdge } = useEdgeBySerialNumberQuery({
    params: { serialNumber },
    payload: {
      fields: ['name'],
      filters: { serialNumber: [serialNumber] } }
  }, {
    skip: !serialNumber
  })
  const [activeSubTab, setActiveSubTab] = useState({ key: '', title: '' })
  const [formControl, setFormControl] = useState({} as EdgeEditContext.EditEdgeFormControlType)
  const tabs = useTabs()

  return (
    <EdgeEditContext.EditContext.Provider value={{
      activeSubTab,
      setActiveSubTab,
      formControl,
      setFormControl
    }}>
      <PageHeader
        title={currentEdge?.name}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'RUCKUS Edges' }),
            link: '/devices/edge'
          }
        ]}
        extra={filterByAccess([
          <TenantLink to={`/devices/edge/${serialNumber}/details/overview`}>
            <Button type='primary'>{ $t({ defaultMessage: 'Back to device details' }) }</Button>
          </TenantLink>
        ])}
        footer={<EditEdgeTabs />}
      />

      <EditEdgeDataProvider
        serialNumber={serialNumber}
      >
        {tabs[activeTab as keyof typeof tabs]?.content}
      </EditEdgeDataProvider>
    </EdgeEditContext.EditContext.Provider>
  )
}

export default EditEdge
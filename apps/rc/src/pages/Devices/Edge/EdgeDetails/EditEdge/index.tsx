import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useEffect, useRef, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import { Button, CustomButtonProps, PageHeader, Tabs, showActionModal }                          from '@acx-ui/components'
import { useEdgeBySerialNumberQuery, useGetEdgeQuery }                                           from '@acx-ui/rc/services'
import { EdgeStatus, EdgeStatusEnum }                                                            from '@acx-ui/rc/utils'
import { UNSAFE_NavigationContext as NavigationContext, TenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                                                        from '@acx-ui/user'
import { getIntl }                                                                               from '@acx-ui/utils'

import DnsServer       from './DnsServer'
import GeneralSettings from './GeneralSettings'
import Ports           from './Ports'
import StaticRoutes    from './StaticRoutes'

import type { History, Transition } from 'history'

const getTabs = (currentEdge?: EdgeStatus) => {
  const { $t } = getIntl()
  return {
    'general-settings': {
      title: $t({ defaultMessage: 'General Settings' }),
      content: <GeneralSettings />
    },
    ...(
      currentEdge?.deviceStatus &&
      currentEdge?.deviceStatus !== EdgeStatusEnum.NEVER_CONTACTED_CLOUD &&
      {
        ports: {
          title: $t({ defaultMessage: 'Ports' }),
          content: <Ports />
        },
        dns: {
          title: $t({ defaultMessage: 'DNS Server' }),
          content: <DnsServer />
        },
        routes: {
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
  const editEdgeContext = useContext(EdgeEditContext)
  const { formControl } = editEdgeContext
  const { data: currentEdge } = useEdgeBySerialNumberQuery({
    params: { serialNumber },
    payload: {
      fields: ['deviceStatus'],
      filters: { serialNumber: [serialNumber] } }
  })
  const tabs = getTabs(currentEdge)

  useEffect(() => {
    if (formControl?.isDirty) {
      unblockRef.current?.()
      unblockRef.current = blockNavigator.block((tx: Transition) => {
        // do not trigger modal twice
        editEdgeContext.setFormControl({
          ...editEdgeContext.formControl,
          isDirty: false
        })
        showUnsavedModal(
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
    if(activeKey === 'ports') activeKey = activeKey + '/ports-general'
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
  const { serialNumber, activeTab } = useParams()
  const { data: edgeInfoData } = useGetEdgeQuery({ params: { serialNumber: serialNumber } })
  const [activeTabContent, setActiveTabContent] = useState<ReactNode>()
  const [activeSubTab, setActiveSubTab] = useState({ key: '', title: '' })
  const [formControl, setFormControl] = useState({} as EditEdgeFormControlType)
  const { data: currentEdge } = useEdgeBySerialNumberQuery({
    params: { serialNumber },
    payload: {
      fields: ['deviceStatus'],
      filters: { serialNumber: [serialNumber] } }
  })
  const tabs = getTabs(currentEdge)

  useEffect(() => {
    setActiveTabContent(tabs[activeTab as keyof typeof tabs]?.content)
  }, [currentEdge, activeTab])

  return (
    <EdgeEditContext.Provider value={{
      activeSubTab,
      setActiveSubTab,
      formControl,
      setFormControl
    }}>
      <PageHeader
        title={edgeInfoData?.name}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'SmartEdge' }),
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

      {activeTabContent}
    </EdgeEditContext.Provider>
  )
}

export default EditEdge

interface EditEdgeContextType {
  activeSubTab: { key: string, title: string }
  setActiveSubTab: Dispatch<SetStateAction<{ key: string, title: string }>>
  formControl: EditEdgeFormControlType
  setFormControl: Dispatch<SetStateAction<EditEdgeFormControlType>>
}

interface EditEdgeFormControlType {
  isDirty: boolean
  hasError: boolean
  discardFn?: Function,
  applyFn?: Function
}

export const EdgeEditContext = createContext({} as EditEdgeContextType)

export function showUnsavedModal (
  edgeEditContext: EditEdgeContextType,
  callback?: {
    cancel?: () => void,
    discard?: () => void,
    save?: () => void,
    default?: () => void
  }
) {
  const { activeSubTab, formControl } = edgeEditContext
  const { hasError } = formControl
  const { $t } = getIntl()
  const title = activeSubTab.title || ''
  const btns = [{
    text: $t({ defaultMessage: 'Cancel' }),
    key: 'close',
    closeAfterAction: true,
    handler: async () => {
      callback?.cancel?.()
      callback?.default?.()
    }
  }, {
    text: $t({ defaultMessage: 'Discard Changes' }),
    key: 'discard',
    closeAfterAction: true,
    handler: async () => {
      callback?.discard?.()
      callback?.default?.()
    }
  }, {
    text: $t({ defaultMessage: 'Save Changes' }),
    type: 'primary',
    key: 'save',
    closeAfterAction: true,
    handler: async () => {
      callback?.save?.()
      callback?.default?.()
    }
  }]

  showActionModal({
    type: 'confirm',
    width: 450,
    title: hasError
      ? $t({ defaultMessage: 'You Have Invalid Changes' })
      : $t({ defaultMessage: 'You Have Unsaved Changes' }),
    content: hasError
      ? $t({ defaultMessage: 'Do you want to discard your changes in "{title}"?' }, { title })
      : $t({
        defaultMessage: 'Do you want to save your changes in "{title}", or discard all changes?'
      }, { title }),
    customContent: {
      action: 'CUSTOM_BUTTONS',
      buttons: (hasError ? btns.slice(0, 2) : btns) as CustomButtonProps[]
    }
  })
}

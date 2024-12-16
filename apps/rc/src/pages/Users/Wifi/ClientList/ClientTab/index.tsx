import { createContext, useContext, useEffect, useRef, useState } from 'react'

import { useIntl } from 'react-intl'

import { ContentSwitcher, ContentSwitcherProps, CustomButtonProps, showActionModal } from '@acx-ui/components'
import { ClientDualTable }                                                           from '@acx-ui/rc/components'
import { UNSAFE_NavigationContext as NavigationContext, useParams }                  from '@acx-ui/react-router-dom'
import { getIntl, LoadTimeProvider, TrackingPages }                                  from '@acx-ui/utils'

import { ClientConnectionDiagnosis } from './CCD'
import { CcdResultViewerProps }      from './CCD/CcdResultViewer'

import type { History, Transition } from 'history'

export interface CcdControlContextData {
  isTracing: boolean
  viewStatus: CcdResultViewerProps
}

export const ClientContext = createContext({} as {
  ccdControlContext: CcdControlContextData,
  setCcdControlContext: (data: CcdControlContextData) => void
})

interface CcdRefType {
  stopCcd: Function,
}

export function ClientTab () {
  const { $t } = useIntl()

  const [ ccdControlContext, setCcdControlContext ] = useState({} as CcdControlContextData)
  const { navigator } = useContext(NavigationContext)
  const blockNavigator = navigator as History
  const unblockRef = useRef<Function>()
  const ccdRef = useRef<CcdRefType>()
  const { clientMac } = useParams<{ clientMac?: string }>()

  useEffect(() => {
    const { isTracing } = ccdControlContext
    // Avoid the show modal function to be called twice
    if (isTracing) {
      unblockRef.current?.()
      unblockRef.current = blockNavigator.block((tx: Transition) => {
        if (tx.location.hash) {
          return
        }
        setCcdControlContext({
          ...ccdControlContext,
          isTracing: false
        })
        showPageLeaveWarningModal(ccdControlContext, setCcdControlContext, ccdRef, tx.retry)
      })
    } else {
      unblockRef.current?.()
    }

  }, [ccdControlContext, blockNavigator])

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Wireless Clients' }),
      value: 'clientTable',
      disabled: ccdControlContext?.isTracing,
      children: <LoadTimeProvider page={TrackingPages.WIRELESS_CLIENTS}>
        <ClientDualTable clientMac={clientMac} />
      </LoadTimeProvider>
    },
    {
      label: $t({ defaultMessage: 'Diagnostics' }),
      value: 'diagnostics',
      children: <ClientConnectionDiagnosis ref={ccdRef}/>
    }
  ]

  const onTabChange = (value: string): void => {
    localStorage.setItem('client-tab', value)
  }
  const defaultValue = clientMac ? tabDetails[0].value
    : (localStorage.getItem('client-tab') || tabDetails[0].value)

  return <ClientContext.Provider value={{
    ccdControlContext: ccdControlContext,
    setCcdControlContext: setCcdControlContext
  }} >
    <ContentSwitcher
      tabDetails={tabDetails}
      size='large'
      defaultValue={defaultValue}
      onChange={onTabChange}
    />
  </ClientContext.Provider>
}

export const showPageLeaveWarningModal = (ccdContext: CcdControlContextData,
  setCcdContext: (data: CcdControlContextData) => void,
  ccdRef?: React.MutableRefObject<CcdRefType | undefined>,
  callback?: () => void
) => {
  const { $t } = getIntl()
  const title = $t({ defaultMessage: 'Warning' })
  const content = $t({
    // eslint-disable-next-line max-len
    defaultMessage: 'Leaving this page will stop the Diagnostics session and reset all input fields. {br} Are you sure you want to leave this page?'
  }, {
    br: <br />
  })

  const btns = [{
    text: $t({ defaultMessage: 'OK' }),
    type: 'primary',
    key: 'save',
    closeAfterAction: true,
    handler: async () => {
      // stop ccd
      await ccdRef?.current?.stopCcd()
      callback?.()
    }
  }, {
    text: $t({ defaultMessage: 'Cancel' }),
    key: 'close',
    closeAfterAction: true,
    handler: async () => {
      setCcdContext({
        ...ccdContext,
        isTracing: true
      })
    }
  }]

  showActionModal({
    type: 'confirm',
    width: 450,
    title: title,
    content: content,
    customContent: {
      action: 'CUSTOM_BUTTONS',
      buttons: btns as CustomButtonProps[]
    }
  })
}

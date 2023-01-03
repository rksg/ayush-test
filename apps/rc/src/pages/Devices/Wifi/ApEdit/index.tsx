import { createContext, useState } from 'react'

import { showActionModal, CustomButtonProps } from '@acx-ui/components'
import { ApRadioCustomization }               from '@acx-ui/rc/utils'
import { useParams }                          from '@acx-ui/react-router-dom'
import { getIntl }                            from '@acx-ui/utils'

import { ApDetailsTab }  from './ApDetailsTab'
import ApEditPageHeader  from './ApEditPageHeader'
import { ApSettingsTab } from './ApSettingsTab'

const tabs = {
  details: ApDetailsTab,
  settings: ApSettingsTab
}

export interface ApEditContextType {
  tabTitle: string,
  isDirty: boolean,
  hasError?: boolean,
  updateChanges: (data?: unknown) => void | Promise<void>,
  discardChanges: (data?: unknown) => void | Promise<void>
}
export interface RadioContext {
  radioData?: ApRadioCustomization,
  updateWifiRadio?: ((data: ApRadioCustomization) => void)
}

export const ApEditContext = createContext({} as {
  editContextData: ApEditContextType,
  setEditContextData: (data: ApEditContextType) => void,

  editRadioContextData: RadioContext,
  setEditRadioContextData: (data: RadioContext) => void
})

export function ApEdit () {
  const { activeTab } = useParams()
  const Tab = tabs[activeTab as keyof typeof tabs]
  const [editContextData, setEditContextData] = useState({} as ApEditContextType)

  const [
    editRadioContextData, setEditRadioContextData
  ] = useState({} as RadioContext)

  return <ApEditContext.Provider value={{
    editContextData,
    setEditContextData,
    editRadioContextData,
    setEditRadioContextData
  }}>
    <ApEditPageHeader />
    { Tab && <Tab /> }
  </ApEditContext.Provider>
}

export function showUnsavedModal (
  editContextData: ApEditContextType,
  setEditContextData: (data: ApEditContextType) => void,
  editRadioContextData: RadioContext,
  callback?: () => void
) {
  const { $t } = getIntl()
  const title = editContextData?.tabTitle ?? ''
  const hasError = editContextData?.hasError ?? false
  const btns = [{
    text: $t({ defaultMessage: 'Cancel' }),
    key: 'close',
    closeAfterAction: true,
    handler () {
      setEditContextData({
        ...editContextData,
        isDirty: true
      })
    }
  }, {
    text: $t({ defaultMessage: 'Discard Changes' }),
    key: 'discard',
    closeAfterAction: true,
    handler: async () => {
      editContextData?.discardChanges?.()
      callback?.()
    }
  }, {
    text: $t({ defaultMessage: 'Save Changes' }),
    type: 'primary',
    key: 'save',
    closeAfterAction: true,
    handler: async () => {
      editContextData?.updateChanges?.()
      editRadioContextData?.updateWifiRadio?.
      (editRadioContextData.radioData as ApRadioCustomization)
      callback?.()
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
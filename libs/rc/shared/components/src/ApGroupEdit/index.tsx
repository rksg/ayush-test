import { createContext, useState } from 'react'

import { useParams } from 'react-router-dom'

import { CustomButtonProps, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { goToNotFound }                       from '@acx-ui/user'
import { getIntl }                            from '@acx-ui/utils'

import { ApGroupEditPageHeader } from './ApGroupEditPageHeader'
import { ApGroupGeneralTab }     from './ApGroupGeneralTab'
import { ApGroupVlanRadioTab }   from './ApGroupVlanRadioTab'

export type ApGroupEditContextType = {
  tabTitle: string
  unsavedTabKey?: string
  isDirty: boolean
  hasError?: boolean
  updateChanges?: (data?: unknown) => void | Promise<void>
  discardChanges?: (data?: unknown) => void | Promise<void>
}

export const ApGroupEditContext = createContext({} as {
  isApGroupTableFlag: boolean
  isEditMode: boolean
  editContextData: ApGroupEditContextType
  setEditContextData:(data: ApGroupEditContextType) => void
  previousPath: string
  setPreviousPath: (data: string) => void
})

const tabs = {
  general: ApGroupGeneralTab,
  vlanRadio: ApGroupVlanRadioTab
}

export function ApGroupEdit () {
  const isApGroupTableFlag = useIsSplitOn(Features.AP_GROUP_TOGGLE)
  const { activeTab = 'general', action } = useParams()
  const isEditMode = action === 'edit'
  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound

  const [previousPath, setPreviousPath] = useState('')
  const [editContextData, setEditContextData] = useState({} as ApGroupEditContextType)

  return (
    <ApGroupEditContext.Provider value={{
      isEditMode, isApGroupTableFlag,
      previousPath, setPreviousPath,
      editContextData, setEditContextData
    }} >
      <ApGroupEditPageHeader />
      {Tab && <Tab />}
    </ApGroupEditContext.Provider>
  )
}

type ApGroupEditSettingsProps = {
  editContextData: ApGroupEditContextType
  setEditContextData:(data: ApGroupEditContextType) => void
}

const processApGroupEditSettings = (props: { editContextData: ApGroupEditContextType }) => {
  const { editContextData } = props
  editContextData?.updateChanges?.()
}

const discardApGroupEditSettings = (props: { editContextData: ApGroupEditContextType }) => {
  const { editContextData } = props
  editContextData?.discardChanges?.()
}

const resetApGroupEditContextData = (props: ApGroupEditSettingsProps) => {
  const { editContextData, setEditContextData } = props

  setEditContextData({
    tabTitle: editContextData.tabTitle,
    unsavedTabKey: editContextData.unsavedTabKey,
    isDirty: false
  })
}

export function showUnsavedModal (
  editContextData: ApGroupEditContextType,
  setEditContextData: (data: ApGroupEditContextType) => void,
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
      discardApGroupEditSettings({ editContextData })
      resetApGroupEditContextData({
        editContextData,
        setEditContextData
      })

      callback?.()
    }
  }, {
    text: $t({ defaultMessage: 'Save Changes' }),
    type: 'primary',
    key: 'save',
    closeAfterAction: true,
    handler: async () => {
      processApGroupEditSettings({ editContextData })

      resetApGroupEditContextData({
        editContextData,
        setEditContextData
      })

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

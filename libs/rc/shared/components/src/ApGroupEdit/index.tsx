import { useParams } from 'react-router-dom'

import { CustomButtonProps, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { goToNotFound }                       from '@acx-ui/user'
import { getIntl }                            from '@acx-ui/utils'

import { ApGroupEditPageHeader }                              from './ApGroupEditPageHeader'
import { ApGroupGeneralTab }                                  from './ApGroupGeneralTab'
import { ApGroupRadioTab }                                    from './ApGroupRadioTab'
import { ApGroupVlanRadioTab }                                from './ApGroupVlanRadioTab'
import { ApGroupEditContextProvider, ApGroupEditContextType } from './context'


export type ApGroupRadioConfigItemProps = {
  isAllowEdit?: boolean
}

export function ApGroupEdit () {
  const { activeTab = 'general' } = useParams()
  // eslint-disable-next-line max-len
  const isApGroupMoreParameterPhase1Enabled = useIsSplitOn(Features.WIFI_AP_GROUP_MORE_PARAMETER_PHASE1_TOGGLE)
  const tabs = {
    general: ApGroupGeneralTab,
    ...(isApGroupMoreParameterPhase1Enabled
      ? { radio: ApGroupRadioTab }
      : { vlanRadio: ApGroupVlanRadioTab }
    )
  }

  const Tab = tabs[activeTab as keyof typeof tabs] || goToNotFound

  return (
    <ApGroupEditContextProvider>
      <ApGroupEditPageHeader />
      {Tab && <Tab />}
    </ApGroupEditContextProvider>
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

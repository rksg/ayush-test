import { createContext, Dispatch, SetStateAction } from 'react'

import { CustomButtonProps, showActionModal } from '@acx-ui/components'
import { getIntl }                            from '@acx-ui/utils'

export enum EdgePortTabEnum {
  PORTS_GENERAL = 'ports-general',
  LAG = 'lag',
  SUB_INTERFACE = 'sub-interface'
}

export interface EditEdgeContextType {
  activeSubTab: { key: string, title: string }
  setActiveSubTab: Dispatch<SetStateAction<{ key: string, title: string }>>
  formControl: EditEdgeFormControlType
  setFormControl: Dispatch<SetStateAction<EditEdgeFormControlType>>
}

export interface EditEdgeFormControlType {
  isDirty: boolean
  hasError: boolean
  discardFn?: Function,
  applyFn?: Function
}

export const EditContext = createContext({} as EditEdgeContextType)

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
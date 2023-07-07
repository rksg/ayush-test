import React from 'react'

import { FormattedMessage, IntlShape } from 'react-intl'

import { ActionModalType, showActionModal } from '@acx-ui/components'
import {
  LangKey,
  DEFAULT_SYS_LANG
} from '@acx-ui/utils'
import { getIntl, setUpIntl, IntlSetUpError } from '@acx-ui/utils'

export type FullfilledAction = {
  type: string,
  meta: {
    baseQueryMeta: {
      response: {
        status: number
      }
    },
    arg?: {
      browserLang: string
    }
  }
}

let isModalShown = false

function getBrowserLangName (langKey: string) {
  const bLang = langKey.slice(0, 2)
  const browserLangDisplay = new Intl.DisplayNames(['en'], { type: 'language' })
  return browserLangDisplay.of(bLang)
}

export const getBrowserModelContent = (browserLang: string) => {
  const bLangDisplay = getBrowserLangName(browserLang)
  let intl: IntlShape
  try {
    intl = getIntl()
  } catch (error) {
    if (!(error instanceof IntlSetUpError)) throw error
    setUpIntl({ locale: 'en-US' })
    intl = getIntl()
  }
  const { $t } = intl
  const browserDialog = {
    title: $t({ defaultMessage: 'Change System Language?' }),
    content: $t({ defaultMessage: 'We noticed that your browser is set to {bLangDisplay}'
          + ' Would you like to change the system\'s language to {bLangDisplay}?' },
    { bLangDisplay })
  }

  let type: ActionModalType = 'confirm'
  let isBrowerLangChange = true
  let callback = undefined

  return {
    title: browserDialog?.title,
    content: <FormattedMessage
      {...browserDialog?.content}
      values={{ br: () => <br /> }}
    />,
    type,
    callback,
    isBrowerLangChange
  }
}

export const showBrowserModal = (browserLang: string, details: {
  title: string,
  content: JSX.Element,
  type: ActionModalType,
  callback?: (isBrowerLangChange: boolean) => boolean
}) => {
  let intl: IntlShape
  try {
    intl = getIntl()
  } catch (error) {
    if (!(error instanceof IntlSetUpError)) throw error
    setUpIntl({ locale: DEFAULT_SYS_LANG })
    intl = getIntl()
  }
  const { $t } = intl
  const { title, content, type, callback } = details
  const bLangDisplay = getBrowserLangName(browserLang)

  if (title && !isModalShown) {
    isModalShown = true
    showActionModal({
      type,
      title,
      content,
      ...(type === 'confirm' && { customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [
          {
            text: $t({ defaultMessage: 'Cancel' }),
            type: 'default',
            key: 'cancel'
          }, {
            text: $t({ defaultMessage: 'Change to {bLangDisplay}' }, { bLangDisplay } ),
            type: 'primary',
            key: 'ok',
            closeAfterAction: true,
            handler () {
              callback?.(true)
              isModalShown = false
            }
          }
        ]
      } })
    })
  }
}

export const browserDialog = (browserLangVal: LangKey) => {
  // console.log('In browser dialog ... ', browserLangVal)
  let isBrowerLangChange = false
  if (browserLangVal !== DEFAULT_SYS_LANG) {
    const { isBrowerLangChange, ...details } = getBrowserModelContent(browserLangVal)
    showBrowserModal(browserLangVal, details)
  }

  if (!isBrowerLangChange) {
    // console.log('==========', isBrowerLangChange)
    return browserLangVal as LangKey
  }
  return DEFAULT_SYS_LANG
}

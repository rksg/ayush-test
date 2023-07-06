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

// Needed for Browser language detection
const supportedLocales: Record<string, LangKey> = {
  'en-US': 'en-US',
  'en': 'en-US',
  'es': 'es-ES',
  'es-ES': 'es-ES',
  'ja': 'ja-JP',
  'ja-JP': 'ja-JP',
  'fr': 'fr-FR',
  'fr-FR': 'fr-FR',
  'ko': 'ko-KR',
  'ko-KR': 'ko-KR',
  'pt': 'pt-BR',
  'pt-BR': 'pt-BR'
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
  let isBrowerLangChange = false
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
  callback?: () => void
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
              callback?.()
              isModalShown = false
            }
          }
        ]
      } })
    })
  }
}

export const browserDialog = (locales: readonly string[]) => {
  // const isI18n2 = useIsSplitOn(Features.I18N_PHASE2_TOGGLE)
  // let browserLang = action?.meta?.arg?.browserLang || DEFAULT_SYS_LANG
  const locale = locales.find(locale =>
    supportedLocales[locale as keyof typeof supportedLocales]) || DEFAULT_SYS_LANG
  let browserLangVal = supportedLocales[locale as keyof typeof supportedLocales]
  // console.log('In browser dialog ... ')
  const { isBrowerLangChange, ...details } = getBrowserModelContent(browserLangVal)
  if (browserLangVal !== DEFAULT_SYS_LANG) {
    showBrowserModal(browserLangVal, details)
  }

  if (isBrowerLangChange) {
    return browserLangVal as LangKey
  }
  return DEFAULT_SYS_LANG
}

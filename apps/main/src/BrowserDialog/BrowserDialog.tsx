import { IntlShape } from 'react-intl'

import { showActionModal }                from '@acx-ui/components'
import { browserSupportedLocales as bsl } from '@acx-ui/types'
import {
  DetailLevel
} from '@acx-ui/user'
import { LangKey, DEFAULT_SYS_LANG }          from '@acx-ui/utils'
import { getIntl, setUpIntl, IntlSetUpError } from '@acx-ui/utils'

export interface PartialUserData {
  detailLevel: DetailLevel,
  dateFormat: string,
  preferredLanguage: string
}

export const updateBrowserCached = (lang: LangKey) => {
  localStorage.setItem('browserLang', lang)
}

export const detectBrowserLang = () => {
  const locales = navigator.languages
  const locale = locales.find(locale =>
    bsl[locale as keyof typeof bsl]) || DEFAULT_SYS_LANG
  return bsl[locale as keyof typeof bsl] as LangKey
}

interface BrowserDialogResult {
  lang: string,
  isLoading: boolean
}

export const showBrowserLangDialog = (userLang: LangKey):Promise<BrowserDialogResult> => {
  const browserLang = detectBrowserLang()
  const bLang = browserLang.slice(0, 2)
  const uLang = userLang.slice(0, 2)
  const browserLangDisplay = new Intl.DisplayNames(['en'], { type: 'language' })
  const bLangDisplay = browserLangDisplay.of(bLang)
  const uLangDisplay = browserLangDisplay.of(uLang)
  let intl: IntlShape
  try {
    intl = getIntl()
  } catch (error) {
    if (!(error instanceof IntlSetUpError)) throw error
    setUpIntl({ locale: DEFAULT_SYS_LANG })
    intl = getIntl()
  }
  const { $t } = intl

  return new Promise(( async (resolve, reject) => {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [{
          text: $t({ defaultMessage: 'Keep {uLangDisplay}' }, { uLangDisplay }),
          type: 'default',
          key: 'cancel',
          closeAfterAction: true,
          handler: () => {
            const result = { lang: '', isLoading: false }
            updateBrowserCached(browserLang)
            reject(result)
          }
        }, {
          text: $t({ defaultMessage: 'Change to {bLangDisplay}' }, { bLangDisplay }),
          type: 'primary',
          key: 'ok',
          closeAfterAction: true,
          handler: () => {
            const result = { lang: browserLang, isLoading: false }
            updateBrowserCached(browserLang)
            resolve(result)
          }
        }]
      },
      title: $t({ defaultMessage: 'Change System Language?' }),
      content: $t({ defaultMessage: 'We noticed that your browser is set to {bLangDisplay}'
            + ' Would you like to change the system\'s language to {bLangDisplay}?' },
      { bLangDisplay })
    })
  }))
}

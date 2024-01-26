import { IntlShape } from 'react-intl'

import { showActionModal }                from '@acx-ui/components'
import { browserSupportedLocales as bsl } from '@acx-ui/types'
import { DetailLevel }                    from '@acx-ui/user'
import {
  LangKey,
  DEFAULT_SYS_LANG,
  getIntl,
  setUpIntl,
  IntlSetUpError
}          from '@acx-ui/utils'

export interface PartialUserData {
  detailLevel: DetailLevel,
  dateFormat: string,
  preferredLanguage: string
}

export const isNonProdEnv = () => {
  const domains = ['localhost', 'int', 'dev', 'qa', 'scale', 'stage']
  // Subdomain
  const len = window.location.hostname.split('.').length - 3
  const subdomain = window.location.hostname.split('.')[len]
  return (window.location.hostname === 'localhost' || domains.includes(subdomain))
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

export const showBrowserLangDialog = ():Promise<BrowserDialogResult> => {
  const browserLang = detectBrowserLang()
  const bLang = browserLang.slice(0, 2)
  const browserLangDisplay = new Intl.DisplayNames(['en'], { type: 'language' })
  const bLangDisplay = browserLangDisplay.of(bLang)
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
          text: $t({ defaultMessage: 'Cancel' }),
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

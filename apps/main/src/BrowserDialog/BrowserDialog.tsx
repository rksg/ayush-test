import { useCallback } from 'react'

import { useIntl } from 'react-intl'

import { showActionModal }                from '@acx-ui/components'
import { browserSupportedLocales as bsl } from '@acx-ui/types'
import {
  DetailLevel,
  useUpdateUserProfileMutation,
  useUserProfileContext
} from '@acx-ui/user'
import {
  LangKey,
  DEFAULT_SYS_LANG,
  useLocaleContext
} from '@acx-ui/utils'

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

export const useBrowserDialog = () => {
  const { $t } = useIntl()
  const { lang: userLang, setLang } = useLocaleContext()
  const [updateUserProfile] = useUpdateUserProfileMutation()

  const { data: userProfile } = useUserProfileContext()

  const showBrowserLangDialog = useCallback(() => {
    const browserLang = detectBrowserLang()
    const browserCacheLang = localStorage.getItem('browserLang')
    if (userLang === browserLang || browserCacheLang === browserLang) {
      return
    }
    const bLang = browserLang.slice(0, 2)
    const uLang = userLang.slice(0, 2)
    const browserLangDisplay = new Intl.DisplayNames(['en'], { type: 'language' })
    const bLangDisplay = browserLangDisplay.of(bLang)
    const uLangDisplay = browserLangDisplay.of(uLang)
    return showActionModal({
      type: 'confirm',
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [{
          text: $t({ defaultMessage: 'Keep {uLangDisplay}' }, { uLangDisplay }),
          type: 'default',
          key: 'cancel',
          closeAfterAction: true,
          handler: () => {
            updateBrowserCached(browserLang)
          }
        }, {
          text: $t({ defaultMessage: 'Change to {bLangDisplay}' }, { bLangDisplay }),
          type: 'primary',
          key: 'ok',
          closeAfterAction: true,
          handler: async () => {
            updateBrowserCached(browserLang)

            await updateUserProfile({
              payload: {
                detailLevel: userProfile?.detailLevel,
                dateFormat: userProfile?.dateFormat,
                preferredLanguage: browserLang
              },
              params: { tenantId: userProfile?.tenantId }
            }).unwrap()

            setLang(browserLang)
          }
        }]
      },
      title: $t({ defaultMessage: 'Change System Language?' }),
      content: $t({ defaultMessage: 'We noticed that your browser is set to {bLangDisplay}'
            + ' Would you like to change the system\'s language to {bLangDisplay}?' },
      { bLangDisplay })
    })
  }, [$t, userLang, updateUserProfile, userProfile, setLang])

  return { showBrowserLangDialog }
}

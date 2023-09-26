import { useRef, useState } from 'react'

import { IntlShape } from 'react-intl'

import { showActionModal }                from '@acx-ui/components'
import { useParams }                      from '@acx-ui/react-router-dom'
import { browserSupportedLocales as bsl } from '@acx-ui/types'
import {
  DetailLevel,
  useUpdateUserProfileMutation,
  UserProfile as UserProfileInterface
} from '@acx-ui/user'
import { LangKey, DEFAULT_SYS_LANG }          from '@acx-ui/utils'
import { getIntl, setUpIntl, IntlSetUpError } from '@acx-ui/utils'

export interface BrowserDialogProps {
  detailLevel: DetailLevel,
  dateFormat: string,
  preferredLanguage: string,
  isDialogOpen: boolean
  setDialogOpen: (isDialogOpen: boolean) => void
}

const isNonProdEnv = ( window.location.hostname === 'ruckus.cloud' ||
  window.location.hostname === 'eu.ruckus.cloud' ||
  window.location.hostname === 'asia.ruckus.cloud' ||
  window.location.hostname === 'stage.ruckus.cloud' )

const updateBrowserCached = (lang: LangKey) => {
  localStorage.setItem('browserLang', lang)
  localStorage.setItem('isBrowserDialog', 'true')
}

const detectBrowserLang = () => {
  const locales = navigator.languages
  const locale = locales.find(locale =>
    bsl[locale as keyof typeof bsl]) || DEFAULT_SYS_LANG
  return bsl[locale as keyof typeof bsl] as LangKey
}

const showBrowserLangDialog = (browserLang: LangKey) => {
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
  const onOk = () => {
    return new Promise((resolve, reject) => {
      setTimeout(Math.random() > 0.5 ? resolve : reject, 1000)
    }).catch(() => {
      console.log('Oops errors!') // eslint-disable-line no-console
      // return false
    })
  }

  showActionModal({
    type: 'confirm',
    customContent: {
      action: 'CUSTOM_BUTTONS',
      buttons: [{
        text: $t({ defaultMessage: 'Cancel' }),
        type: 'default',
        key: 'cancel',
        closeAfterAction: true,
        handler () {
          updateBrowserCached(browserLang)
        }
      }, {
        text: $t({ defaultMessage: 'Change to {bLangDisplay}' }, { bLangDisplay }),
        type: 'primary',
        key: 'ok',
        closeAfterAction: true,
        handler () {
          updateBrowserCached(browserLang)
          onOk()
        }
      }]
    },
    title: $t({ defaultMessage: 'Change System Language?' }),
    content: $t({ defaultMessage: 'We noticed that your browser is set to {bLangDisplay}'
          + ' Would you like to change the system\'s language to {bLangDisplay}?' },
    { bLangDisplay })
  })
  // return false
}

export const useBrowserLang = (userProfile: UserProfileInterface | undefined) => {
  let [lang, setLang] = useState<LangKey | undefined>(undefined)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  // prevent popup 2 times in strict mode.
  const isCheckedRef = useRef<boolean>(false)
  const [ updateUserProfile ] = useUpdateUserProfileMutation()
  const { tenantId } = useParams()
  const browserLang = detectBrowserLang()
  const openDialog = browserLang !== DEFAULT_SYS_LANG &&
    browserLang !== userProfile?.preferredLanguage
  const isBrowserDialog = localStorage.getItem('isBrowserDialog')

  const handleUpdateSettings = async (data: Partial<UserProfileInterface>) => {
    try {
      updateBrowserCached(data?.preferredLanguage as LangKey)
      updateUserProfile({
        payload: data,
        params: { tenantId }
      }).unwrap()
    } catch (error) {
      // TODO: what to do if update failed?
      updateBrowserCached(data?.preferredLanguage as LangKey)
      console.log(error) // eslint-disable-line no-console
    }
  }
  if (lang === undefined && !isCheckedRef.current && userProfile) {
    if (openDialog && isBrowserDialog !== 'true' && isNonProdEnv) {
      isCheckedRef.current = true
      showBrowserLangDialog(browserLang as LangKey)
      // console.log('dialogResult===================')
      // console.log(dialogResult)
      handleUpdateSettings(userProfile)
      setLang(browserLang)
      setIsLoading(false)
      // Throwing error temporarily commented out
      // lang = browserLang
      // dialogResult.then(data => {
      //   // user select 'yes'
      //   // handleUpdateSettings(data)
      //   console.log('user selected ok button ')
      //   console.log(data)
      // }).catch(() => {
      //   // user select `no`
      //   console.log('user selected cancel button ')
      // })
    } else {
      // close loading due to checked finished.
      isCheckedRef.current = false
      setIsLoading(false)
    }

  }
  return { lang, isLoading }
}


/*export async function BrowserDialog ( broswerLang: LangKey, props: BrowserDialogProps) {
  let { detailLevel, dateFormat, preferredLanguage, isDialogOpen, setDialogOpen } = props
  const [ updateUserProfile ] = useUpdateUserProfileMutation()
  const { tenantId } = useParams()
  const bLang = broswerLang.slice(0, 2)
  const browserLangDisplay = new Intl.DisplayNames(['en'], { type: 'language' })
  let intl: IntlShape
  try {
    intl = getIntl()
  } catch (error) {
    if (!(error instanceof IntlSetUpError)) throw error
    setUpIntl({ locale: DEFAULT_SYS_LANG })
    intl = getIntl()
  }
  const { $t } = intl
  const bLangDisplay = browserLangDisplay.of(bLang)
  const handleUpdateSettings = async (data: Partial<UserProfileInterface>) => {
    try {
      await updateUserProfile({
        payload: data,
        params: { tenantId }
      }).unwrap()
      setDialogOpen(false)
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
    localStorage.setItem('browserLang', broswerLang)
    localStorage.setItem('isBrowserDialog', 'true')
  }
  if (isDialogOpen && !isNonProdEnv) {
    showActionModal({
      type: 'confirm',
      customContent: {
        action: 'CUSTOM_BUTTONS',
        buttons: [{
          text: $t({ defaultMessage: 'Cancel' }),
          type: 'default',
          key: 'cancel',
          closeAfterAction: true,
          handler () {
            setDialogOpen(false)
            localStorage.setItem('browserLang', preferredLanguage)
            localStorage.setItem('isBrowserDialog', 'true')
          }
        }, {
          text: $t({ defaultMessage: 'Change to {bLangDisplay}' }, { bLangDisplay }),
          type: 'primary',
          key: 'ok',
          closeAfterAction: true,
          async handler () {
            const data = {
              dateFormat,
              detailLevel,
              preferredLanguage: broswerLang
            }
            await handleUpdateSettings(data)
            setDialogOpen(false)
          }
        }]
      },
      title: $t({ defaultMessage: 'Change System Language?' }),
      content: $t({ defaultMessage: 'We noticed that your browser is set to {bLangDisplay}'
            + ' Would you like to change the system\'s language to {bLangDisplay}?' },
      { bLangDisplay })
    })
  }
  return props
}*/

/*export function LoadMessages (userProfile: UserProfileInterface): LangKey {
  const locales = navigator.languages
  const locale = locales.find(locale =>
    bsl[locale as keyof typeof bsl]) || DEFAULT_SYS_LANG
  const supportedBrowserLang = bsl[locale as keyof typeof bsl]
  const openDialog = supportedBrowserLang !== DEFAULT_SYS_LANG &&
    supportedBrowserLang !== userProfile?.preferredLanguage
  const isBrowserDialog = localStorage.getItem('isBrowserDialog')

  if ( openDialog && isBrowserDialog !== 'true') {
    const isOpen = true
    const bDialogProps: BrowserDialogProps = {
      detailLevel: userProfile?.detailLevel as DetailLevel,
      dateFormat: userProfile?.dateFormat as string,
      preferredLanguage: userProfile?.preferredLanguage as string,
      isDialogOpen: true,
      setDialogOpen: () => isOpen
    }
    const BDConfirm = BrowserDialog(supportedBrowserLang as LangKey, bDialogProps)
    if (BDConfirm) {
      BDConfirm.then(data => {
        bDialogProps.setDialogOpen(false)
        return data?.preferredLanguage as LangKey
      })
    }
  }
  return userProfile?.preferredLanguage as LangKey
}*/

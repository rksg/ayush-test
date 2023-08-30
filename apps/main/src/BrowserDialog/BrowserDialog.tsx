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

export async function BrowserDialog ( broswerLang: LangKey, props: BrowserDialogProps) {
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
}

export function LoadMessages (userProfile: UserProfileInterface): LangKey {
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
}

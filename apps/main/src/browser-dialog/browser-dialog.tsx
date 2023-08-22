import { IntlShape } from 'react-intl'

import { showActionModal }                from '@acx-ui/components'
import { useParams }                      from '@acx-ui/react-router-dom'
import { browserSupportedLocales as bsl } from '@acx-ui/types'
import {
  useGetUserProfileQuery,
  DetailLevel,
  useUpdateUserProfileMutation,
  UserProfile as UserProfileInterface
} from '@acx-ui/user'
import { LangKey, DEFAULT_SYS_LANG }          from '@acx-ui/utils'
import { getIntl, setUpIntl, IntlSetUpError } from '@acx-ui/utils'

export interface BrowserDialogProps {
  browserLanguages: Readonly<string[]>,
  detailLevel: DetailLevel,
  dateFormat: string,
  preferredLanguage: string,
  isDialogOpen: boolean
  // setDialogOpen: (isDialogOpen: boolean) => void
}

const isNonProdEnv = ( window.location.hostname === 'ruckus.cloud' ||
  window.location.hostname === 'eu.ruckus.cloud' ||
  window.location.hostname === 'asia.ruckus.cloud' ||
  window.location.hostname === 'stage.ruckus.cloud' )

export async function BrowserDialog ( broswerLang: LangKey, profile: BrowserDialogProps) {
  let { detailLevel, dateFormat, isDialogOpen } = profile
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
  if (isDialogOpen && !isNonProdEnv) {
    // const [isDialogVisible, setIsDialogVisible] = useState(false)
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
            isDialogOpen = false
          }
        }, {
          text: $t({ defaultMessage: 'Change to {bLangDisplay}' }, { bLangDisplay }),
          type: 'primary',
          key: 'ok',
          closeAfterAction: true,
          handler () {
            // console.log(`broswerLang in dialogbox: ${broswerLang} User Profile: ${profile}`)
            const data = {
              dateFormat,
              detailLevel,
              preferredLanguage: broswerLang
            }
            const handleUpdateSettings = async (data: Partial<UserProfileInterface>) => {
              await updateUserProfile({ payload: data, params: { tenantId } })
              localStorage.setItem('browserLang', broswerLang)
              localStorage.setItem('isBrowserDialog', 'true')
              profile.isDialogOpen = false
              isDialogOpen = false
            }
            handleUpdateSettings(data)
          }
        }]
      },
      title: $t({ defaultMessage: 'Change System Language?' }),
      content: $t({ defaultMessage: 'We noticed that your browser is set to {bLangDisplay}'
            + ' Would you like to change the system\'s language to {bLangDisplay}?' },
      { bLangDisplay })
    })
  }
  // console.log(profile)
  return profile
}

export function LoadMessages (): LangKey {
  const result = useGetUserProfileQuery({})
  const { data: userProfile } = result
  const bDialogProps: BrowserDialogProps = {
    browserLanguages: navigator.languages,
    detailLevel: userProfile?.detailLevel as DetailLevel,
    dateFormat: userProfile?.dateFormat as string,
    preferredLanguage: userProfile?.preferredLanguage as string,
    isDialogOpen: false
  }

  const { browserLanguages, preferredLanguage } = bDialogProps
  const locale = browserLanguages.find(locale =>
    bsl[locale as keyof typeof bsl]) || DEFAULT_SYS_LANG
  // return bsl[locale as keyof typeof bsl]
  let supportedBrowserLang = bsl[locale as keyof typeof bsl]
  const lsBrowserLang = localStorage.getItem('browserLang')
  let browserLang = lsBrowserLang?? supportedBrowserLang
  const isBrowserDialog = localStorage.getItem('isBrowserDialog')
  const openDialog = browserLang !== DEFAULT_SYS_LANG && browserLang !== preferredLanguage

  if ( openDialog && Boolean(!isBrowserDialog) ) {
    bDialogProps.isDialogOpen = true
    const BDConfirm = BrowserDialog(browserLang as LangKey, bDialogProps)
    BDConfirm.then(data => {
      // console.log(data?.preferredLanguage)
      return data?.preferredLanguage as LangKey
    })
  }
  return preferredLanguage as LangKey
}

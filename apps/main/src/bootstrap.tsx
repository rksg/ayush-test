import React from 'react'

import { Root }          from 'react-dom/client'
import { IntlShape }     from 'react-intl'
import { addMiddleware } from 'redux-dynamic-middlewares'

import { showActionModal } from '@acx-ui/components'
import {
  ConfigProvider,
  Loader,
  SuspenseBoundary
} from '@acx-ui/components'
import { get }                    from '@acx-ui/config'
import { useGetPreferencesQuery } from '@acx-ui/rc/services'
import { BrowserRouter }          from '@acx-ui/react-router-dom'
import { Provider }               from '@acx-ui/store'
import { useGetUserProfileQuery } from '@acx-ui/user'
import {
  UserProfileProvider,
  useUserProfileContext,
  UserUrlsInfo
} from '@acx-ui/user'
import {
  getTenantId,
  createHttpRequest,
  useLocaleContext,
  LangKey,
  DEFAULT_SYS_LANG
} from '@acx-ui/utils'
import { getIntl, setUpIntl, IntlSetUpError } from '@acx-ui/utils'

import AllRoutes from './AllRoutes'
// import { browserDialog }   from './browser-dialog'
import { errorMiddleware } from './errorMiddleware'
import '@acx-ui/theme'

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
declare global {
  /* eslint-disable no-var */
  var pendo: {
    initialize(init: Record<string, Record<string, string | boolean>>): void
  }
  function pendoInitalization (): void
}

// const callBrowserLang = (locale: string) => {
//   return browserLangSelection(locale)
// }

async function setBrowserLang () {
  const locales = navigator.languages
  const locale = locales.find(locale =>
    supportedLocales[locale as keyof typeof supportedLocales]) || DEFAULT_SYS_LANG
  let browserLangVal = supportedLocales[locale as keyof typeof supportedLocales]
  if (browserLangVal !== DEFAULT_SYS_LANG) {
    const val: boolean = await browserLangSelection(browserLangVal)
    // console.log(`val===========>>>>> ${val}`)
    browserLangVal = (val) ? browserLangVal : DEFAULT_SYS_LANG
    return String(browserLangVal) as LangKey
  }
  return String(browserLangVal) as LangKey
}

export function loadMessages (locales: readonly string[]): LangKey {
  const locale = locales.find(locale =>
    supportedLocales[locale as keyof typeof supportedLocales]) || DEFAULT_SYS_LANG
  let browserLangVal = supportedLocales[locale as keyof typeof supportedLocales]
  // if (browserLangVal !== DEFAULT_SYS_LANG) {
  //   // const val = browserLangSelection(browserLangVal)
  //   // browserLangVal = (val) ? browserLangVal : DEFAULT_SYS_LANG
  //   // console.log(`val===========>>>>> ${val}`)
  // }
  return browserLangVal
}

export function renderPendoAnalyticsTag () {
  const script = document.createElement('script')
  script.defer = true
  // @ts-ignore
  const key = get('PENDO_API_KEY')
  script.onerror = event => {
    /* eslint-disable */  // Disables everything from this point down
    console.error('Failed to load pendo api key from env', event)
  }
  // Installing Pendo snippet
  const scriptText = `(function(apiKey){
                      (function(p,e,n,d,o){var v,w,x,y,z;o=p[d]=p[d]||{};o._q=[];
                        v=['initialize','identify','updateOptions','pageLoad'];for(w=0,x=v.length;w<x;++w)(function(m){
                        o[m]=o[m]||function(){o._q[m===v[0]?'unshift':'push']([m].concat([].slice.call(arguments,0)));};})(v[w]);
                        y=e.createElement(n);y.async=!0;y.onload=window.pendoInitalization;y.src='https://cdn.pendo.io/agent/static/'+apiKey+'/pendo.js';
                        z=e.getElementsByTagName(n)[0];z.parentNode.insertBefore(y,z);})(window,document,'script','pendo');
                      })('${key}');`
  /* eslint-enable */
  const inlineScript = document.createTextNode(scriptText)
  script.appendChild(inlineScript)
  window.pendoInitalization = pendoInitalization
  document.body.appendChild(script)
}

export async function pendoInitalization (): Promise<void> {
  const tenantId = getTenantId()
  const userProfileRequest = createHttpRequest(UserUrlsInfo.getUserProfile, { tenantId })
  const url = userProfileRequest.url

  try {
    const res = await fetch(url, userProfileRequest)
    const user = await res.json()
    window.pendo.initialize({
      visitor: {
        id: user.externalId,
        full_name: `${user.firstName} ${user.lastName}`,
        role: user.role,
        version: user.pver,
        var: user.var,
        varTenantId: user.varTenantId,
        support: user.support,
        dogfood: user.dogfood,
        region: user.region,
        username: user.username,
        delegated: user.tenantId !== user.varTenantId,
        email: user.email
      },
      account: {
        id: user.tenantId,
        name: user.companyName
      }
    })
  } catch (error) {
    /* eslint-disable no-console */
    console.error(error)
  }
}

// type BLang = {
//   langChange: boolean
// }

async function browserLangSet () {
  // const val = await new Promise((resolve, reject) => { resolve(true) })
  const val = await Promise.resolve({
    langChange: true
  })
  // const result: boolean = val
  console.log('inside browserLangSet', val)
  return val?.langChange
}


const browserLangSelection = ( broswerLang: string ): boolean => {
  const BLang = broswerLang.slice(0, 2)
  const browserLangDisplay = new Intl.DisplayNames(['en'], { type: 'language' })
  let intl: IntlShape
  try {
    intl = getIntl()
  } catch (error) {
    if (!(error instanceof IntlSetUpError)) throw error
    setUpIntl({ locale: DEFAULT_SYS_LANG })
    intl = getIntl()
  }
  // const [promise, setPromise] = useState(null)
  const { $t } = intl
  const BLangDisplay = browserLangDisplay.of(BLang)

  showActionModal({
    type: 'confirm',
    customContent: {
      action: 'CUSTOM_BUTTONS',
      buttons: [{
        text: $t({ defaultMessage: 'Cancel' }),
        type: 'default',
        key: 'cancel',
        handler () { }
      }, {
        text: $t({ defaultMessage: 'Change to {BLangDisplay}' }, { BLangDisplay }),
        type: 'primary',
        key: 'ok',
        closeAfterAction: true,
        // handler () { return new Promise((resolve, reject) => { resolve(true) }) }
        handler () {
          browserLangSet().then( value => {
            const result: boolean = value
            console.log('browserLangSet returns value ', result)
            return result
          }) }
      }]
    },
    title: $t({ defaultMessage: 'Change System Language?' }),
    content: $t({ defaultMessage: 'We noticed that your browser is set to {BLangDisplay}'
          + ' Would you like to change the system\'s language to {BLangDisplay}?' },
    { BLangDisplay })
  })
  return false
}

function PreferredLangConfigProvider (props: React.PropsWithChildren) {
  const browserLang = loadMessages(navigator.languages)// browser detection
  const browserLang2 = setBrowserLang() // browser detection
  console.log('browserLang2===>>>>>', browserLang2)

  const result = useGetUserProfileQuery({})
  const { data: userProfile } = result
  const request = useGetPreferencesQuery({ tenantId: getTenantId() })
  const userPreflang = String(userProfile?.preferredLanguage) as LangKey
  const defaultLang = String(request.data?.global?.defaultLanguage) as LangKey

  // console.log(`userProfile: ${userPreflang} ${defaultLang} browserLang: ${browserLang}`)
  const lang = browserLang !== DEFAULT_SYS_LANG ? browserLang :
    userPreflang? userPreflang : defaultLang
  // console.log(`lang: ${lang}`)

  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    states={[{ isLoading: result.isLoading || result.isFetching
    || request.isLoading || request.isFetching }]}
    children={<ConfigProvider {...props} lang={lang} />}
  />
}

function DataGuardLoader (props: React.PropsWithChildren) {
  const locale = useLocaleContext()
  const userProfile = useUserProfileContext()

  return <Loader
    fallback={<SuspenseBoundary.DefaultFallback absoluteCenter />}
    states={[{ isLoading:
      !Boolean(locale.messages) ||
      !Boolean(userProfile.allowedOperations.length)
    }]}
    children={props.children}
  />
}

export async function init (root: Root) {
  // Pendo initialization
  // @ts-ignore
  if ( get('DISABLE_PENDO') === 'false' ) {
    renderPendoAnalyticsTag()
  }

  addMiddleware(errorMiddleware)

  root.render(
    <React.StrictMode>
      <Provider>
        <PreferredLangConfigProvider>
          <BrowserRouter>
            <UserProfileProvider>
              <DataGuardLoader>
                <React.Suspense fallback={null}>
                  <AllRoutes />
                </React.Suspense>
              </DataGuardLoader>
            </UserProfileProvider>
          </BrowserRouter>
        </PreferredLangConfigProvider>
      </Provider>
    </React.StrictMode>
  )
}

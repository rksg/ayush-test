/* eslint-disable max-len */
import { TenantPreferenceSettings } from '@acx-ui/rc/utils'
import { Provider  }                from '@acx-ui/store'
import { render, screen }           from '@acx-ui/test-utils'
import { UseQueryResult }           from '@acx-ui/types'

import  { DefaultSystemLanguageFormItem } from './'

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({
    children,
    showSearch, // remove and left unassigned to prevent warning
    allowClear, // remove and left unassigned to prevent warning
    optionFilterProp, // remove and left unassigned to prevent warning
    ...props
  }: React.PropsWithChildren<{ showSearch: boolean, allowClear:boolean, optionFilterProp: string, onChange?: (value: string) => void }>) => {
    const currPrefLang = 'es'
    let val = 'en'
    const localeLangName = new Intl.DisplayNames([val], { type: 'language' })
    const languageNames = new Intl.DisplayNames([currPrefLang], { type: 'language' })
    const supportedLangs = [
      { label: `${localeLangName.of('en')} (${languageNames.of('en')})`, value: 'en-US' },
      { label: `${languageNames.of('es')}`, value: 'es-ES' },
      { label: `${localeLangName.of('ja')} (${languageNames.of('ja')})`, value: 'ja-JP' },
      { label: `${localeLangName.of('de')} (${languageNames.of('de')})`, value: 'de-DE' }
    ]
    
    return (<select {...props} onChange={(e) => props.onChange?.(e.target.value)}>
      {supportedLangs.map(({ label, value }) =>
        (<Select.Option value={value} key={value} children={label}/>)
      )}
    </select>)
  }
  Select.Option = 'option'
  return { ...components, Select }
})

const mockedUpdatePreference = jest.fn()
jest.mock('@acx-ui/rc/components', () => ({
  ...jest.requireActual('@acx-ui/rc/components'),
  usePreference: () => {
    return {
      data: { global: {
        preferredLanguage: 'en-US'
      } },
      currentPreferredLang: 'en-US',
      update: mockedUpdatePreference,
      getReqState: { isLoading: false, isFetching: false } as UseQueryResult<TenantPreferenceSettings>,
      updateReqState: { isLoading: false } as UseQueryResult<TenantPreferenceSettings>
    }
  }
}))

describe('Default System Language Selector', () => {
  const params: { tenantId: string } = { tenantId: 'ecc2d7cf9d2342fdb31ae0e24958fcac' }

  it('should render correctly', async () => {
    render(
      <Provider>
        <DefaultSystemLanguageFormItem/>
      </Provider>, {
        route: { params }
      })

    await screen.findByText('English (inglés)')
    await screen.findByText('español')
    await screen.findByText('Japanese (japonés)')
    await screen.findByText('German (alemán)')
  })
})

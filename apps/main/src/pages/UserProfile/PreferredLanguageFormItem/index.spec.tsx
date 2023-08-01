import userEvent   from '@testing-library/user-event'
import { useIntl } from 'react-intl'

import { Provider  }             from '@acx-ui/store'
import { render, screen }        from '@acx-ui/test-utils'
import { useUserProfileContext } from '@acx-ui/user'

import { PreferredLanguageFormItem } from './'

jest.mock('react-intl', () => ({
  useIntl: jest.fn()
}))

jest.mock('@acx-ui/user', () => ({
  useUserProfileContext: jest.fn(() => ({ data: { preferredLanguage: 'en-US' } }))
}))

jest.mock('react-intl', () => ({
  useIntl: jest.fn(() => ({ $t: jest.fn() }))
}))
const mockUseIntl = useIntl as jest.Mock
const mockUseUserProfileContext = useUserProfileContext as jest.Mock
const params = { tenantId: 'tenant-id' }

/* eslint-disable max-len */
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, showSearch, allowClear, optionFilterProp, ...props
  }: React.PropsWithChildren<{ showSearch: boolean, allowClear:boolean, optionFilterProp: string, onChange?: (value: string) => void }>) => {
    let userPreferredLang = 'en'
    const localeLangName = new Intl.DisplayNames([userPreferredLang], { type: 'language' })
    const supportedLangs = [
      { label: `${localeLangName.of('en')}`, value: 'en-US' },
      { label: `${localeLangName.of('es')}`, value: 'es-ES' },
      { label: `${localeLangName.of('ja')}`, value: 'ja-JP' },
      { label: `${localeLangName.of('de')}`, value: 'de-DE' }
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

describe('PreferredLanguageFormItem', () => {
  const mockUserProfile = {
    preferredLanguage: 'en-US'
  }
  beforeEach(() => {
    mockUseIntl.mockReturnValue({
      $t: jest.fn()
    })

    mockUseUserProfileContext.mockReturnValue({
      data: mockUserProfile
    })
  })

  it.skip('should render successfully', () => {
    mockUseUserProfileContext.mockReturnValue(mockUserProfile)
    render(
      <Provider>
        <PreferredLanguageFormItem />
      </Provider>, {
        route: { params }
      })
  })

  it.skip('renders the form item with the correct initial value and label', async () => {
    render(<PreferredLanguageFormItem />)
    await screen.findByText('Preferred Language')
    screen.getByRole('name', { name: 'preferredLanguage' })

    expect(await screen.findByRole('select')).toBeVisible()
    // expect(screen.getByRole('option', { name: items.at(-1)?.name })).toBeDisabled()

    // expect(select).toHaveValue('en-US')
  })

  it.skip('renders the language options correctly', async () => {
    render(<PreferredLanguageFormItem />)
    userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'English' })
    )

    const combobox = await screen.findByRole('combobox', { name: 'Preferred Language' })
    await userEvent.click(combobox)
    await userEvent.click(await screen.findByText( 'English' ))

    const options = screen.getAllByRole('combobox')
    expect(options).toHaveLength(6)
    expect(options).toHaveLength(6)
    expect(options[0]).toHaveTextContent('English')
    expect(options[0]).toHaveValue('en-US')
    expect(options[1]).toHaveTextContent('Japanese')
    expect(options[1]).toHaveValue('ja-JP')
    expect(options[2]).toHaveTextContent('French')
    expect(options[2]).toHaveValue('fr-FR')
    expect(options[3]).toHaveTextContent('Portuguese')
    expect(options[3]).toHaveValue('pt-BR')
    expect(options[4]).toHaveTextContent('Korean')
    expect(options[4]).toHaveValue('ko-KR')
    expect(options[5]).toHaveTextContent('Spanish')
    expect(options[5]).toHaveValue('es-ES')
  })


  it.skip('should be changable', async () => {
    render(
      <Provider>
        <PreferredLanguageFormItem />
      </Provider>, {
        route: { params }
      })

    await screen.findByText('English')
    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)
    await userEvent.selectOptions(selector, 'French')
  })
})


import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'

import { Provider }              from '@acx-ui/store'
import { render, screen }        from '@acx-ui/test-utils'
import { useUserProfileContext } from '@acx-ui/user'
import { DEFAULT_SYS_LANG }      from '@acx-ui/utils'

import { PreferredLanguageFormItem } from './index'

jest.mock('@acx-ui/user', () => ({
  ...jest.requireActual('@acx-ui/user'),
  useUserProfileContext: jest.fn(() => ({ data: { preferredLanguage: 'en-US' } }))
}))
const mockUseUserProfileContext = useUserProfileContext as jest.Mock
const params = { tenantId: 'tenant-id' }
const mockUserProfile = {
  preferredLanguage: DEFAULT_SYS_LANG
}
/* eslint-disable max-len */
jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ children, showSearch, allowClear, optionFilterProp, ...props

  }: React.PropsWithChildren<{ showSearch: boolean, allowClear:boolean, optionFilterProp: string, onChange?: (value: string) => void }>) => {

    let userPreferredLang = 'en'
    const localeLangName = new Intl.DisplayNames([userPreferredLang], { type: 'language' })
    const supportedLangs = [
      { label: `${localeLangName.of('en')}`, value: 'en-US' },
      { label: `${localeLangName.of('ja')}`, value: 'ja-JP' },
      { label: `${localeLangName.of('fr')}`, value: 'fr-FR' },
      { label: `${localeLangName.of('pt')}`, value: 'pt-BR' },
      { label: `${localeLangName.of('ko')}`, value: 'ko-KR' },
      { label: `${localeLangName.of('es')}`, value: 'es-ES' }
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
  beforeEach(() => {
    jest.mocked(mockUseUserProfileContext).mockReturnValue({ data: mockUserProfile })
  })
  it('should render successfully', async () => {
    const { baseElement } = render(
      <Provider>
        <Form> <PreferredLanguageFormItem /> </Form>
      </Provider>
    )
    expect(baseElement).toBeTruthy()
    await screen.findByText('Preferred Language')
    await screen.findByText('English')
    await screen.findByText('Japanese')
    await screen.findByText('French')
    await screen.findByText('Portuguese')
    await screen.findByText('Korean')
    await screen.findByText('Spanish')
  })

  it('should be changable', async () => {
    render(
      <Provider>
        <Form> <PreferredLanguageFormItem /> </Form>
      </Provider>, {
        route: { params }
      })

    await screen.findByText('English')
    const selector = await screen.findByRole('combobox')
    await userEvent.click(selector)
    await userEvent.selectOptions(selector, 'French')
  })

  it('renders the form item with the correct initial value and label', async () => {
    render(
      <Provider>
        <Form> <PreferredLanguageFormItem /> </Form>
      </Provider>, {
        route: { params }
      })
    screen.getByRole('combobox', { name: 'Preferred Language' })
    expect(await screen.findByRole('combobox')).toBeVisible()
  })

  it('renders the language options correctly', async () => {
    render(<PreferredLanguageFormItem />)
    userEvent.selectOptions(
      screen.getByRole('combobox'),
      screen.getByRole('option', { name: 'English' })
    )

    const combobox = await screen.findByRole('combobox', { name: 'Preferred Language' })
    await userEvent.click(combobox)
    await userEvent.click(await screen.findByText( 'English' ))
  })
})

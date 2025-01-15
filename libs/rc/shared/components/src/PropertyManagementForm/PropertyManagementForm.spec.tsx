import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  NewPersonaBaseUrl,
  PersonaUrls,
  PropertyUrlsInfo
} from '@acx-ui/rc/utils'
import { Provider } from '@acx-ui/store'
import {
  mockServer,
  render,
  screen,
  renderHook
} from '@acx-ui/test-utils'

import {
  mockPersonaGroupList,
  replacePagination,
  mockEnabledNoPinPropertyConfig,
  mockPropertyUnitList,
  mockResidentPortalProfileList
} from './__tests__/fixtures'
import { PropertyManagementForm } from './PropertyManagementForm'
import { msgCategoryIds }         from './utils'

type MockSelectProps = React.PropsWithChildren<{
  onChange?: (value: string) => void
  options?: Array<{ label: string, value: unknown }>
  loading?: boolean
  showSearch: boolean, allowClear:boolean, filterOption: () => void,
}>

jest.mock('antd', () => {
  const components = jest.requireActual('antd')
  const Select = ({ loading, children,
    onChange, options,
    showSearch, // remove and left unassigned to prevent warning
    allowClear, // remove and left unassigned to prevent warning
    filterOption, // remove and left unassigned to prevent warning
    ...props }: MockSelectProps) => (
    <select {...props} onChange={(e) => onChange?.(e.target.value)} value=''>
      {/* Additional <option> to ensure it is possible to reset value to empty */}
      {children ? <><option value={undefined}></option>{children}</> : null}
      {options?.map((option, index) => (
        <option key={`option-${index}`} value={option.value as string}>{option.label}</option>
      ))}
    </select>
  )
  Select.Option = 'option'
  return { ...components, Select }
})
jest.mock('../users', () => ({
  ...jest.requireActual('../users'),
  PersonaGroupDrawer: () => <div data-testid='PersonaGroupDrawer' />
}))
jest.mock('../TemplateSelector', () => ({
  // eslint-disable-next-line max-len
  TemplateSelector: (props: { categoryId: string }) => <div data-testid={`TemplateSelector-${props.categoryId}`}>
    <span>{'categoryId:' + props.categoryId}</span>
  </div>
}))

describe('Property Config Form', () => {

  beforeEach(async () => {
    mockServer.use(
      rest.get(
        replacePagination(PropertyUrlsInfo.getResidentPortalList.url),
        (_, res, ctx) => res(ctx.json(mockResidentPortalProfileList))
      ),
      rest.get(
        NewPersonaBaseUrl,
        (_, res, ctx) => res(ctx.json(mockPersonaGroupList))
      ),
      rest.post(
        PropertyUrlsInfo.getPropertyUnitList.url,
        (_, res, ctx) => res(ctx.json(mockPropertyUnitList))
      ),
      rest.get(
        PersonaUrls.getPersonaGroupById.url,
        (_, res, ctx) => res(ctx.json(mockPersonaGroupList.content[0]))
      ),
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (_, res, ctx) => res(ctx.json({ content: [] }))
      )
    )
  })

  it('should correctly render form', async () => {
    const { result: { current: [form] } } = renderHook(() => Form.useForm())
    render(<Provider>
      <Form form={form}>
        <PropertyManagementForm
          form={form}
          venueId='mocked-venue-id'
          initialValues={mockEnabledNoPinPropertyConfig}
        />
      </Form>
    </Provider>)

    await screen.findByText('Identity Group')
    await screen.findByText('Enable Guest DPSK for Units')

  })

  it('should render form items for Ruckcus Portal', async () => {
    const { result: { current: [form] } } = renderHook(() => Form.useForm())

    render(<Provider>
      <Form form={form}>
        <PropertyManagementForm
          form={form}
          venueId='mocked-venue-id'
          initialValues={mockEnabledNoPinPropertyConfig}
        />
      </Form>
    </Provider>)

    await screen.findByText('Resident Portal')
    const selector = await screen.findByRole('combobox', { name: 'Resident Portal' })
    // eslint-disable-next-line max-len
    await userEvent.selectOptions(selector, screen.getByText('Use RUCKUS Portal'))
    await screen.findByText('Resident Portal profile')
  })

  it('should render form items for Own Portal', async () => {
    const { result: { current: [form] } } = renderHook(() => Form.useForm())

    render(<Provider>
      <Form form={form}>
        <PropertyManagementForm
          form={form}
          venueId='mocked-venue-id'
          initialValues={mockEnabledNoPinPropertyConfig}
        />
      </Form>
    </Provider>)

    await screen.findByText('Resident Portal')
    const selector = await screen.findByRole('combobox', { name: 'Resident Portal' })
    await userEvent.selectOptions(selector, screen.getByText('Use Your Own Portal'))
    await screen.findByText(/Please refer to the resident portal documentation/)
  })

  describe('msgTemplateEnabled is true', () => {
    beforeEach(async () => {
      jest.mocked(useIsTierAllowed).mockReturnValue(true)
    })

    it('should render form items for Ruckcus Portal', async () => {
      const { result: { current: [form] } } = renderHook(() => Form.useForm())

      render(<Provider>
        <Form form={form}>
          <PropertyManagementForm
            form={form}
            venueId='mocked-venue-id'
            initialValues={mockEnabledNoPinPropertyConfig}
          />
        </Form>
      </Provider>)

      await screen.findByText('Resident Portal')
      await screen.findByText('Communication Templates')
      msgCategoryIds.forEach(msgCategoryId => {
        expect(screen.getByTestId(`TemplateSelector-${msgCategoryId}`)).toBeVisible()
      })
    })
  })
})

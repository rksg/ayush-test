import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { PersonaUrls }                                     from '@acx-ui/rc/utils'
import { Provider }                                        from '@acx-ui/store'
import { mockServer, render, renderHook, screen, waitFor } from '@acx-ui/test-utils'

import { mockPersonaGroupList, mockPersonaList } from './__tests__/fixtures'
import { IdentitySettingForm }                   from './IdentitySettingForm'


describe('IdentitySettingForm', () => {
  const nameValidated = jest.fn()

  const renderIdentitySettingForm = () => {
    render(<Provider>
      <Form>
        <IdentitySettingForm />
      </Form>
    </Provider>)
  }

  beforeEach(() => {
    nameValidated.mockClear()

    mockServer.use(
      rest.post(
        PersonaUrls.searchPersonaGroupList.url.split('?')[0],
        (_, res, ctx) => {
          return res(ctx.json(mockPersonaGroupList))
        }
      ),
      rest.post(
        PersonaUrls.searchPersonaList.url.split('?')[0],
        (_, res, ctx) => {
          nameValidated()
          return res(ctx.json(mockPersonaList))
        }
      )
    )
  })

  it('should show error for empty Identity Name', async () => {
    renderIdentitySettingForm()
    const nameInput = screen.getByLabelText('Identity Name')
    await userEvent.clear(nameInput)
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('Please enter Identity Name')).toBeInTheDocument()
    })
  })

  it('should show error for Identity Name exceeding max length', async () => {
    renderIdentitySettingForm()
    const nameInput = screen.getByLabelText('Identity Name')
    await userEvent.type(nameInput, 'a'.repeat(256))
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('Identity Name must be up to 255 characters')).toBeInTheDocument()
    })
  })

  it('should show error for Identity Name with leading or trailing spaces', async () => {
    renderIdentitySettingForm()
    const nameInput = screen.getByLabelText('Identity Name')
    await userEvent.type(nameInput, '  ')
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('No leading or trailing spaces allowed')).toBeInTheDocument()
    })
  })

  it('should show error for duplicate Identity Name', async () => {
    renderIdentitySettingForm()

    const groupSelector = screen.getByRole('combobox', { name: /identity group/i })
    await userEvent.click(groupSelector)
    await userEvent.click(await screen.findByText(mockPersonaGroupList.content[0].name))

    const nameInput = screen.getByLabelText('Identity Name')
    await userEvent.type(nameInput, mockPersonaList.content[0].name)
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      // eslint-disable-next-line max-len
      expect(screen.getByText('Identity with that name already exists in this identity group')).toBeInTheDocument()
    })
  })

  it('should show error for wrong email format', async () => {
    renderIdentitySettingForm()

    const nameInput = screen.getByLabelText('Identity Name')
    await userEvent.type(nameInput, 'name')
    const emailInput = screen.getByLabelText('Email')
    await userEvent.type(emailInput, 'name@')
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })
  })

  it('should show error for wrong phone number format', async () => {
    renderIdentitySettingForm()

    const nameInput = screen.getByLabelText('Identity Name')
    await userEvent.type(nameInput, 'name')
    const phoneInput = screen.getByLabelText('Phone')
    await userEvent.type(phoneInput, '+123456')
    await userEvent.tab() // Trigger validation

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid phone number')).toBeInTheDocument()
    })
  })

  it('should not block for current Identity name without changes', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    const testedIdentity = mockPersonaList.content[0]

    render(<Provider>
      <Form form={formRef.current}>
        <IdentitySettingForm />
      </Form>
    </Provider>,{
      route: {
        // eslint-disable-next-line max-len
        params: { personaGroupId: mockPersonaGroupList.content[0].id }
      }
    })
    formRef.current.setFieldValue('id', testedIdentity.id)

    const nameInput = screen.getByLabelText('Identity Name')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, testedIdentity.name)
    await userEvent.tab() // Trigger validation

    await waitFor(() => expect(nameValidated).toBeCalledTimes(1))
    await waitFor(() => {
      // eslint-disable-next-line max-len
      expect(screen.queryByText('Identity with that name already exists in this identity group')).not.toBeInTheDocument()
    })
  })
})

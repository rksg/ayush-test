import userEvent from '@testing-library/user-event'
import { Form }  from 'antd'
import { rest }  from 'msw'

import { ResidentPortal }                         from '@acx-ui/rc/utils'
import { Provider }                               from '@acx-ui/store'
import { mockServer, render, renderHook, screen } from '@acx-ui/test-utils'

import { mockedResidentPortal, mockedResidentPortalList } from '../__tests__/fixtures'

import { transferSaveDataToFormFields } from './formParsing'
import ResidentPortalSettingsForm       from './ResidentPortalSettingsForm'

describe('ResidentPortal', () => {
  beforeEach(() => {
    mockServer.use(
      rest.post(
        '/residentPortals/query',
        (req, res, ctx) => res(ctx.json({ ...mockedResidentPortalList }))
      )
    )
  })

  it('should render the form with the given data', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    formRef.current.setFieldsValue(
      transferSaveDataToFormFields(mockedResidentPortal as ResidentPortal))

    render(
      <Provider>
        <Form form={formRef.current}>
          <ResidentPortalSettingsForm
            existingFavicon={{ fileSrc: '', filename: '' }}
            existingLogo={{ fileSrc: '', filename: '' }}/>
        </Form>
      </Provider>
    )


    const nameInput = await screen.findByRole('textbox', { name: /Service Name/ })
    expect(nameInput).toHaveValue(mockedResidentPortal.name)

    const titleInput = await screen.findByRole('textbox', { name: /Portal Title/ })
    expect(titleInput).toHaveValue(mockedResidentPortal.uiConfiguration?.text.title)

    const subtitleInput = await screen.findByRole('textbox', { name: /Subtitle/ })
    expect(subtitleInput).toHaveValue(mockedResidentPortal.uiConfiguration?.text.subTitle)

    const loginInput = await screen.findByRole('textbox', { name: /Login Text/ })
    expect(loginInput).toHaveValue(mockedResidentPortal.uiConfiguration?.text.loginText)

    const announcementsInput = await screen.findByRole('textbox', { name: /Announcements/ })
    expect(announcementsInput).toHaveValue(mockedResidentPortal.uiConfiguration?.text.announcements)

    const helpInput = await screen.findByRole('textbox', { name: /Help Text/ })
    expect(helpInput).toHaveValue(mockedResidentPortal.uiConfiguration?.text.helpText)

    const checkbox = await screen.findByRole('switch',
      { name: /Allow Residents to Set Passphrase/ })
    expect(checkbox).toBeChecked()
  })

  it('should validate the service name', async () => {
    render(
      <Provider>
        <Form>
          <ResidentPortalSettingsForm
            existingFavicon={{ fileSrc: '', filename: '' }}
            existingLogo={{ fileSrc: '', filename: '' }}/>
        </Form>
      </Provider>
    )

    const nameInput = await screen.findByRole('textbox', { name: /Service Name/ })
    await userEvent.type(nameInput, mockedResidentPortalList.content[0].name)
    nameInput.blur()

    const errorMessageElem = await screen.findByRole('alert')
    expect(errorMessageElem.textContent).toBe('Resident Portal with that name already exists ')
  })

})

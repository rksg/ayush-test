import { Form } from 'antd'

import { DpskSaveData, ExpirationType, PassphraseFormatEnum } from '@acx-ui/rc/utils'
import { render, screen }                                     from '@acx-ui/test-utils'

import DpskSettingsForm from './DpskSettingsForm'

describe('DpskSettingsForm', () => {
  it('should render the form with the giving data', async ()=> {
    const mockedData: DpskSaveData = {
      name: 'DPSK 1',
      passphraseLength: 18,
      passphraseFormat: PassphraseFormatEnum.MOST_SECURED,
      expirationType: ExpirationType.DAYS_AFTER_TIME,
      expirationOffset: 1
    }

    render(
      <Form>
        <DpskSettingsForm data={mockedData} />
      </Form>
    )

    const nameInput = await screen.findByRole('textbox', { name: /Service Name/ })
    expect(nameInput).toHaveValue(mockedData.name)

    const expirationModeRadio = await screen.findByRole('radio', { name: /After/ })
    expect(expirationModeRadio).toBeChecked()
  })

  it('should render the form without data', async ()=> {
    render(
      <Form>
        <DpskSettingsForm />
      </Form>
    )

    const nameInput = await screen.findByRole('textbox', { name: /Service Name/ })
    expect(nameInput).toHaveValue('')
  })
})

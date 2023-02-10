import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { StepsForm }                 from '@acx-ui/components'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import {
  selfsignData
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import GoogleSetting from './GoogleSetting'

describe('CaptiveNetworkForm-SelfSignInGoogle', () => {

  it('should test google save successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: true, cloneMode: true, data: selfsignData
      }}
    ><StepsForm><StepsForm.StepForm><GoogleSetting redirectURL={''} /></StepsForm.StepForm>
      </StepsForm></NetworkFormContext.Provider></Provider>)
    fireEvent.click(await screen.findByTitle('settingicon'))
    const googleId = await screen.findByLabelText(/Client ID/)
    fireEvent.change(googleId, { target: { value: 'google' } })
    fireEvent.blur(googleId)
    const googleSecret = await screen.findByLabelText(/Client Secret/)
    fireEvent.change(googleSecret, { target: { value: 'google' } })
    fireEvent.blur(googleSecret)
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })
  it('should test google cancel successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: false, cloneMode: true, data: selfsignData
      }}
    ><StepsForm><StepsForm.StepForm><GoogleSetting redirectURL={''} /></StepsForm.StepForm>
      </StepsForm></NetworkFormContext.Provider></Provider>)
    fireEvent.click(await screen.findByTitle('settingicon'))
    await userEvent.click((await screen.findAllByRole('button', { name: 'Cancel' }))[1])
  })
})

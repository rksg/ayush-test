import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { StepsForm }                 from '@acx-ui/components'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import {
  selfsignData
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import FacebookSetting from './FacebookSetting'

describe('CaptiveNetworkForm-SelfSignInFacebook', () => {

  it('should test facebook save successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: true, cloneMode: true, data: selfsignData
      }}
    ><StepsForm><StepsForm.StepForm><FacebookSetting redirectURL={''} /></StepsForm.StepForm>
      </StepsForm></NetworkFormContext.Provider></Provider>)
    fireEvent.click(await screen.findByTitle('settingicon'))
    const facebookId = await screen.findByLabelText(/App ID/)
    fireEvent.change(facebookId, { target: { value: 'facebook' } })
    fireEvent.blur(facebookId)
    const facebookSecret = await screen.findByLabelText(/App Secret/)
    fireEvent.change(facebookSecret, { target: { value: 'facebook' } })
    fireEvent.blur(facebookSecret)
    await userEvent.click(await screen.findByText('See example'))
    await userEvent.click(await screen.findByRole('button', { name: 'OK' }))
    await userEvent.click(await screen.findByText('Copy to clipboard'))
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })
  it('should test facebook cancel successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: false, cloneMode: true, data: selfsignData
      }}
    ><StepsForm><StepsForm.StepForm><FacebookSetting redirectURL={''} /></StepsForm.StepForm>
      </StepsForm></NetworkFormContext.Provider></Provider>)
    fireEvent.click(await screen.findByTitle('settingicon'))
    await userEvent.click((await screen.findAllByRole('button', { name: 'Cancel' }))[1])
  })
})

import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { StepsForm }                 from '@acx-ui/components'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import {
  selfsignData
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import LinkedInSetting from './LinkedInSetting'

describe('CaptiveNetworkForm-SelfSignInLinkedin', () => {
  it('should test linkedin save successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: true, cloneMode: true, data: selfsignData
      }}
    ><StepsForm><StepsForm.StepForm><LinkedInSetting redirectURL={''} /></StepsForm.StepForm>
      </StepsForm></NetworkFormContext.Provider></Provider>)
    fireEvent.click(await screen.findByTitle('settingicon'))
    const linkedinId = await screen.findByLabelText(/Client ID/)
    fireEvent.change(linkedinId, { target: { value: 'linedin' } })
    fireEvent.blur(linkedinId)
    const linkedinSecret = await screen.findByLabelText(/Client Secret/)
    fireEvent.change(linkedinSecret, { target: { value: 'linkedin' } })
    fireEvent.blur(linkedinSecret)
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })
  it('should test linkedin cancel successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: false, cloneMode: true, data: selfsignData
      }}
    ><StepsForm><StepsForm.StepForm><LinkedInSetting redirectURL={''} /></StepsForm.StepForm>
      </StepsForm></NetworkFormContext.Provider></Provider>)
    fireEvent.click(await screen.findByTitle('settingicon'))
    await userEvent.click((await screen.findAllByRole('button', { name: 'Cancel' }))[1])
  })
})

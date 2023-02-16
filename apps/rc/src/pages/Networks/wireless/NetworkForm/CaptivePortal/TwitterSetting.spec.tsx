import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'

import { StepsForm }                 from '@acx-ui/components'
import { Provider }                  from '@acx-ui/store'
import { render, screen, fireEvent } from '@acx-ui/test-utils'

import {
  selfsignData
} from '../__tests__/fixtures'
import NetworkFormContext from '../NetworkFormContext'

import TwitterSetting from './TwitterSetting'

describe('CaptiveNetworkForm-SelfSignInTwitter', () => {
  it('should test twitter save successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: true, cloneMode: true, data: selfsignData
      }}
    ><StepsForm><StepsForm.StepForm><TwitterSetting redirectURL={''} /></StepsForm.StepForm>
      </StepsForm></NetworkFormContext.Provider></Provider>)
    fireEvent.click(await screen.findByTitle('settingicon'))
    const twitterId = await screen.findByLabelText(/Consumer Key/)
    fireEvent.change(twitterId, { target: { value: 'twitter' } })
    fireEvent.blur(twitterId)
    const twitterSecret = await screen.findByLabelText(/Consumer Secret/)
    fireEvent.change(twitterSecret, { target: { value: 'twitter' } })
    fireEvent.blur(twitterSecret)
    await userEvent.click(await screen.findByRole('button', { name: 'Save' }))
  })
  it('should test twitter cancel successfully', async () => {
    render(<Provider><NetworkFormContext.Provider
      value={{
        editMode: false, cloneMode: true, data: selfsignData
      }}
    ><StepsForm><StepsForm.StepForm><TwitterSetting redirectURL={''} /></StepsForm.StepForm>
      </StepsForm></NetworkFormContext.Provider></Provider>)
    fireEvent.click(await screen.findByTitle('settingicon'))
    await userEvent.click((await screen.findAllByRole('button', { name: 'Cancel' }))[1])
  })
})

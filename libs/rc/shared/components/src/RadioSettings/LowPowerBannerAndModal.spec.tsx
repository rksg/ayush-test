import { Form } from 'antd'

import { Provider }                              from '@acx-ui/store'
import { fireEvent, render, screen, renderHook } from '@acx-ui/test-utils'

import { LowPowerBannerAndModal } from './LowPowerBannerAndModal'
import { ApRadioTypeEnum }        from './RadioSettingsContents'
import { SingleRadioSettings }    from './SingleRadioSettings'

describe('LowPowerBannerAndModal Unit Test', () => {
  it('Test Case for how to fix this button', () => {
    render(<LowPowerBannerAndModal parent='ap' />)
    const howToFixThisButton = screen.getByTestId('how-to-fix-this-button')
    expect(howToFixThisButton).toBeInTheDocument()
    fireEvent.click(howToFixThisButton)
    const instructionModal = screen.getByTestId('instruction-modal')
    expect(instructionModal).toBeInTheDocument()
    const okGotItButton = screen.getByTestId('ok-got-it-button')
    fireEvent.click(okGotItButton)
    expect(screen.queryByTestId('ok-got-it-button')).not.toBeVisible()
  })

  it('Test Case for AP Banner display', async () => {
    render(<LowPowerBannerAndModal parent='ap' />)
    expect(await screen.findByText('Degraded - AP in low power mode')).toBeInTheDocument()
  })

  it('Test Case for Venue Banner display', async () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <SingleRadioSettings
            radioType={ApRadioTypeEnum.Radio6G}
            context='venue'
            bandwidthOptions={[
              { label: 'Auto', value: 'AUTO' },
              { label: '20 MHz', value: '20MHz' },
              { label: '40 MHz', value: '40MHz' },
              { label: '80 MHz', value: '80MHz' },
              { label: '160 MHz', value: '160MHz' }
            ]}
            supportChannels={[]}
            lowPowerAPs={{ lowPowerAPCount: 10, allAPCount: 10 }}
          />
        </Form>
      </Provider>
    )
    /* eslint-disable max-len*/
    expect(await screen.findByText(
      'Access points that support 6 GHz are currently operating in low power mode'
      , { exact: false }
    )).toBeInTheDocument()
  })

  it('Test Case for Venue Banner not display if no ap', () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })
    render(
      <Provider>
        <Form form={formRef.current}>
          <SingleRadioSettings
            radioType={ApRadioTypeEnum.Radio6G}
            context='venue'
            bandwidthOptions={[
              { label: 'Auto', value: 'AUTO' },
              { label: '20 MHz', value: '20MHz' },
              { label: '40 MHz', value: '40MHz' },
              { label: '80 MHz', value: '80MHz' },
              { label: '160 MHz', value: '160MHz' }
            ]}
            supportChannels={[]}
          />
        </Form>
      </Provider>
    )
    expect(screen.queryByTestId('low-power-banner')).not.toBeInTheDocument()
  })

  it('Test Case for Venue Banner not display context is ap', () => {
    render(
      <SingleRadioSettings
        radioType={ApRadioTypeEnum.Radio6G}
        context='ap'
        bandwidthOptions={[]}
        supportChannels={[]}
      />
    )
    expect(screen.queryByTestId('low-power-banner')).not.toBeInTheDocument()
  })

  it('Test Case for Venue Banner not display context 0 ap is low power mode', () => {
    const { result: formRef } = renderHook(() => {
      const [ form ] = Form.useForm()
      return form
    })

    render(
      <Provider>
        <Form form={formRef.current}>
          <SingleRadioSettings
            radioType={ApRadioTypeEnum.Radio6G}
            context='venue'
            bandwidthOptions={[
              { label: 'Auto', value: 'AUTO' },
              { label: '20 MHz', value: '20MHz' },
              { label: '40 MHz', value: '40MHz' },
              { label: '80 MHz', value: '80MHz' },
              { label: '160 MHz', value: '160MHz' }
            ]}
            supportChannels={[]}
            lowPowerAPs={{ lowPowerAPCount: 0, allAPCount: 10 }}
          />
        </Form>
      </Provider>
    )
    expect(screen.queryByTestId('low-power-banner')).not.toBeInTheDocument()
  })
})

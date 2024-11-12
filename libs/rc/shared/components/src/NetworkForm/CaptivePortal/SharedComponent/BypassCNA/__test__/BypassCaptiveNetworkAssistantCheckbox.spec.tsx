
import { StepsFormLegacy }                    from '@acx-ui/components'
import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { GuestNetworkTypeEnum }               from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, screen, cleanup, fireEvent } from '@acx-ui/test-utils'

import NetworkFormContext                        from '../../../../NetworkFormContext'
import { BypassCaptiveNetworkAssistantCheckbox } from '../BypassCaptiveNetworkAssistantCheckbox'

import { MockNetworkSetting } from './fixture'

const MockNetworkType = [
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.ClickThrough },
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.SelfSignIn },
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.HostApproval },
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.GuestPass },
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.WISPr },
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.Cloudpath }
]


describe('BypassCaptiveNetworkAssistantCheckbox Unit Test', () => {

  describe('Test under feature toggle enabled',() => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      cleanup()
    })
    // eslint-disable-next-line max-len
    it('Check that the BypassCaptiveNetworkAssistantCheckbox is rendered correctly if feature toggle enabled', () => {
      MockNetworkType.forEach(() => {
        render(BypassCaptiveNetworkAssistantCheckboxNormalTestCase())
        expect(screen.getByTestId('bypasscna-fullblock')).toBeInTheDocument()
        cleanup()
      })
    })
    it('Check that the BypassCaptiveNetworkAssistantCheckbox is work as expected', () => {
      MockNetworkType.forEach(() => {
        render(BypassCaptiveNetworkAssistantCheckboxNormalTestCase())
        const checkbox = screen.getByTestId('bypasscna-checkbox') as HTMLInputElement
        fireEvent.click(checkbox)
        expect(checkbox.checked).toEqual(true)
        cleanup()
      })
    })
    describe('Check that WalledGardenTextArea render correctly under Edit/Clone mode', () => {
      it('Test case Edit mode match with exist record', () => {
        MockNetworkType.forEach(()=> {
          render(BypassCaptiveNetworkAssistantCheckboxEditModeTestCase())
          const checkbox = screen.getByTestId('bypasscna-checkbox') as HTMLInputElement
          expect(checkbox.checked).toEqual(MockNetworkSetting.wlan?.bypassCNA)
          cleanup()
        })
      })

      it('Test case Clone mode match with exist record', () => {
        MockNetworkType.forEach(() => {
          render(BypassCaptiveNetworkAssistantCheckboxCloneModeTestCase())
          const checkbox = screen.getByTestId('bypasscna-checkbox') as HTMLInputElement
          expect(checkbox.checked).toEqual(MockNetworkSetting.wlan?.bypassCNA)
          cleanup()
        })
      })
    })
  })
})


function BypassCaptiveNetworkAssistantCheckboxNormalTestCase () {
  return (<Provider>
    <NetworkFormContext.Provider
      value={{
        editMode: false,
        cloneMode: false,
        data: {}
      }}
    >
      <StepsFormLegacy>
        <StepsFormLegacy.StepForm>
          <BypassCaptiveNetworkAssistantCheckbox/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </NetworkFormContext.Provider>
  </Provider>)
}

function BypassCaptiveNetworkAssistantCheckboxCloneModeTestCase () {
  return (<Provider>
    <NetworkFormContext.Provider
      value={{
        editMode: false,
        cloneMode: true,
        data: MockNetworkSetting
      }}
    >
      <StepsFormLegacy>
        <StepsFormLegacy.StepForm>
          <BypassCaptiveNetworkAssistantCheckbox/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </NetworkFormContext.Provider>
  </Provider>)
}

function BypassCaptiveNetworkAssistantCheckboxEditModeTestCase () {
  return (<Provider>
    <NetworkFormContext.Provider
      value={{
        editMode: true,
        cloneMode: false,
        data: MockNetworkSetting
      }}
    >
      <StepsFormLegacy>
        <StepsFormLegacy.StepForm>
          <BypassCaptiveNetworkAssistantCheckbox/>
        </StepsFormLegacy.StepForm>
      </StepsFormLegacy>
    </NetworkFormContext.Provider>
  </Provider>)
}

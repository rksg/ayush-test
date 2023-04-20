
import { StepsForm }               from '@acx-ui/components'
import { useIsSplitOn }            from '@acx-ui/feature-toggle'
import { GuestNetworkTypeEnum }    from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import { render, screen, cleanup } from '@acx-ui/test-utils'

import NetworkFormContext                                        from '../../../../NetworkFormContext'
import { BypassCaptiveNetworkAssistantCheckbox, BypassCNAProps } from '../BypassCaptiveNetworkAssistantCheckbox'

import { MockNetworkSetting } from './fixture'

const MockNetworkType = [
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.ClickThrough },
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.SelfSignIn },
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.HostApproval },
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.GuestPass },
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.WISPr },
  { guestNetworkTypeEnum: GuestNetworkTypeEnum.Cloudpath }
]

const exemptionList = [
  GuestNetworkTypeEnum.Cloudpath
]

function isExemption (guestNetworkTypeEnum: GuestNetworkTypeEnum) : boolean {
  return exemptionList.includes(guestNetworkTypeEnum)
}


describe('BypassCaptiveNetworkAssistantCheckbox Unit Test', () => {

  describe('Test under feature toggle enabled',() => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      cleanup()
    })
    // eslint-disable-next-line max-len
    it('Check that the BypassCaptiveNetworkAssistantCheckbox is rendered correctly if feature toggle enabled', () => {
      MockNetworkType.forEach((network) => {
        render(BypassCaptiveNetworkAssistantCheckboxNormalTestCase(network))
        expect(screen.getByTestId('bypasscna-fullblock')).toBeInTheDocument()
        cleanup()
      })
    })
    describe('Check that WalledGardenTextArea render correctly under Edit/Clone mode', () => {
      it('Test case Edit mode match with exist record', () => {
        MockNetworkType.forEach((network)=> {
          render(BypassCaptiveNetworkAssistantCheckboxEditModeTestCase(network!!))
          const checkbox = screen.getByTestId('bypasscna-fullblock') as HTMLInputElement
          expect(checkbox.checked).toEqual(MockNetworkSetting.wlan?.bypassCNA)
          cleanup()
        })
      })

      it('Test case Clone mode match with exist record', () => {
        MockNetworkType.forEach((network) => {
          render(BypassCaptiveNetworkAssistantCheckboxCloneModeTestCase(network!!))
          const checkbox = screen.getByTestId('bypasscna-fullblock') as HTMLInputElement
          expect(checkbox.checked).toEqual(MockNetworkSetting.wlan?.bypassCNA)
          cleanup()
        })
      })
    })
  })

  describe('Test under feature toggle disabled',() => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
      cleanup()
    })
    // eslint-disable-next-line max-len
    it('Check that is BypassCaptiveNetworkAssistantCheckbox rendered correctly if feature toggle disabled', () => {
      MockNetworkType.filter((network) =>
        isExemption(network.guestNetworkTypeEnum)
      ).forEach((network) => {
        render(BypassCaptiveNetworkAssistantCheckboxNormalTestCase(network))
        expect(screen.getByTestId('bypasscna-fullblock')).toBeInTheDocument()
        cleanup()
      })
      MockNetworkType.filter((network) =>
        !isExemption(network.guestNetworkTypeEnum)
      ).forEach((network) => {
        render(BypassCaptiveNetworkAssistantCheckboxNormalTestCase(network))
        expect(screen.queryByTestId('bypasscna-fullblock')).not.toBeInTheDocument()
        cleanup()
      })
    })
  })
})


function BypassCaptiveNetworkAssistantCheckboxNormalTestCase (props: BypassCNAProps) {
  return (<Provider>
    <NetworkFormContext.Provider
      value={{
        editMode: false,
        cloneMode: false,
        data: {}
      }}
    >
      <StepsForm>
        <StepsForm.StepForm>
          <BypassCaptiveNetworkAssistantCheckbox
            guestNetworkTypeEnum={props.guestNetworkTypeEnum} />
        </StepsForm.StepForm>
      </StepsForm>
    </NetworkFormContext.Provider>
  </Provider>)
}

function BypassCaptiveNetworkAssistantCheckboxCloneModeTestCase (props: BypassCNAProps) {
  return (<Provider>
    <NetworkFormContext.Provider
      value={{
        editMode: false,
        cloneMode: true,
        data: MockNetworkSetting
      }}
    >
      <StepsForm>
        <StepsForm.StepForm>
          <BypassCaptiveNetworkAssistantCheckbox
            guestNetworkTypeEnum={props.guestNetworkTypeEnum} />
        </StepsForm.StepForm>
      </StepsForm>
    </NetworkFormContext.Provider>
  </Provider>)
}

function BypassCaptiveNetworkAssistantCheckboxEditModeTestCase (props: BypassCNAProps) {
  return (<Provider>
    <NetworkFormContext.Provider
      value={{
        editMode: true,
        cloneMode: false,
        data: MockNetworkSetting
      }}
    >
      <StepsForm>
        <StepsForm.StepForm>
          <BypassCaptiveNetworkAssistantCheckbox
            guestNetworkTypeEnum={props.guestNetworkTypeEnum} />
        </StepsForm.StepForm>
      </StepsForm>
    </NetworkFormContext.Provider>
  </Provider>)
}
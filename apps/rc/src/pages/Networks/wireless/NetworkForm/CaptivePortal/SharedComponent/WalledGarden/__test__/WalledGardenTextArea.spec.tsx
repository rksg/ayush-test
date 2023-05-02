import '@testing-library/jest-dom'


import { StepsForm }                          from '@acx-ui/components'
import { useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { GuestNetworkTypeEnum }               from '@acx-ui/rc/utils'
import { Provider }                           from '@acx-ui/store'
import { render, screen, cleanup, fireEvent } from '@acx-ui/test-utils'


import NetworkFormContext                          from '../../../../NetworkFormContext'
import { defaultWalledGarden }                     from '../DefaultWalledGarden'
import { WalledGardenTextArea, WalledGardenProps } from '../WalledGardenTextArea'

import { MockNetworkSetting } from './fixture'

const MockNetworkType = [{
  guestNetworkTypeEnum: GuestNetworkTypeEnum.ClickThrough,
  enableDefaultWalledGarden: false
},
{
  guestNetworkTypeEnum: GuestNetworkTypeEnum.SelfSignIn,
  enableDefaultWalledGarden: false
},
{
  guestNetworkTypeEnum: GuestNetworkTypeEnum.HostApproval,
  enableDefaultWalledGarden: false
},
{
  guestNetworkTypeEnum: GuestNetworkTypeEnum.GuestPass,
  enableDefaultWalledGarden: false
},
{
  guestNetworkTypeEnum: GuestNetworkTypeEnum.WISPr,
  enableDefaultWalledGarden: false
},
{
  guestNetworkTypeEnum: GuestNetworkTypeEnum.Cloudpath,
  enableDefaultWalledGarden: true
}]

const exemptionList = [
  GuestNetworkTypeEnum.WISPr,
  GuestNetworkTypeEnum.Cloudpath
]

function isExemption (guestNetworkTypeEnum: GuestNetworkTypeEnum) : boolean {
  return exemptionList.includes(guestNetworkTypeEnum)
}

describe('WalledGardenTextArea Unit Test', () => {
  describe('Test under feature toggle enabled', () => {
    beforeEach(() => {
    // jest.spyOn(React, 'useState').mockImplementation(() => [true, jest.fn()])
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      cleanup()
    })
    // eslint-disable-next-line max-len
    it('Check that the WalledGardenTextArea is rendered correctly if feature toggle enabled', () => {
      MockNetworkType.forEach((network) => {
        render(WalledGardenTextAreaNormalTestCase(network))
        expect(screen.getByTestId('walled-garden-fullblock')).toBeInTheDocument()
        expect(screen.getByTestId('walled-garden-clear-button')).toBeInTheDocument()
        expect(screen.getByTestId('walled-garden-showed-textarea')).toBeInTheDocument()
        expect(screen.getByTestId('walled-garden-hidden-item')).toBeInTheDocument()
        cleanup()
      })
    })
    it('Check that the clear button is work as execpted', () => {
      MockNetworkType.forEach((network) => {
        render(WalledGardenTextAreaNormalTestCase(network))
        const textarea = screen.getByTestId('walled-garden-showed-textarea')
        fireEvent.input(textarea, { target: { value: 'www.google.com' } })
        expect(textarea).toHaveValue('www.google.com')
        const clearButton = screen.getByTestId('walled-garden-clear-button')
        fireEvent.click(clearButton)
        expect(textarea).toHaveValue('')
        cleanup()
      })
    })
    it('Check that the default button is rendered correctly', () => {
      const network = MockNetworkType.find(network => network.enableDefaultWalledGarden === true)
      render(WalledGardenTextAreaNormalTestCase(network!!))
      const defaultBotton = screen.queryByTestId('walled-garden-default-button')
      expect(defaultBotton).toBeInTheDocument()
      cleanup()
    })

    it('Check that the default walled garden list is rendered correctly', () => {
      const network = MockNetworkType.find(network => network.enableDefaultWalledGarden === true)
      render(WalledGardenTextAreaNormalTestCase(network!!))
      const textarea = screen.queryByTestId('walled-garden-showed-textarea')
      expect(textarea).toHaveValue(defaultWalledGarden.join('\n'))
      cleanup()
    })

    it('Check that the default button is work as execpted', () => {
      MockNetworkType.filter((network) =>
        network.enableDefaultWalledGarden === true
      ).forEach((network) => {
        render(WalledGardenTextAreaNormalTestCase(network))
        const textarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        fireEvent.input(textarea, { target: { value: 'www.google.com' } })
        expect(textarea).toHaveValue('www.google.com')
        // eslint-disable-next-line max-len
        const defaultBotton = screen.getByTestId('walled-garden-default-button')
        fireEvent.click(defaultBotton)
        expect(textarea).toHaveValue(defaultWalledGarden.join('\n'))
        // eslint-disable-next-line max-len
        const hiddenarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        expect(textarea.value).toBe(hiddenarea.value)
        cleanup()
      })
    })

    describe('Check that two form is sync during shown form is changed', () =>{
      it('Test case default input', () => {
        const network = MockNetworkType.find(network => network.enableDefaultWalledGarden === true)
        render(WalledGardenTextAreaNormalTestCase(network!!))
        const textarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        // eslint-disable-next-line max-len
        const hiddenarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        expect(textarea.value).toBe(hiddenarea.value)
        cleanup()
      })
      it('Test case normal input', () => {
        const network = MockNetworkType.find(network => network.enableDefaultWalledGarden === false)
        render(WalledGardenTextAreaNormalTestCase(network!!))
        const textarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        // eslint-disable-next-line max-len
        const hiddenarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        expect(textarea.value).toBe(hiddenarea.value)
        fireEvent.input(textarea, { target: { value: 'www.google.com' } })
        expect(textarea.value).toBe(hiddenarea.value)
        cleanup()
      })
      it('Test case copy-paste', () => {
        const network = MockNetworkType.find(network => network.enableDefaultWalledGarden === false)
        render(WalledGardenTextAreaNormalTestCase(network!!))
        const textarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        // eslint-disable-next-line max-len
        const hiddenarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        expect(textarea.value).toBe(hiddenarea.value)
        fireEvent.paste(textarea, { clipboardData: {
          getData: () => defaultWalledGarden
        } })
        expect(textarea.value).toBe(hiddenarea.value)
        cleanup()
      })
    })

    describe('Check that WalledGardenTextArea render correctly under Edit/Clone mode', () => {
      it('Test case Edit mode match with exist record', () => {
        const network = MockNetworkType.find(network => network.enableDefaultWalledGarden === true)
        render(WalledGardenTextAreaEditModeTestCase(network!!))
        const textarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        // eslint-disable-next-line max-len
        expect(textarea.value).toEqual(MockNetworkSetting.guestPortal?.walledGardens?.join('\n'))
        cleanup()
      })

      it('Test case Edit mode match with hidden area', () => {
        const network = MockNetworkType.find(network => network.enableDefaultWalledGarden === true)
        render(WalledGardenTextAreaEditModeTestCase(network!!))
        const textarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        // eslint-disable-next-line max-len
        const hiddenarea = screen.getByTestId('walled-garden-hidden-textarea') as HTMLTextAreaElement
        expect(textarea.value).toBe(hiddenarea.value)
        cleanup()
      })

      it('Test case Clone mode match with exist record', () => {
        const network = MockNetworkType.find(network => network.enableDefaultWalledGarden === true)
        render(WalledGardenTextAreaCloneModeTestCase(network!!))
        // eslint-disable-next-line max-len
        const textarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        expect(textarea.value).toEqual(MockNetworkSetting.guestPortal?.walledGardens?.join('\n'))
        cleanup()
      })
      it('Test case Clone mode match with hidden area', () => {
        const network = MockNetworkType.find(network => network.enableDefaultWalledGarden === true)
        render(WalledGardenTextAreaCloneModeTestCase(network!!))
        // eslint-disable-next-line max-len
        const textarea = screen.getByTestId('walled-garden-showed-textarea') as HTMLTextAreaElement
        // eslint-disable-next-line max-len
        const hiddenarea = screen.getByTestId('walled-garden-hidden-textarea') as HTMLTextAreaElement
        expect(textarea.value).toBe(hiddenarea.value)
        cleanup()
      })
    })
  })
  describe('Test under feature toggle disabled', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(false)
    })
    it('Check that is WalledGardenTextArea rendered correctly if feature toggle disabled', () => {
      MockNetworkType.filter((network) =>
        isExemption(network.guestNetworkTypeEnum)
      ).forEach((network) => {
        render(WalledGardenTextAreaNormalTestCase(network))
        expect(screen.getByTestId('walled-garden-fullblock')).toBeInTheDocument()
        cleanup()
      })
      MockNetworkType.filter((network) =>
        !isExemption(network.guestNetworkTypeEnum)
      ).forEach((network) => {
        render(WalledGardenTextAreaNormalTestCase(network))
        expect(screen.queryByTestId('walled-garden-fullblock')).not.toBeInTheDocument()
        cleanup()
      })
    })
  })
})





function WalledGardenTextAreaNormalTestCase (props: WalledGardenProps) {
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
          <WalledGardenTextArea
            guestNetworkTypeEnum={props.guestNetworkTypeEnum}
            enableDefaultWalledGarden={props.enableDefaultWalledGarden} />
        </StepsForm.StepForm>
      </StepsForm>
    </NetworkFormContext.Provider>
  </Provider>)
}

function WalledGardenTextAreaCloneModeTestCase (props: WalledGardenProps) {
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
          <WalledGardenTextArea
            guestNetworkTypeEnum={props.guestNetworkTypeEnum}
            enableDefaultWalledGarden={props.enableDefaultWalledGarden} />
        </StepsForm.StepForm>
      </StepsForm>
    </NetworkFormContext.Provider>
  </Provider>)
}

function WalledGardenTextAreaEditModeTestCase (props: WalledGardenProps) {
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
          <WalledGardenTextArea
            guestNetworkTypeEnum={props.guestNetworkTypeEnum}
            enableDefaultWalledGarden={props.enableDefaultWalledGarden} />
        </StepsForm.StepForm>
      </StepsForm>
    </NetworkFormContext.Provider>
  </Provider>)
}
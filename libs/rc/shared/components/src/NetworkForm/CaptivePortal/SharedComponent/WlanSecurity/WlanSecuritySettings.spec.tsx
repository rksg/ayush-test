import '@testing-library/jest-dom'

import userEvent from '@testing-library/user-event'

import { StepsFormLegacy }         from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { GuestNetworkTypeEnum }    from '@acx-ui/rc/utils'
import { Provider }                from '@acx-ui/store'
import { render, screen, cleanup } from '@acx-ui/test-utils'

import { MLOContext }     from '../../../NetworkForm'
import NetworkFormContext from '../../../NetworkFormContext'

import { MockNetworkSetting }    from './__test__/fixture'
import { WlanSecurityFormItems } from './WlanSecuritySettings'

describe('WlanSecuritySettings Unit Test', () => {
  describe('Test no feature toggle enabled', () => {
    // eslint-disable-next-line max-len
    it('Check that the WlanSecuritySettings render correctly if no feature toggle enabled', async () => {
      for (const type of Object.values(GuestNetworkTypeEnum)) {
        render(WlanSecuritySettingsNormalTestCase(type))
        await testNoWlanSecuritySettings(type)
      }
    })

    describe('Check that WlanSecuritySettings render correctly under Edit/Clone mode', () => {
      it('Test case Edit mode match with exist record', async () => {
        for (const type of Object.values(GuestNetworkTypeEnum)) {
          render(WlanSecuritySettingsEditModeTestCase(type))
          await testNoWlanSecuritySettings(type)
        }
      })

      it('Test case Clone mode match with exist record', async () => {
        for (const type of Object.values(GuestNetworkTypeEnum)) {
          render(WlanSecuritySettingsCloneModeTestCase(type))
          await testNoWlanSecuritySettings(type)
        }
      })
    })
  })

  describe('Test under PSK feature toggle enabled', () => {
    beforeEach(() => {
      jest
        .mocked(useIsSplitOn)
        .mockImplementation((ff) => ff === Features.WIFI_CAPTIVE_PORTAL_PSK)
      cleanup()
    })
    // eslint-disable-next-line max-len
    it('Check that the WlanSecuritySettings render correctly if feature toggle enabled', async () => {
      for (const type of Object.values(GuestNetworkTypeEnum)) {
        render(WlanSecuritySettingsNormalTestCase(type))
        await testWlanSecuritySettingsOnlyPSK(type)
      }
    })

    describe('Check that WlanSecuritySettings render correctly under Edit/Clone mode', () => {
      it('Test case Edit mode match with exist record', async () => {
        for (const type of Object.values(GuestNetworkTypeEnum)) {
          render(WlanSecuritySettingsEditModeTestCase(type))
          await testWlanSecuritySettingsOnlyPSK(type)
        }
      })

      it('Test case Clone mode match with exist record', async () => {
        for (const type of Object.values(GuestNetworkTypeEnum)) {
          render(WlanSecuritySettingsCloneModeTestCase(type))
          await testWlanSecuritySettingsOnlyPSK(type)
        }
      })
    })
  })

  describe('Test under OWE feature toggle enabled', () => {
    beforeEach(() => {
      jest
        .mocked(useIsSplitOn)
        .mockImplementation((ff) => ff === Features.WIFI_CAPTIVE_PORTAL_OWE)
      cleanup()
    })
    // eslint-disable-next-line max-len
    it('Check that the WlanSecuritySettings render correctly if feature toggle enabled', async () => {
      for (const type of Object.values(GuestNetworkTypeEnum)) {
        render(WlanSecuritySettingsNormalTestCase(type))
        await testWlanSecuritySettingsOnlyOWE(type)
      }
    })

    describe('Check that WlanSecuritySettings render correctly under Edit/Clone mode', () => {
      it('Test case Edit mode match with exist record', async () => {
        for (const type of Object.values(GuestNetworkTypeEnum)) {
          render(WlanSecuritySettingsEditModeTestCase(type))
          await testWlanSecuritySettingsOnlyOWE(type)
        }
      })

      it('Test case Clone mode match with exist record', async () => {
        for (const type of Object.values(GuestNetworkTypeEnum)) {
          render(WlanSecuritySettingsCloneModeTestCase(type))
          await testWlanSecuritySettingsOnlyOWE(type)
        }
      })
    })
  })

  describe('Test under OWE Transition feature toggle enabled', () => {
    beforeEach(() => {
      jest
        .mocked(useIsSplitOn)
        .mockImplementation((ff) => {
          return ff === Features.WIFI_CAPTIVE_PORTAL_OWE
              || ff === Features.WIFI_CAPTIVE_PORTAL_OWE_TRANSITION
        })
      cleanup()
    })
    // eslint-disable-next-line max-len
    it('Check that the WlanSecuritySettings render correctly if feature toggle enabled', async () => {
      for (const type of Object.values(GuestNetworkTypeEnum)) {
        render(WlanSecuritySettingsNormalTestCase(type))
        await testWlanSecuritySettingsOWETransition()
      }
    })

    describe('Check that WlanSecuritySettings render correctly under Edit/Clone mode', () => {
      it('Test case Edit mode match with exist record', async () => {
        for (const type of Object.values(GuestNetworkTypeEnum)) {
          render(WlanSecuritySettingsEditModeTestCase(type))
          await testWlanSecuritySettingsOWETransition()
        }
      })

      it('Test case Clone mode match with exist record', async () => {
        for (const type of Object.values(GuestNetworkTypeEnum)) {
          render(WlanSecuritySettingsCloneModeTestCase(type))
          await testWlanSecuritySettingsOWETransition()
        }
      })
    })
  })

  describe('Test under feature toggle enabled', () => {
    beforeEach(() => {
      jest.mocked(useIsSplitOn).mockReturnValue(true)
      cleanup()
    })
    // eslint-disable-next-line max-len
    it('Check that the WlanSecuritySettings render correctly if feature toggle enabled', async () => {
      for (const type of Object.values(GuestNetworkTypeEnum)) {
        render(WlanSecuritySettingsNormalTestCase(type))
        await testWlanSecuritySettings(type)
      }
    })

    describe('Check that WlanSecuritySettings render correctly under Edit/Clone mode', () => {
      it('Test case Edit mode match with exist record', async () => {
        for (const type of Object.values(GuestNetworkTypeEnum)) {
          render(WlanSecuritySettingsEditModeTestCase(type))
          await testWlanSecuritySettings(type)
        }
      })

      it('Test case Clone mode match with exist record', async () => {
        for (const type of Object.values(GuestNetworkTypeEnum)) {
          render(WlanSecuritySettingsCloneModeTestCase(type))
          await testWlanSecuritySettings(type)
        }
      })
    })
  })
})

async function testWlanSecuritySettings (guestNetworkType: GuestNetworkTypeEnum) {
  return (async () => {
    expect(
      await screen.findByLabelText(/Secure your network/)
    ).toBeInTheDocument()
    const defaultNetworkSecurity = (await screen.findAllByTitle('None'))[0]
    expect(defaultNetworkSecurity).toBeInTheDocument()
    await userEvent.click(defaultNetworkSecurity)
    const pskNetworkSecurity = (
      await screen.findAllByTitle('Pre-Share Key (PSK)')
    )[0]
    expect(pskNetworkSecurity).toBeInTheDocument()
    expect(
      (await screen.findAllByTitle('OWE encryption'))[0]
    ).toBeInTheDocument()
    await userEvent.click(pskNetworkSecurity)
    const wpa2 = (await screen.findAllByTitle('WPA2 (Recommended)'))[0]
    expect(wpa2).toBeInTheDocument()
    await userEvent.click(wpa2)
    const wpa3 = (await screen.findAllByTitle('WPA3'))[0]
    const mixedMode = (await screen.findAllByTitle('WPA2/WPA3 mixed mode'))[0]
    expect(wpa3).toBeInTheDocument()
    expect(mixedMode).toBeInTheDocument()
    const wpa = screen.queryAllByTitle('WPA')
    const wep = screen.queryAllByTitle('WEP (Unsafe)')
    expect(wpa2).toBeInTheDocument()
    expect(wpa3).toBeInTheDocument()
    if (guestNetworkType === GuestNetworkTypeEnum.WISPr) {
      expect(wpa[0]).toBeInTheDocument()
      expect(wep[0]).toBeInTheDocument()
      expect(wep[0]).toHaveClass('ant-select-item-option-disabled')
    } else {
      expect(wpa.length).toBe(0)
      expect(wep.length).toBe(0)
    }
    expect(await screen.findByLabelText(/Passphrase/)).toBeInTheDocument()
    await userEvent.click(wpa3)
    expect(await screen.findByLabelText(/SAE Passphrase/)).toBeInTheDocument()
    await userEvent.click(wpa2)
    await userEvent.click(mixedMode)
    expect(await screen.findByLabelText(/WPA2 Passphrase/)).toBeInTheDocument()
    expect(
      await screen.findByLabelText(/WPA3 SAE Passphrase/)
    ).toBeInTheDocument()
    cleanup()
  })()
}

function testNoWlanSecuritySettings (guestNetworkType: GuestNetworkTypeEnum) {
  return (async () => {
    const secureNetwork = screen.queryByLabelText(/Secure your network/)
    if (guestNetworkType === GuestNetworkTypeEnum.WISPr) {
      expect(secureNetwork).toBeInTheDocument()
      const defaultNetworkSecurity = (await screen.findAllByTitle('None'))[0]
      expect(defaultNetworkSecurity).toBeInTheDocument()
      await userEvent.click(defaultNetworkSecurity)
      const pskNetworkSecurity = (
        await screen.findAllByTitle('Pre-Share Key (PSK)')
      )[0]
      expect(pskNetworkSecurity).toBeInTheDocument()
      expect(
        (await screen.findAllByTitle('OWE encryption'))[0]
      ).toBeInTheDocument()
      await userEvent.click(pskNetworkSecurity)
      const wpa2 = (await screen.findAllByTitle('WPA2 (Recommended)'))[0]
      expect(wpa2).toBeInTheDocument()
      await userEvent.click(wpa2)
      const wpa3 = (await screen.findAllByTitle('WPA3'))[0]
      const mixedMode = (await screen.findAllByTitle('WPA2/WPA3 mixed mode'))[0]
      expect(wpa3).toBeInTheDocument()
      expect(mixedMode).toBeInTheDocument()
      const wpa = (await screen.findAllByTitle('WPA'))[0]
      const wep = (await screen.findAllByTitle('WEP'))[0]
      expect(wpa).toBeInTheDocument()
      expect(wep).toBeInTheDocument()
      expect(wep).not.toHaveClass('ant-select-item-option-disabled')
    } else if (
      guestNetworkType === GuestNetworkTypeEnum.GuestPass ||
      guestNetworkType === GuestNetworkTypeEnum.Directory
    ) {
      expect(secureNetwork).toBeInTheDocument()
      const defaultNetworkSecurity = (await screen.findAllByTitle('None'))[0]
      expect(defaultNetworkSecurity).toBeInTheDocument()
      await userEvent.click(defaultNetworkSecurity)
      const oweNetworkSecurity = (await screen.findAllByTitle('OWE encryption'))[0]
      expect(oweNetworkSecurity).toBeInTheDocument()
    } else {
      expect(secureNetwork).not.toBeInTheDocument()
      expect(screen.queryAllByTitle('Pre-Share Key (PSK)').length).toBe(0)
      expect(screen.queryAllByTitle('OWE encryption').length).toBe(0)
    }
    cleanup()
  })()
}

function testWlanSecuritySettingsOnlyPSK (guestNetworkType: GuestNetworkTypeEnum) {
  return (async () => {
    expect(
      await screen.findByLabelText(/Secure your network/)
    ).toBeInTheDocument()
    const defaultNetworkSecurity = (await screen.findAllByTitle('None'))[0]
    expect(defaultNetworkSecurity).toBeInTheDocument()
    await userEvent.click(defaultNetworkSecurity)
    const pskNetworkSecurity = (
      await screen.findAllByTitle('Pre-Share Key (PSK)')
    )[0]
    const oweNetworkSecurity = screen.queryAllByTitle('OWE encryption')
    expect(pskNetworkSecurity).toBeInTheDocument()
    await userEvent.click(pskNetworkSecurity)
    const wpa2 = (await screen.findAllByTitle('WPA2 (Recommended)'))[0]
    expect(wpa2).toBeInTheDocument()
    await userEvent.click(wpa2)
    const wpa3 = (await screen.findAllByTitle('WPA3'))[0]
    const mixedMode = (await screen.findAllByTitle('WPA2/WPA3 mixed mode'))[0]
    expect(wpa3).toBeInTheDocument()
    expect(mixedMode).toBeInTheDocument()
    const wpa = screen.queryAllByTitle('WPA')
    const wep = screen.queryAllByTitle('WEP')
    expect(wpa2).toBeInTheDocument()
    expect(wpa3).toBeInTheDocument()
    if (guestNetworkType === GuestNetworkTypeEnum.WISPr) {
      expect(oweNetworkSecurity[0]).toBeInTheDocument()
      expect(wpa[0]).toBeInTheDocument()
      expect(wep[0]).toBeInTheDocument()
      expect(wep[0]).not.toHaveClass('ant-select-item-option-disabled')
    } else if (
      guestNetworkType === GuestNetworkTypeEnum.GuestPass ||
      guestNetworkType === GuestNetworkTypeEnum.Directory) {
      expect(oweNetworkSecurity[0]).toBeInTheDocument()
    } else {
      expect(oweNetworkSecurity.length).toBe(0)
      expect(wpa.length).toBe(0)
      expect(wep.length).toBe(0)
    }
    cleanup()
  })()
}

function testWlanSecuritySettingsOnlyOWE (guestNetworkType: GuestNetworkTypeEnum) {
  return (async () => {
    expect(
      await screen.findByLabelText(/Secure your network/)
    ).toBeInTheDocument()
    const defaultNetworkSecurity = (await screen.findAllByTitle('None'))[0]
    expect(defaultNetworkSecurity).toBeInTheDocument()
    await userEvent.click(defaultNetworkSecurity)
    expect(
      (await screen.findAllByTitle('OWE encryption'))[0]
    ).toBeInTheDocument()
    const pskNetworkSecurity = screen.queryAllByTitle('Pre-Share Key (PSK)')
    if (
      guestNetworkType === GuestNetworkTypeEnum.WISPr ||
      guestNetworkType === GuestNetworkTypeEnum.Directory
    ) {
      expect(pskNetworkSecurity[0]).toBeInTheDocument()
    } else {
      expect(pskNetworkSecurity.length).toBe(0)
    }
    cleanup()
  })()
}

function testWlanSecuritySettingsOWETransition () {
  return (async () => {
    expect(
      await screen.findByLabelText(/Secure your network/)
    ).toBeInTheDocument()
    const defaultNetworkSecurity = (await screen.findAllByTitle('None'))[0]
    expect(defaultNetworkSecurity).toBeInTheDocument()
    await userEvent.click(defaultNetworkSecurity)
    expect(
      (await screen.findAllByTitle('OWE encryption'))[0]
    ).toBeInTheDocument()
    const oweNetworkSecurity = (await screen.findAllByTitle('OWE encryption'))[0]
    await userEvent.click(oweNetworkSecurity)

    expect(await screen.findByTestId('owe-transition-switch')).toBeInTheDocument()
    cleanup()
  })()
}

function WlanSecuritySettingsNormalTestCase (guestNetworkType: GuestNetworkTypeEnum) {
  return (
    <Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: false,
          cloneMode: false,
          data: {
            guestPortal: {
              guestNetworkType: guestNetworkType
            }
          }
        }}
      >
        <MLOContext.Provider
          value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}
        >
          <StepsFormLegacy>
            <StepsFormLegacy.StepForm>
              <WlanSecurityFormItems />
            </StepsFormLegacy.StepForm>
          </StepsFormLegacy>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>
  )
}

function WlanSecuritySettingsCloneModeTestCase (guestNetworkType: GuestNetworkTypeEnum) {
  return (
    <Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: false,
          cloneMode: true,
          data: {
            ...MockNetworkSetting,
            guestPortal: {
              ...MockNetworkSetting.guestPortal,
              guestNetworkType: guestNetworkType
            }
          }
        }}
      >
        <MLOContext.Provider
          value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}
        >
          <StepsFormLegacy>
            <StepsFormLegacy.StepForm>
              <WlanSecurityFormItems />
            </StepsFormLegacy.StepForm>
          </StepsFormLegacy>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>
  )
}

function WlanSecuritySettingsEditModeTestCase (guestNetworkType: GuestNetworkTypeEnum) {
  return (
    <Provider>
      <NetworkFormContext.Provider
        value={{
          editMode: true,
          cloneMode: false,
          data: {
            ...MockNetworkSetting,
            guestPortal: {
              ...MockNetworkSetting.guestPortal,
              guestNetworkType: guestNetworkType
            }
          }
        }}
      >
        <MLOContext.Provider
          value={{
            isDisableMLO: false,
            disableMLO: jest.fn()
          }}
        >
          <StepsFormLegacy>
            <StepsFormLegacy.StepForm>
              <WlanSecurityFormItems />
            </StepsFormLegacy.StepForm>
          </StepsFormLegacy>
        </MLOContext.Provider>
      </NetworkFormContext.Provider>
    </Provider>
  )
}

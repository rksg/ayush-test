import { IpsecViewData } from '@acx-ui/rc/utils'

import { getIkeProposalText, getEspProposalText } from './ipsecUtils'

describe('getIkeProposalText', () => {
  it('returns default proposal text for default proposal type', () => {
    const profile: IpsecViewData = { ikeProposalType: 'DEFAULT' }
    expect(getIkeProposalText(profile)).toBe('AES128-SHA1-MODP2048')
  })

  it('returns formatted proposal text for specific proposal type with valid first proposal', () => {
    const profile: IpsecViewData = {
      ikeProposalType: 'SPECIFIC',
      ikeProposals: [
        {
          encAlg: 'AES256',
          authAlg: 'SHA256',
          dhGroup: 'MODP4096'
        }
      ]
    }
    expect(getIkeProposalText(profile)).toBe('AES256-SHA256-MODP4096')
  })

  it('returns default proposal text for specific proposal type with no proposals', () => {
    const profile: IpsecViewData = { ikeProposalType: 'SPECIFIC', ikeProposals: [] }
    expect(getIkeProposalText(profile)).toBe('AES128-SHA1-MODP2048')
  })

  it('returns default proposal text for specific proposal type with null proposals', () => {
    const profile: IpsecViewData = { ikeProposalType: 'SPECIFIC', ikeProposals: null }
    expect(getIkeProposalText(profile)).toBe('AES128-SHA1-MODP2048')
  })

  it('returns default proposal text for specific proposal type with undefined proposals', () => {
    const profile: IpsecViewData = { ikeProposalType: 'SPECIFIC' }
    expect(getIkeProposalText(profile)).toBe('AES128-SHA1-MODP2048')
  })
})

describe('getEspProposalText', () => {
  it('returns default proposal text for default proposal type', () => {
    const profile: IpsecViewData = { espProposalType: 'DEFAULT' }
    expect(getEspProposalText(profile)).toBe('AES128-SHA1-MODP2048')
  })

  it('returns formatted proposal text for specific proposal type with valid first proposal', () => {
    const profile: IpsecViewData = {
      espProposalType: 'SPECIFIC',
      espProposals: [
        {
          encAlg: 'AES256',
          authAlg: 'SHA256',
          dhGroup: 'MODP4096'
        }
      ]
    }
    expect(getEspProposalText(profile)).toBe('AES256-SHA256-MODP4096')
  })

  it('returns default proposal text for specific proposal type with no proposals', () => {
    const profile: IpsecViewData = { espProposalType: 'SPECIFIC', espProposals: [] }
    expect(getEspProposalText(profile)).toBe('AES128-SHA1-MODP2048')
  })

  it('returns default proposal text for specific proposal type with null proposals', () => {
    const profile: IpsecViewData = { espProposalType: 'SPECIFIC', espProposals: null }
    expect(getEspProposalText(profile)).toBe('AES128-SHA1-MODP2048')
  })

  it('returns default proposal text for specific proposal type with undefined proposals', () => {
    const profile: IpsecViewData = { espProposalType: 'SPECIFIC' }
    expect(getEspProposalText(profile)).toBe('AES128-SHA1-MODP2048')
  })
})
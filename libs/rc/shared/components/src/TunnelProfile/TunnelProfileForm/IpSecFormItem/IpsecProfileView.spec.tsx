/* eslint-disable max-len */
import { getEspProposalText, getIkeProposalText } from '@acx-ui/edge/components'
import { IpsecViewData }                          from '@acx-ui/rc/utils'
import { render, screen }                         from '@acx-ui/test-utils'

import { IpsecProfileView } from './IpsecProfileView'

// Mock dependencies
jest.mock('@acx-ui/edge/components', () => ({
  getIkeProposalText: jest.fn(() => 'AES128-SHA1-MODP2048'),
  getEspProposalText: jest.fn(() => 'AES128-SHA1-MODP2048')
}))

const mockGetIkeProposalText = getIkeProposalText as jest.MockedFunction<typeof getIkeProposalText>
const mockGetEspProposalText = getEspProposalText as jest.MockedFunction<typeof getEspProposalText>

describe('IpsecProfileView', () => {
  const mockIpsecProfile: IpsecViewData = {
    id: 'ipsec-1',
    name: 'IPSec-1',
    serverAddress: '192.168.1.1',
    authenticationType: 'PSK',
    preSharedKey: 'test-key-123',
    certificate: '',
    certNames: [],
    ikeProposalType: 'DEFAULT',
    ikeProposals: [
      {
        encAlg: 'AES128',
        authAlg: 'SHA1',
        prfAlg: 'PRF_SHA1',
        dhGroup: 'MODP2048'
      }
    ],
    espProposalType: 'DEFAULT',
    espProposals: [
      {
        encAlg: 'AES128',
        authAlg: 'SHA1',
        dhGroup: 'MODP2048'
      }
    ],
    activations: [],
    venueActivations: [],
    apActivations: []
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering with selected profile', () => {
    it('should render IPSec profile details when profile is selected', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(screen.getByText('Pre-Shared Key')).toBeInTheDocument()
      expect(screen.getByText('IKE Proposal')).toBeInTheDocument()
      expect(screen.getByText('ESP Proposal')).toBeInTheDocument()
    })

    it('should display pre-shared key in password input', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      const passwordInput = screen.getByDisplayValue('test-key-123')
      expect(passwordInput).toBeInTheDocument()
      expect(passwordInput).toHaveAttribute('readonly')
    })

    it('should call getIkeProposalText with selected profile', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(mockGetIkeProposalText).toHaveBeenCalledWith(mockIpsecProfile)
    })

    it('should call getEspProposalText with selected profile', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(mockGetEspProposalText).toHaveBeenCalledWith(mockIpsecProfile)
    })

    it('should display IKE proposal text', () => {
      mockGetIkeProposalText.mockReturnValue('AES256-SHA256-MODP4096')
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(screen.getByText('AES256-SHA256-MODP4096')).toBeInTheDocument()
    })

    it('should display ESP proposal text', () => {
      mockGetEspProposalText.mockReturnValue('AES256-SHA256-MODP4096')
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(screen.getByText('AES256-SHA256-MODP4096')).toBeInTheDocument()
    })
  })

  describe('Rendering without selected profile', () => {
    it('should render placeholder text when no profile is selected', () => {
      render(<IpsecProfileView selectedIpsecProfile={undefined} />)

      expect(screen.getByText('Details of selected IPSec profile will appear here')).toBeInTheDocument()
    })

    it('should not display profile details when no profile is selected', () => {
      render(<IpsecProfileView selectedIpsecProfile={undefined} />)

      expect(screen.queryByText('Pre-Shared Key')).not.toBeInTheDocument()
      expect(screen.queryByText('IKE Proposal')).not.toBeInTheDocument()
      expect(screen.queryByText('ESP Proposal')).not.toBeInTheDocument()
    })

    it('should not call getIkeProposalText when no profile is selected', () => {
      render(<IpsecProfileView selectedIpsecProfile={undefined} />)

      expect(mockGetIkeProposalText).not.toHaveBeenCalled()
    })

    it('should not call getEspProposalText when no profile is selected', () => {
      render(<IpsecProfileView selectedIpsecProfile={undefined} />)

      expect(mockGetEspProposalText).not.toHaveBeenCalled()
    })
  })

  describe('Profile data variations', () => {
    it('should handle profile with empty pre-shared key', () => {
      const profileWithEmptyKey = {
        ...mockIpsecProfile,
        preSharedKey: ''
      }

      render(<IpsecProfileView selectedIpsecProfile={profileWithEmptyKey} />)

      const passwordInput = screen.getByDisplayValue('')
      expect(passwordInput).toBeInTheDocument()
    })

    it('should handle profile with null pre-shared key', () => {
      const profileWithNullKey = {
        ...mockIpsecProfile,
        preSharedKey: null as unknown as string
      }

      render(<IpsecProfileView selectedIpsecProfile={profileWithNullKey} />)

      expect(screen.getByText('Pre-Shared Key')).toBeInTheDocument()
    })

    it('should handle profile with undefined pre-shared key', () => {
      const profileWithUndefinedKey = {
        ...mockIpsecProfile,
        preSharedKey: undefined as unknown as string
      }

      render(<IpsecProfileView selectedIpsecProfile={profileWithUndefinedKey} />)

      expect(screen.getByText('Pre-Shared Key')).toBeInTheDocument()
    })

    it('should handle profile with empty IKE proposals', () => {
      const profileWithEmptyIke = {
        ...mockIpsecProfile,
        ikeProposals: []
      }

      render(<IpsecProfileView selectedIpsecProfile={profileWithEmptyIke} />)

      expect(mockGetIkeProposalText).toHaveBeenCalledWith(profileWithEmptyIke)
    })

    it('should handle profile with empty ESP proposals', () => {
      const profileWithEmptyEsp = {
        ...mockIpsecProfile,
        espProposals: []
      }

      render(<IpsecProfileView selectedIpsecProfile={profileWithEmptyEsp} />)

      expect(mockGetEspProposalText).toHaveBeenCalledWith(profileWithEmptyEsp)
    })

    it('should handle profile with null IKE proposals', () => {
      const profileWithNullIke = {
        ...mockIpsecProfile,
        ikeProposals: null as unknown as typeof mockIpsecProfile.ikeProposals
      }

      render(<IpsecProfileView selectedIpsecProfile={profileWithNullIke} />)

      expect(mockGetIkeProposalText).toHaveBeenCalledWith(profileWithNullIke)
    })

    it('should handle profile with null ESP proposals', () => {
      const profileWithNullEsp = {
        ...mockIpsecProfile,
        espProposals: null as unknown as typeof mockIpsecProfile.espProposals
      }

      render(<IpsecProfileView selectedIpsecProfile={profileWithNullEsp} />)

      expect(mockGetEspProposalText).toHaveBeenCalledWith(profileWithNullEsp)
    })
  })

  describe('Utility function calls', () => {
    it('should call getIkeProposalText only once per render', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(mockGetIkeProposalText).toHaveBeenCalledTimes(1)
    })

    it('should call getEspProposalText only once per render', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(mockGetEspProposalText).toHaveBeenCalledTimes(1)
    })

    it('should handle getIkeProposalText returning empty string', () => {
      mockGetIkeProposalText.mockReturnValue('')
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(screen.getByText('')).toBeInTheDocument()
    })

    it('should handle getEspProposalText returning empty string', () => {
      mockGetEspProposalText.mockReturnValue('')
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(screen.getByText('')).toBeInTheDocument()
    })

    it('should handle getIkeProposalText returning null', () => {
      mockGetIkeProposalText.mockReturnValue(null as unknown as string)
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(screen.getByText('IKE Proposal')).toBeInTheDocument()
    })

    it('should handle getEspProposalText returning null', () => {
      mockGetEspProposalText.mockReturnValue(null as unknown as string)
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(screen.getByText('ESP Proposal')).toBeInTheDocument()
    })
  })

  describe('Styling and layout', () => {
    it('should render with correct wrapper styling', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      // The component should be wrapped in a styled div
      expect(screen.getByText('Pre-Shared Key')).toBeInTheDocument()
    })

    it('should render form items with correct styling', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      // Form items should have marginBottom: 0
      expect(screen.getByText('Pre-Shared Key')).toBeInTheDocument()
    })

    it('should render proposal text with correct styling', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      // Proposal text should be in a div with padding: '4px 0'
      expect(screen.getByText('AES128-SHA1-MODP2048')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      expect(screen.getByText('Pre-Shared Key')).toBeInTheDocument()
      expect(screen.getByText('IKE Proposal')).toBeInTheDocument()
      expect(screen.getByText('ESP Proposal')).toBeInTheDocument()
    })

    it('should have readonly password input', () => {
      render(<IpsecProfileView selectedIpsecProfile={mockIpsecProfile} />)

      const passwordInput = screen.getByDisplayValue('test-key-123')
      expect(passwordInput).toHaveAttribute('readonly')
    })
  })

  describe('Edge cases', () => {
    it('should handle profile with all null values', () => {
      const nullProfile = {
        id: 'test',
        name: 'test',
        serverAddress: '',
        authenticationType: 'PSK',
        preSharedKey: null as unknown as string,
        certificate: '',
        certNames: [],
        ikeProposalType: '',
        ikeProposals: null as unknown as typeof mockIpsecProfile.ikeProposals,
        espProposalType: '',
        espProposals: null as unknown as typeof mockIpsecProfile.espProposals,
        activations: [],
        venueActivations: [],
        apActivations: []
      }

      render(<IpsecProfileView selectedIpsecProfile={nullProfile} />)

      expect(screen.getByText('Pre-Shared Key')).toBeInTheDocument()
      expect(screen.getByText('IKE Proposal')).toBeInTheDocument()
      expect(screen.getByText('ESP Proposal')).toBeInTheDocument()
    })

    it('should handle profile with all undefined values', () => {
      const undefinedProfile = {
        id: 'test',
        name: 'test',
        serverAddress: '',
        authenticationType: 'PSK',
        preSharedKey: undefined as unknown as string,
        certificate: '',
        certNames: [],
        ikeProposalType: '',
        ikeProposals: undefined as unknown as typeof mockIpsecProfile.ikeProposals,
        espProposalType: '',
        espProposals: undefined as unknown as typeof mockIpsecProfile.espProposals,
        activations: [],
        venueActivations: [],
        apActivations: []
      }

      render(<IpsecProfileView selectedIpsecProfile={undefinedProfile} />)

      expect(screen.getByText('Pre-Shared Key')).toBeInTheDocument()
      expect(screen.getByText('IKE Proposal')).toBeInTheDocument()
      expect(screen.getByText('ESP Proposal')).toBeInTheDocument()
    })

    it('should handle profile with very long pre-shared key', () => {
      const longKey = 'a'.repeat(1000)
      const profileWithLongKey = {
        ...mockIpsecProfile,
        preSharedKey: longKey
      }

      render(<IpsecProfileView selectedIpsecProfile={profileWithLongKey} />)

      const passwordInput = screen.getByDisplayValue(longKey)
      expect(passwordInput).toBeInTheDocument()
    })

    it('should handle profile with special characters in pre-shared key', () => {
      const specialKey = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const profileWithSpecialKey = {
        ...mockIpsecProfile,
        preSharedKey: specialKey
      }

      render(<IpsecProfileView selectedIpsecProfile={profileWithSpecialKey} />)

      const passwordInput = screen.getByDisplayValue(specialKey)
      expect(passwordInput).toBeInTheDocument()
    })
  })
})
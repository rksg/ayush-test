import userEvent     from '@testing-library/user-event'
import { cloneDeep } from 'lodash'

import { Features }                                                                                                                                                                                                                 from '@acx-ui/feature-toggle'
import { PolicyOperation, PolicyType, getPolicyRoutePath, useIsEdgeFeatureReady, IpSecDhGroupEnum, IpSecEncryptionAlgorithmEnum, IpSecIntegrityAlgorithmEnum, IpSecPseudoRandomFunctionEnum, IpsecViewData, IpSecProposalTypeEnum } from '@acx-ui/rc/utils'
import { Provider }                                                                                                                                                                                                                 from '@acx-ui/store'
import { render, screen }                                                                                                                                                                                                           from '@acx-ui/test-utils'

import { mockIpSecTable, mockIpSecDetailFromListQueryWithVxlan } from '../__tests__/fixtures'

import IpsecDetailContent from './IpsecDetailContent'


let params: { tenantId: string, policyId: string }
params = {
  tenantId: 'tenantId',
  policyId: 'test-policyId'
}

const detailPath = '/:tenantId/t' + getPolicyRoutePath({
  type: PolicyType.IPSEC,
  oper: PolicyOperation.DETAIL
})

jest.mock('@acx-ui/rc/utils', () => ({
  ...jest.requireActual('@acx-ui/rc/utils'),
  useIsEdgeFeatureReady: jest.fn().mockReturnValue(false)
}))

describe('IpSec Detail Content Component', () => {
  it('should render IpsecDetailContent component successfully', async () => {
    render(
      <Provider>
        <IpsecDetailContent data={mockIpSecTable.data[1]} />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    await screen.findAllByText('Pre-shared Key')
    await screen.findByText('Default')
    const custom = await screen.findByText('Custom')
    await userEvent.hover(custom)
    await screen.findByText('3DES-MD5-PRF_MD5-MODP768')
  })

  it('should handle empty serverAddress', async () => {
    const mockEmptyIpSecDetail = cloneDeep(mockIpSecTable.data[1]) as IpsecViewData
    mockEmptyIpSecDetail.serverAddress = ''

    render(
      <Provider>
        <IpsecDetailContent data={mockEmptyIpSecDetail} />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    await screen.findAllByText('Pre-shared Key')
    expect(await screen.findAllByText('--')).toHaveLength(1)
  })

  it('should handle ESP proposal', async () => {
    const mockData = cloneDeep(mockIpSecTable.data[0]) as IpsecViewData
    mockData.espProposalType = IpSecProposalTypeEnum.SPECIFIC
    mockData.espProposals = [{
      encAlg: IpSecEncryptionAlgorithmEnum.AES128,
      authAlg: IpSecIntegrityAlgorithmEnum.SHA1,
      dhGroup: IpSecDhGroupEnum.MODP2048
    }]

    render(
      <Provider>
        <IpsecDetailContent data={mockData} />
      </Provider>,
      { route: { params, path: detailPath } }
    )

    const custom = await screen.findByText('Custom')
    await screen.findByText('Default')
    await userEvent.hover(custom)
    await screen.findByText('AES128-SHA1-MODP2048')
  })

  it('should handle null detail', async () => {
    const { container } = render(
      <Provider>
        <IpsecDetailContent data={null as unknown as IpsecViewData} />
      </Provider>,
      { route: { params, path: detailPath } }
    )
    expect(screen.queryByText('Pre-shared Key')).toBeNull()
    expect(container).toBeEmptyDOMElement()
  })

  describe('supported VxLAN IPSec', () => {
    const mockVxlanIpSecDetail = mockIpSecDetailFromListQueryWithVxlan.data.data[0]
    const mockSoftgreIpSecDetail = mockIpSecDetailFromListQueryWithVxlan.data.data[1]

    beforeEach(() => {
      jest.mocked(useIsEdgeFeatureReady)
        .mockImplementation(ff => ff === Features.EDGE_IPSEC_VXLAN_TOGGLE)
    })
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should render vxlan ipsec supported correctly', async () => {
      render(
        <Provider>
          <IpsecDetailContent data={mockVxlanIpSecDetail as IpsecViewData} />
        </Provider>,
        { route: { params, path: detailPath } }
      )

      expect(await screen.findByText('Tunnel Usage Type')).toBeInTheDocument()
      expect(screen.getByText('RUCKUS Devices (VxLAN)')).toBeInTheDocument()
      expect(screen.queryByText('3rd Party Devices (SoftGRE)')).toBeNull()
      expect(screen.queryByText('Security Gateway')).toBeNull()
    })

    it('should render empty with the unsupported proposal', async () => {
      const mockInvalidVxlanIpSecDetail = cloneDeep(mockVxlanIpSecDetail) as IpsecViewData
      mockInvalidVxlanIpSecDetail.ikeProposals = [ {
        encAlg: IpSecEncryptionAlgorithmEnum.AES192,
        authAlg: IpSecIntegrityAlgorithmEnum.SHA1,
        prfAlg: IpSecPseudoRandomFunctionEnum.USE_INTEGRITY_ALG,
        dhGroup: IpSecDhGroupEnum.MODP2048
      }]

      render(
        <Provider>
          <IpsecDetailContent data={mockInvalidVxlanIpSecDetail} />
        </Provider>,
        { route: { params, path: detailPath } }
      )

      expect(await screen.findByText('Tunnel Usage Type')).toBeInTheDocument()
      expect(await screen.findByText('RUCKUS Devices (VxLAN)')).toBeInTheDocument()
      expect(screen.queryByText('3rd Party Devices (SoftGRE)')).toBeNull()
      expect(screen.getByText('AES192-SHA1-MODP2048')).toBeVisible()
    })

    it('should render correct with softgre type', async () => {
      render(
        <Provider>
          <IpsecDetailContent data={mockSoftgreIpSecDetail as IpsecViewData} />
        </Provider>,
        { route: { params, path: detailPath } }
      )

      expect(await screen.findByText('Tunnel Usage Type')).toBeInTheDocument()
      expect(await screen.findByText('3rd Party Devices (SoftGRE)')).toBeInTheDocument()
      expect(screen.queryByText('RUCKUS Devices (VxLAN)')).toBeNull()
      expect(screen.getByText('Security Gateway')).toBeVisible()
    })

    it('should handle empty tunnel usage type', async () => {
      const mockEmptyIpSecDetail = cloneDeep(mockVxlanIpSecDetail) as IpsecViewData
      mockEmptyIpSecDetail.tunnelUsageType = undefined

      render(
        <Provider>
          <IpsecDetailContent data={mockEmptyIpSecDetail} />
        </Provider>,
        { route: { params, path: detailPath } }
      )
      await screen.findAllByText('Pre-shared Key')
      expect(await screen.findAllByText('--')).toHaveLength(1)
    })
  })
})
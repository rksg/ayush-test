import { IpsecViewData } from '@acx-ui/rc/utils'
import { getIntl }       from '@acx-ui/utils'

export const getIpSecIkeAlgorithmOptions = () => {
  const { $t } = getIntl()

  return [{
    value: 'AES128-SHA1-MODP2048',
    label: $t({ defaultMessage: 'AE128-SHA1-MODP2048' })
  }, {
    value: 'AES256-SHA384-ECP384',
    label: $t({ defaultMessage: 'AES256-SHA384-ECP384' })
  }]
}

export const getIpSecEspAlgorithmOptions = () => {
  const { $t } = getIntl()

  return [{
    value: 'AES128-SHA1-MODP2048',
    label: $t({ defaultMessage: 'AE128-SHA1-MODP2048' })
  }, {
    value: 'AES256-SHA384-ECP384',
    label: $t({ defaultMessage: 'AES256-SHA384-ECP384' })
  }]
}

export const getIkeProposalText = (profile: IpsecViewData) => {
  if (profile.ikeProposalType === 'DEFAULT') {
    return 'AES128-SHA1-MODP2048' // Default proposal
  }
  // For specific proposals, you would format the first proposal
  const firstProposal = profile.ikeProposals?.[0]
  if (firstProposal) {
    return `${firstProposal.encAlg}-${firstProposal.authAlg}-${firstProposal.dhGroup}`
  }
  return 'AES128-SHA1-MODP2048'
}

export const getEspProposalText = (profile: IpsecViewData) => {
  if (profile.espProposalType === 'DEFAULT') {
    return 'AES128-SHA1-MODP2048' // Default proposal
  }
  // For specific proposals, you would format the first proposal
  const firstProposal = profile.espProposals?.[0]
  if (firstProposal) {
    return `${firstProposal.encAlg}-${firstProposal.authAlg}-${firstProposal.dhGroup}`
  }
  return 'AES128-SHA1-MODP2048'
}
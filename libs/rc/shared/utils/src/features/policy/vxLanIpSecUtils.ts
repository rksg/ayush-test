import { IpSecProposalTypeEnum, IpSecPseudoRandomFunctionEnum } from '../../models'
import { Ipsec }                                                from '../../types'

export const toIpSecIkeProposalData = (value: string) => {
  const ikeProposals = value.split('-')
  if (ikeProposals.length !== 3) {
    return
  }

  const ikeEncryptionAlgorithm = ikeProposals[0]
  const ikeIntegrityAlgorithm = ikeProposals[1]
  const ikeDhGroup = ikeProposals[2]

  return {
    ikeProposalType: IpSecProposalTypeEnum.SPECIFIC,
    ikeProposals: [{
      encAlg: ikeEncryptionAlgorithm,
      authAlg: ikeIntegrityAlgorithm,
      prfAlg: IpSecPseudoRandomFunctionEnum.USE_INTEGRITY_ALG,
      dhGroup: ikeDhGroup
    }]
  }
}

export const toIpSecEspProposalData = (value: string) => {
  const espProposals = value.split('-')
  if (espProposals.length !== 3) {
    return
  }

  const espEncryptionAlgorithm = espProposals[0]
  const espIntegrityAlgorithm = espProposals[1]
  const espDhGroup = espProposals[2]

  return {
    espProposalType: IpSecProposalTypeEnum.SPECIFIC,
    espProposals: [{
      encAlg: espEncryptionAlgorithm,
      authAlg: espIntegrityAlgorithm,
      dhGroup: espDhGroup
    }]
  }
}

export const toIpSecEspAlgorithmOptionValue = (data: Ipsec) => {
  const espData = data.espSecurityAssociation
  const espProposal = espData?.espProposals?.[0]
  const proposalTxt = `${espProposal?.encAlg}-${espProposal?.authAlg}-${espProposal?.dhGroup}`

  if (espData?.espProposalType === IpSecProposalTypeEnum.SPECIFIC
    && espData?.espProposals?.length === 1
    && ['AES128-SHA1-MODP2048', 'AES256-SHA384-ECP384'].includes(proposalTxt)
  ) {
    return proposalTxt
  }

  return undefined
}

export const toIpSecIkeAlgorithmOptionValue = (data: Ipsec) => {
  const ikeData = data.ikeSecurityAssociation
  const ikeProposal = ikeData?.ikeProposals?.[0]
  const proposalTxt = `${ikeProposal?.encAlg}-${ikeProposal?.authAlg}-${ikeProposal?.dhGroup}`

  if (ikeData?.ikeProposalType === IpSecProposalTypeEnum.SPECIFIC
    && (ikeData?.ikeProposals?.length ?? 0)=== 1
    && ['AES128-SHA1-MODP2048', 'AES256-SHA384-ECP384'].includes(proposalTxt)
  ) {
    return proposalTxt
  }

  return undefined
}
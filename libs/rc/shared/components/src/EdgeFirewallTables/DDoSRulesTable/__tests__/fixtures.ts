import { DdosAttackType } from '@acx-ui/rc/utils'

export const mockDDoSRules = [
  {
    ddosAttackType: DdosAttackType.ICMP,
    rateLimiting: 12
  },
  {
    ddosAttackType: DdosAttackType.TCP_SYN,
    rateLimiting: 200
  }
]


export const mockDDoSRulesWithStatistic = [
  {
    ddosAttackType: DdosAttackType.ICMP,
    rateLimiting: 12,
    deniedPackets: 6,
    passedPackets: 100
  },
  {
    ddosAttackType: DdosAttackType.TCP_SYN,
    rateLimiting: 200,
    deniedPackets: 0,
    passedPackets: 120
  }
]
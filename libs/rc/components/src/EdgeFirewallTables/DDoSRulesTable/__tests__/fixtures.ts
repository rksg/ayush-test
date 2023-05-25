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
    deniedPacket: 6,
    passPacket: 100
  },
  {
    ddosAttackType: DdosAttackType.TCP_SYN,
    rateLimiting: 200,
    deniedPacket: 0,
    passPacket: 120
  }
]
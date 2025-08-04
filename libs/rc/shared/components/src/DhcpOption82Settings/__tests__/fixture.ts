import {
  DhcpOption82SubOption151Enum,
  DhcpOption82SubOption2Enum,
  DhcpOption82SubOption1Enum,
  DhcpOption82MacEnum
} from '@acx-ui/rc/utils'

export const mockDHCP82OptionSetting = {
  softGreEnabled: true,
  softGreSettings: {
    dhcpOption82Enabled: true,
    dhcpOption82Settings: {
      subOption1Enabled: true,
      subOption1Format: 'SUBOPT1_ESSID',
      subOption2Enabled: false,
      subOption150Enabled: true,
      subOption151Enabled: false,
      macDelimiter: 'NODELIMITER'
    }
  },
  enabled: true
}

export const mockSourceDataEnabled = {
  dhcpOption82Enabled: true,
  dhcpOption82Settings: {
    subOption151Text: 'test-area',
    subOption151Format: DhcpOption82SubOption151Enum.SUBOPT151_AREA_NAME,
    subOption2Format: DhcpOption82SubOption2Enum.SUBOPT2_CLIENT_MAC,
    subOption1Format: DhcpOption82SubOption1Enum.SUBOPT1_ESSID,
    macDelimiter: DhcpOption82MacEnum.NONE,
    subOption1Enabled: true,
    subOption2Enabled: false,
    subOption150Enabled: true,
    subOption151Enabled: false,
    subOption1Customization: {
      attributes: []
    }
  }
}

export const mockSourceDataDisabled = {
  dhcpOption82Enabled: false
}

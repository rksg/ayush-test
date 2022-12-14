/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

export const apRebootReasonMap = {
  '/usr/sbin/cia  application, cia, reboot due to firmware change': defineMessage({
    defaultMessage: 'Reboot due to firmware change'
  }),
  'unknown reason': defineMessage({
    defaultMessage: 'Unknown reason'
  }),
  'system fault': defineMessage({
    defaultMessage: 'System fault'
  }),
  '/usr/sbin/meshd -S  AP cannot find uplink and is in island state': defineMessage({
    defaultMessage: 'AP cannot find uplink and is in island state'
  }),
  'rsmd_func cia monitor  AP lost Gateway more than 1800 seconds': defineMessage({
    defaultMessage: 'AP lost connection to gateway for more than 1800 seconds'
  }),
  'rsmd_func cia monitor  AP lost SCG more than 7200 seconds': defineMessage({
    defaultMessage: 'AP lost connection to controller for more than 7200 seconds'
  }),
  '/usr/sbin/cia  application, cia, reboot due to ipmode change': defineMessage({
    defaultMessage: 'Reboot due to IP mode change'
  }),
  '/usr/sbin/cia  application, cia, reboot due to mesh mode change': defineMessage({
    defaultMessage: 'Reboot due to mesh mode change'
  }),
  '/usr/sbin/cia  application, cia, reboot due to WLAN migration': defineMessage({
    defaultMessage: 'Reboot due to WLAN migration'
  }),
  '/usr/sbin/cia  application, cia, reboot due to WLAN migration;application, cia, Reboot due to firmware change': defineMessage({
    defaultMessage: 'Reboot due to WLAN migration or firmware change'
  }),
  '/usr/sbin/cia  application, cia, reboot due to enable mesh': defineMessage({
    defaultMessage: 'Reboot due to mesh enablement'
  }),
  'system recovery by watchdog': defineMessage({
    defaultMessage: 'system recovery by WatchDog'
  }),
  '/usr/sbin/cia  application, cia, reboot due to enable mesh;application, cia, reboot due to ipmode change': defineMessage({
    defaultMessage: 'Reboot due to IP mode change or mesh enablement'
  }),
  '/usr/sbin/cia  application, cia, reboot due to country code change': defineMessage({
    defaultMessage: 'Reboot due to country code change'
  }),
  '/usr/sbin/cia  application, cia, reboot due to firmware download can\'t be completed': defineMessage({
    defaultMessage: 'Reboot due to firmware download failure'
  }),
  '/usr/sbin/cia  application, cia, reboot due to enable mesh;application, cia, reboot due to country code change': defineMessage({
    defaultMessage: 'Reboot due to mesh enablement or country code change'
  }),
  'application, cia, reboot due to WLAN migration;application, cia, reboot due to firmware change;': defineMessage({
    defaultMessage: 'Reboot due to WLAN migration or firmware change'
  }),
  'application, wsgclient, reboot due to firmware change': defineMessage({
    defaultMessage: 'Reboot due to firmware change'
  }),
  'rsmd_func cia monitor  AP lost SCG more than 14400 seconds': defineMessage({
    defaultMessage: 'AP lost connection to controller for more than 14400 seconds'
  }),
  'system recovery for target failure': defineMessage({
    defaultMessage: 'System recovery for target failure'
  }),
  '/usr/sbin/cia  application, cia, reboot due to WLAN migration;application, cia, reboot due to firmware download can\'t be completed': defineMessage({
    defaultMessage: 'Reboot due to WLAN migration or firmware download failure'
  }),
  '/usr/sbin/cia  application, cia, reboot due to mesh mode change;application, cia, reboot due to country code change': defineMessage({
    defaultMessage: 'Reboot due to mesh mode change or country code change'
  }),
  '/usr/sbin/zuffa -d 0x0 -s 0xfffb  System will reboot after setting gain value to take effect the changes. uptime in sec 102': defineMessage({
    defaultMessage: 'System reboot'
  }),
  '/usr/sbin/zuffa -d 0x0 -s 0xfffb  System will reboot after setting gain value to take effect the changes. uptime in sec 64716': defineMessage({
    defaultMessage: 'System reboot'
  }),
  'Unknown': defineMessage({
    defaultMessage: 'Unknown'
  }),
  'application, cia, reboot due to firmware change;': defineMessage({
    defaultMessage: 'Reboot due to firmware change'
  }),
  'system recovery for target problem': defineMessage({
    defaultMessage: 'System recovery for target problem'
  })
} as const

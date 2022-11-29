import {
  Apple,
  GenericOs,
  Microsoft
} from '@acx-ui/icons'

export const getDeviceTypeIcon = (deviceType: string) => {
  let icon = ''
  const type = deviceType ? deviceType.toLowerCase() : ''
  const iconPrefix = 'client-icon'

  switch (type) {
    case 'laptop':
    case 'smartphone':
    case 'tablet':
    case 'voip':
    case 'gaming':
    case 'printer':
    case 'iot':
    case 'wds':
      icon = `${iconPrefix}-${type}`
      break
    case 'iot device':
      icon = `${iconPrefix}-iot`
      break
    case 'home av equipment':
      icon = `${iconPrefix}-home-entertainment`
      break
    case 'wds device':
      icon = `${iconPrefix}-wds`
      break
    default:
      icon = `${iconPrefix}-generic-device`
  }
  return icon
}

export const getOsTypeIcon = (osType: string) => {
  let icon = '';
  // for backward compatible
  type Type = keyof typeof osIconMap
  const type = convertClientOsType(osType);
  const iconPrefix = 'client-icon';
  const defaultIcon = <GenericOs />
  const osIconMap = {
    apple: <Apple />,
    // avaya:
    // android:
    // blackberry:
    // bose:
    // brother:
    // canon:
    // chrome:
    // cisco:
    // dell:
    // epson:
    // panasonic:
    // nortel:
    // nintendo:
    // nest:
    // linux:
    // linksys:
    // libratone:
    // kindle:
    // hp:
    // playstation:
    // roku:
    // samsung:
    // sonos:
    // sony:
    // ubuntu:
    // wemo:
    windows: <Microsoft />
    // xbox:
    // xerox:
  }
  return osIconMap[type as Type] || defaultIcon
  switch (type) {
    case 'apple':
    case 'avaya':
    case 'android':
    case 'blackberry':
    case 'bose':
    case 'brother':
    case 'canon':
    case 'chrome':
    case 'cisco':
    case 'dell':
    case 'epson':
    case 'panasonic':
    case 'nortel':
    case 'nintendo':
    case 'nest':
    case 'linux':
    case 'linksys':
    case 'libratone':
    case 'kindle':
    case 'hp':
    case 'playstation':
    case 'roku':
    case 'samsung':
    case 'sonos':
    case 'sony':
    case 'ubuntu':
    case 'wemo':
    case 'windows':
    case 'xbox':
    case 'xerox':
      icon = `${iconPrefix}-${type}`;
      break;
    case 'wifi smart plug':
      icon = `${iconPrefix}-wifi-smart-plug`;
      break;
    default:
      icon = `${iconPrefix}-clients`;
  }
  return icon;
}

export const getClientHealthClass = (healthStatus: string) =>  {
  switch (healthStatus) {
    case 'Good':
      return 'good';
    case 'Average':
      return 'average';
    case 'Poor':
      return 'poor';
    default:
      return 'default'
  }
}

const convertClientOsType = (origOsType: string) => {
  const osType = origOsType ? origOsType.toLowerCase() : '';

  // for backward compatible
  if (osType.includes('ios') || osType.includes('mac') || osType.includes('apple')) {
    return 'apple';
  } else if (osType.includes('android')) {
    return 'android';
  } else if (osType.includes('windows')) {
    return 'windows';
  } else if (osType.includes('linux')) {
    return 'linux';
  } else if (osType.includes('kindle')) {
    return 'kindle';
  } else if (osType.includes('chrome')) {
    return 'chrome';
  } else if (osType.includes('blackberry')) {
    return 'blackberry';
  }

  return osType;
}


export const VLAN_PREFIX = {
  VLAN: 'VLAN-',
  POOL: 'VLAN Pool: '
}

export enum NetworkTypeEnum {
  PSK = 'psk',
  OPEN = 'open',
  AAA = 'aaa',
  CAPTIVEPORTAL = 'guest',
  DPSK = 'dpsk'
}

export enum GuestNetworkTypeEnum {
  ClickThrough = 'ClickThrough',
  SelfSignIn = 'SelfSignIn',
  HostApproval = 'HostApproval',
  GuestPass = 'GuestPass',
  WISPr = 'WISPr',
  Cloudpath = 'Cloudpath'
}

export enum WlanSecurityEnum {
  Open = 'Open',
  WPAPersonal = 'WPAPersonal',
  WPA2Personal = 'WPA2Personal',
  WPAEnterprise = 'WPAEnterprise',
  WPA2Enterprise = 'WPA2Enterprise',
  OpenCaptivePortal = 'OpenCaptivePortal',
  WEP = 'WEP',
  WPA23Mixed = 'WPA23Mixed',
  WPA3 = 'WPA3'
}

export enum PassphraseFormatEnum {
  MOST_SECURED = 'MOST_SECURED',
  KEYBOARD_FRIENDLY = 'KEYBOARD_FRIENDLY',
  NUMBERS_ONLY = 'NUMBERS_ONLY',
}

export enum PassphraseExpirationEnum {
  UNLIMITED = 'UNLIMITED',
  ONE_DAY = 'ONE_DAY',
  TWO_DAYS = 'TWO_DAYS',
  ONE_WEEK = 'ONE_WEEK',
  TWO_WEEKS = 'TWO_WEEKS',
  ONE_MONTH = 'ONE_MONTH',
  SIX_MONTHS = 'SIX_MONTHS',
  ONE_YEAR = 'ONE_YEAR',
  TWO_YEARS = 'TWO_YEARS'
}

export enum ApDeviceStatusEnum {
  NEVER_CONTACTED_CLOUD = '1_01_NeverContactedCloud',
  INITIALIZING = '1_07_Initializing',
  OFFLINE = '1_09_Offline',
  OPERATIONAL = '2_00_Operational',
  APPLYING_FIRMWARE = '2_01_ApplyingFirmware',
  APPLYING_CONFIGURATION = '2_02_ApplyingConfiguration',
  FIRMWARE_UPDATE_FAILED = '3_02_FirmwareUpdateFailed',
  CONFIGURATION_UPDATE_FAILED = '3_03_ConfigurationUpdateFailed',
  DISCONNECTED_FROM_CLOUD = '3_04_DisconnectedFromCloud',
  REBOOTING = '4_01_Rebooting',
  HEARTBEAT_LOST = '4_04_HeartbeatLost'
}

export enum APMeshRole {
  RAP = 'RAP',
  MAP = 'MAP',
  EMAP = 'EMAP',
  DISABLED = 'DISABLED'
}

export enum DeviceConnectionStatus {
  INITIAL = 'initial',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  ALERTING = 'alerting'
}

export enum ApRadioBands {
  band24 = '2.4G',
  band50 = '5G',
  band60 = '6G'
}
export const Constants = {
  triRadioUserSettingsKey: 'COMMON$supportTriRadio'
}

export enum AaaServerTypeEnum {
  AUTHENTICATION = 'authRadius',
  ACCOUNTING = 'accountingRadius',
}

export enum AaaServerOrderEnum {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

export enum CloudpathDeploymentTypeEnum {
  OnPremise = 'OnPremise',
  Cloud = 'Cloud',
}

export enum ServiceType {
  PORTAL = 'PORTAL',
  DHCP = 'DHCP',
  WIFI_CALLING = 'Wi-Fi Calling',
  MDNS_PROXY = 'MDNS_PROXY',
  DPSK = 'DPSK'
}
export enum ServiceTechnology {
  WIFI = 'WI-FI',
  SWITCH = 'SWITCH'
}
export enum ServiceStatus {
  UP = 'UP',
  DOWN = 'DOWN'
}
export enum ServiceAdminState {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export enum DHCPConfigTypeEnum {
  SIMPLE = 'EnableOnEachAPs',
  MULTIPLE = 'EnableOnMultipleAPs',
  HIERARCHICAL = 'EnableOnHierarchicalAPs'
}

export enum RadiusErrorsType {
  AUTH_AND_ACC = 'AUTH_AND_ACC',
  AUTH = 'AUTH',
  ACCOUNTING = 'ACCOUNTING'
}

export enum ApLanPortTypeEnum {
  ACCESS = 'ACCESS',
  GENERAL = 'GENERAL',
  TRUNK = 'TRUNK'
}

export enum ProfileTypeEnum {
  REGULAR = 'Regular',
  CLI = 'CLI'
}

export enum IgmpSnoopingEnum {
  ACTIVE = 'active',
  PASSIVE = 'passive',
  NONE = 'none'
}

export enum SpanningTreeProtocolEnum {
  RSTP = 'rstp',
  STP = 'stp',
  NONE = 'none'
}

export enum SpanningTreeProtocolName {
  rstp = 'RSTP',
  stp = 'STP',
  none = 'None'
}

export enum AclRuleProtocolEnum {
  IP = 'ip',
  TCP = 'tcp',
  UDP = 'udp'
}

export enum AclTypeEnum {
  STANDARD = 'standard',
  EXTENDED = 'extended'
}

export enum AclRuleActionEnum {
  PERMIT = 'permit',
  DENY = 'deny'
}

export enum TrustedPortTypeEnum {
  ALL = 'all',
  DHCP = 'dhcp',
  ARP = 'arp'
}
export enum WanConnectionEnum {
  ETH_WITH_CELLULAR_FAILOVER = 'ETH_WITH_CELLULAR_FAILOVER',
  CELLULAR_WITH_ETH_FAILOVER = 'CELLULAR_WITH_ETH_FAILOVER',
  ETH = 'ETH',
  CELLULAR = 'CELLULAR',
}

export enum LteBandRegionEnum {
  DOMAIN_1 = 'DOMAIN_1',
  DOMAIN_2 = 'DOMAIN_2',
  USA_CANADA = 'USA_CANADA',
  JAPAN = 'JAPAN',
}

export enum CellularNetworkSelectionEnum {
  AUTO = 'AUTO',
  LTE = 'LTE',
  ThreeG = 'ThreeG',
}

export const CountryIsoDisctionary = {
  'Afghanistan': 'af',
  'Albania': 'al',
  'Algeria': 'dz',
  'American Samoa': 'as',
  'Andorra': 'ad',
  'Angola': 'ao',
  'Anguilla': 'ai',
  'Antigua and Barbuda': 'ag',
  'Argentina': 'ar',
  'Armenia': 'am',
  'Aruba': 'aw',
  'Australia': 'au',
  'Austria': 'at',
  'Azerbaijan': 'az',
  'Bahamas': 'bs',
  'Bahrain': 'bh',
  'Bangladesh': 'bd',
  'Barbados': 'bb',
  'Belarus': 'by',
  'Belgium': 'be',
  'Belize': 'bz',
  'Benin': 'bj',
  'Bermuda': 'bm',
  'Bhutan': 'bt',
  'Bolivia': 'bo',
  'Bosnia and Herzegovina': 'ba',
  'Botswana': 'bw',
  'Brazil': 'br',
  'BritishIndianOceanTerritory': 'io',
  'BritishVirginIslands': 'vg',
  'Brunei': 'bn',
  'Bulgaria': 'bg',
  'BurkinaFaso': 'bf',
  'Burundi': 'bi',
  'Cambodia': 'kh',
  'Cameroon': 'cm',
  'Canada': 'ca',
  'CapeVerde': 'cv',
  'CaribbeanNetherlands': 'bq',
  'Cayman Islands': 'ky',
  'CentralAfricanRepublic': 'cf',
  'Chad': 'td',
  'Chile': 'cl',
  'China': 'cn',
  'Christmas Island': 'cx',
  'Cocos': 'cc',
  'Colombia': 'co',
  'Comoros': 'km',
  'Democratic Republic of the Congo': 'cd',
  'Republic of the Congo': 'cg',
  'Cook Islands': 'ck',
  'Costa Rica': 'cr',
  'Côte d\'Ivoire': 'ci',
  'Croatia': 'hr',
  'Cuba': 'cu',
  'Curaçao': 'cw',
  'Cyprus': 'cy',
  'Czech Republic': 'cz',
  'Denmark': 'dk',
  'Djibouti': 'dj',
  'Dominica': 'dm',
  'Dominican Republic': 'do',
  'Ecuador': 'ec',
  'Egypt': 'eg',
  'ElSalvador': 'sv',
  'Equatorial Guinea': 'gq',
  'Eritrea': 'er',
  'Estonia': 'ee',
  'Ethiopia': 'et',
  'Falkland Islands': 'fk',
  'Faroe Islands': 'fo',
  'Fiji': 'fj',
  'Finland': 'fi',
  'France': 'fr',
  'French Guiana': 'gf',
  'French Polynesia': 'pf',
  'Gabon': 'ga',
  'Gambia': 'gm',
  'Georgia': 'ge',
  'Germany': 'de',
  'Ghana': 'gh',
  'Gibraltar': 'gi',
  'Greece': 'gr',
  'Greenland': 'gl',
  'Grenada': 'gd',
  'Guadeloupe': 'gp',
  'Guam': 'gu',
  'Guatemala': 'gt',
  'Guernsey': 'gg',
  'Guinea': 'gn',
  'Guinea-Bissau': 'gw',
  'Guyana': 'gy',
  'Haiti': 'ht',
  'Honduras': 'hn',
  'Hong Kong': 'hk',
  'Hungary': 'hu',
  'Iceland': 'is',
  'India': 'in',
  'Indonesia': 'id',
  'Iran': 'ir',
  'Iraq': 'iq',
  'Ireland': 'ie',
  'Isle of Man': 'im',
  'Israel': 'il',
  'Italy': 'it',
  'Jamaica': 'jm',
  'Japan': 'jp',
  'Jersey': 'je',
  'Jordan': 'jo',
  'Kazakhstan': 'kz',
  'Kenya': 'ke',
  'Kiribati': 'ki',
  'Kosovo': 'xk',
  'Kuwait': 'kw',
  'Kyrgyzstan': 'kg',
  'Laos': 'la',
  'Latvia': 'lv',
  'Lebanon': 'lb',
  'Lesotho': 'ls',
  'Liberia': 'lr',
  'Libya': 'ly',
  'Liechtenstein': 'li',
  'Lithuania': 'lt',
  'Luxembourg': 'lu',
  'Macau': 'mo',
  'Macedonia': 'mk',
  'Madagascar': 'mg',
  'Malawi': 'mw',
  'Malaysia': 'my',
  'Maldives': 'mv',
  'Mali': 'ml',
  'Malta': 'mt',
  'Marshall Islands': 'mh',
  'Martinique': 'mq',
  'Mauritania': 'mr',
  'Mauritius': 'mu',
  'Mayotte': 'yt',
  'Mexico': 'mx',
  'Micronesia': 'fm',
  'Moldova': 'md',
  'Monaco': 'mc',
  'Mongolia': 'mn',
  'Montenegro': 'me',
  'Montserrat': 'ms',
  'Morocco': 'ma',
  'Mozambique': 'mz',
  'Myanmar': 'mm',
  'Namibia': 'na',
  'Nauru': 'nr',
  'Nepal': 'np',
  'Netherlands': 'nl',
  'NewCaledonia': 'nc',
  'NewZealand': 'nz',
  'Nicaragua': 'ni',
  'Niger': 'ne',
  'Nigeria': 'ng',
  'Niue': 'nu',
  'Norfolk Island': 'nf',
  'North Korea': 'kp',
  'Northern Mariana Islands': 'mp',
  'Norway': 'no',
  'Oman': 'om',
  'Pakistan': 'pk',
  'Palau': 'pw',
  'Palestine': 'ps',
  'Panama': 'pa',
  'Papua New Guinea': 'pg',
  'Paraguay': 'py',
  'Peru': 'pe',
  'Philippines': 'ph',
  'Poland': 'pl',
  'Portugal': 'pt',
  'PuertoRico': 'pr',
  'Qatar': 'qa',
  'Réunion': 're',
  'Romania': 'ro',
  'Russia': 'ru',
  'Rwanda': 'rw',
  'Saint Barthélemy': 'bl',
  'Saint Helena': 'sh',
  'Saint Kitts and Nevis': 'kn',
  'Saint Lucia': 'lc',
  'Saint Martin': 'mf',
  'Saint Pierre and Miquelon': 'pm',
  'SaintVincent and the Grenadines': 'vc',
  'Samoa': 'ws',
  'San Marino': 'sm',
  'São Tomé and Príncipe': 'st',
  'Saudi Arabia': 'sa',
  'Senegal': 'sn',
  'Serbia': 'rs',
  'Seychelles': 'sc',
  'SierraLeone': 'sl',
  'Singapore': 'sg',
  'Sint Maarten': 'sx',
  'Slovakia': 'sk',
  'Slovenia': 'si',
  'Solomon Islands': 'sb',
  'Somalia': 'so',
  'SouthAfrica': 'za',
  'South Korea': 'kr',
  'South Sudan': 'ss',
  'Spain': 'es',
  'SriLanka': 'lk',
  'Sudan': 'sd',
  'Suriname': 'sr',
  'Svalbard and Jan Mayen': 'sj',
  'Swaziland': 'sz',
  'Sweden': 'se',
  'Switzerland': 'ch',
  'Syria': 'sy',
  'Taiwan': 'tw',
  'Tajikistan': 'tj',
  'Tanzania': 'tz',
  'Thailand': 'th',
  'Timor-Leste': 'tl',
  'Togo': 'tg',
  'Tokelau': 'tk',
  'Tonga': 'to',
  'Trinidad and Tobago': 'tt',
  'Tunisia': 'tn',
  'Turkey': 'tr',
  'Turkmenistan': 'tm',
  'Turks and Caicos Islands': 'tc',
  'Tuvalu': 'tv',
  'U.S. Virgin Islands': 'vi',
  'Uganda': 'ug',
  'Ukraine': 'ua',
  'United Arab Emirates': 'ae',
  'United Kingdom': 'gb',
  'United States': 'us',
  'Uruguay': 'uy',
  'Uzbekistan': 'uz',
  'Vanuatu': 'vu',
  'VaticanCity': 'va',
  'Venezuela': 've',
  'Vietnam': 'vn',
  'Wallis and Futuna': 'wf',
  'Western Sahara': 'eh',
  'Yemen': 'ye',
  'Zambia': 'zm',
  'Zimbabwe': 'zw',
  'Åland Islands': 'ax'
}

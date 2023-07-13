import { defineMessage } from 'react-intl'

import { SwitchModelInfoMap } from './types'

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
  WPA3 = 'WPA3',
  None = 'None'
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

export enum QosPriorityEnum {
  WIFICALLING_PRI_VOICE = 'WIFICALLING_PRI_VOICE',
  WIFICALLING_PRI_VIDEO = 'WIFICALLING_PRI_VIDEO',
  WIFICALLING_PRI_BE = 'WIFICALLING_PRI_BE',
  WIFICALLING_PRI_BG = 'WIFICALLING_PRI_BG'
}

export enum ServiceType {
  PORTAL = 'Portal',
  DHCP = 'DHCP (Wi-Fi)',
  EDGE_DHCP = 'DHCP (Edge)',
  EDGE_FIREWALL = 'Firewall (Edge)',
  WIFI_CALLING = 'Wi-Fi Calling',
  MDNS_PROXY = 'mDNS Proxy',
  DPSK = 'DPSK',
  NETWORK_SEGMENTATION = 'Network Segmentation',
  WEBAUTH_SWITCH = 'Web Auth',
  RESIDENT_PORTAL = 'Resident Portal'
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

export enum ConfigTypeEnum {
  AAA_SERVER = 'AAA_SERVER',
  AAA_SETTING = 'AAA_SETTING',
  DNS_SERVER = 'DNS_SERVER',
  DHCP_SERVER = 'DHCP_SERVER',
  LAG_SETTINGS = 'LAG_SETTINGS',
  MODEL ='MODEL',
  OVERWRITE = 'OVERWRITE',
  PORT_CONFIGURATION = 'PORT_CONFIGURATION',
  PROVISIONING = 'PROVISIONING',
  STACK = 'STACK',
  SYSLOG_SERVER = 'SYSLOG_SERVER',
  VE_PORTS = 'VE_PORTS',
  CLI_PROVISIONING = 'CLI_PROVISIONING',
  CLI_UPDATE = 'CLI_UPDATE',
  IP_CONFIG = 'IP_CONFIG',
  SPECIFIC_SETTING = 'SPECIFIC_SETTING',
  STATIC_ROUTE = 'STATIC_ROUTE',
  TRIGGER_SYNC = 'TRIGGER_SYNC',
  DEFAULT_VLAN = 'DEFAULT_VLAN',
  ADMIN_PASSWORD = 'ADMIN_PASSWORD'
}

export enum ConfigStatusEnum {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  NO_CONFIG_CHANGE = 'NO_CONFIG_CHANGE',
  NOTIFY_SUCCESS = 'NOTIFY_SUCCESS',
  FAILED_NO_RESPONSE = 'FAILED_NO_RESPONSE',
  PENDING ='PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SWITCH_NOT_FOUND = 'SWITCH_NOT_FOUND'
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
export enum CaptivePassphraseExpirationEnum {
  ONE_HOUR = '1',
  FOUR_HOURS = '4',
  ONE_DAY = '24',
  ONE_WEEK = '168',
  ONE_MONTH = '730'
}
export enum PortalViewEnum{
  ClickThrough = 'ClickThrough',
  GuestPassConnect = 'GuestPassConnect',
  GuestPassForgot = 'GuestPassForgot',
  SelfSignIn = 'SelfSignIn',
  SelfSignInRegister = 'SelfSignInRegister',
  HostApproval = 'HostApproval',
  ConnectionConfirmed = 'ConnectionConfirmed',
  TermCondition = 'TermCondition'
}
export enum PortalLanguageEnum{
  zh_TW = 'zh-hant',
  cs = 'ces',
  en = 'en',
  fi = 'fin',
  fr = 'fr',
  de = 'de',
  el = 'gre',
  hu = 'hun',
  it = 'it',
  ja = 'ja',
  no = 'nor',
  pl = 'pol',
  pt_PT = 'pt',
  pt_BR = 'pt-BR',
  ro = 'ro',
  sk = 'sk',
  es = 'es',
  sv = 'swe',
  tr = 'tr'
}

export enum PortalComponentsEnum{
  Logo = 'logo',
  Welcome = 'welcome',
  Photo = 'photo',
  SecondaryText = 'secondaryText',
  TermsConditions = 'termsConditions',
  PoweredBy = 'poweredBy',
  Wifi4eu = 'wifi4eu'
}

export enum CurrentAclEdition {
  INGRESS = 'INGRESS',
  EGRESS = 'EGRESS'
}

export type LangCode = 'zh_TW' | 'cs' | 'sk' | 'hu' | 'en' | 'da' | 'fi' |'fr' | 'nl' |
'no' | 'sv' | 'it' | 'es' | 'de' | 'pt_PT' | 'pt_BR' | 'tr' | 'el' | 'ro' | 'pl' | 'ja'

const guestPrintDictionary = {
  zh_TW: {
    /* Simplified Chinese */
    hello: '您好：',
    youCanAccess: '您現在可以存取我們的 Wi-Fi 訪客網路',
    wifiNetwork: 'Wi-Fi 網路',
    password: '密碼:',
    accessIsValid: ' 存取的有效期間為',
    enjoy: '盡情享用',
    poweredBy: '服務供應商：'
  },
  cs: {
    /* Czech */
    hello: 'Ahoj! ',
    youCanAccess: 'Nyní můžete přistupovat k síti Wi-Fi',
    wifiNetwork: 'Wi-Fi síť:',
    password: 'Heslo:',
    accessIsValid: ' Přístup je platný pro ',
    enjoy: 'Užijte si to',
    poweredBy: 'Powered by'
  },
  sk: {
    /* Slovak */
    hello: 'Ahoj! ',
    youCanAccess: 'Teraz môžete pristupovať k sieti Wi-Fi',
    wifiNetwork: 'Wi-Fi sieť:',
    password: 'Heslo:',
    accessIsValid: 'Prístup je platný pre ',
    enjoy: 'Užite si to',
    poweredBy: 'Powered by'
  },
  hu: {
    /* Hungarian */
    hello: 'Hello ',
    youCanAccess: 'Most már elérheti a Wi-Fi hálózatunkat',
    wifiNetwork: 'Wi-Fi hálózat:',
    password: 'Jelszó:',
    accessIsValid: 'Hozzáférés érvényes ',
    enjoy: 'Jó szórakozást',
    poweredBy: 'Powered by'
  },
  en: {
    hello: 'Hello ',
    youCanAccess: 'You can now access our Wi-Fi network',
    wifiNetwork: 'Wi-Fi Network:',
    password: 'Password:',
    accessIsValid: 'Access is valid for ',
    enjoy: 'Enjoy',
    poweredBy: 'Powered by'
  },
  da: {
    /* Danish */
    hello: 'Hej ',
    youCanAccess: 'Du har nu adgang til vores Wi-Fi-netværk',
    wifiNetwork: 'Wi-Fi-netværk:',
    password: ' Adgangskode:',
    accessIsValid: 'Adgang gælder for ',
    enjoy: 'God fornøjelse',
    poweredBy: 'Leveret af'
  },
  fi: {
    /* Finnish */
    hello: 'Hei ',
    youCanAccess: 'Voit nyt käyttää Wi-Fi-verkkoamme',
    wifiNetwork: 'Wi-Fi-verkko:',
    password: 'Salasana:',
    accessIsValid: 'Käyttöoikeus on voimassa ',
    enjoy: 'Nauti',
    poweredBy: 'Palvelun tarjoaa'
  },
  fr: {
    /* French */
    hello: 'Bonjour, ',
    youCanAccess: 'Vous pouvez maintenant accéder à notre réseau Wi-Fi',
    wifiNetwork: 'Réseau Wi-Fi:',
    password: 'Mot de passe:',
    accessIsValid: 'L’accès est valable pour ',
    enjoy: ' Amusez-vous bien',
    poweredBy: 'Fonctionne avec'
  },
  nl: {
    /* Dutch */
    hello: 'Hallo ',
    youCanAccess: 'U hebt nu toegang tot ons Wi-Fi-netwerk',
    wifiNetwork: 'Wi-Fi-netwerk:',
    password: 'Wachtwoord:',
    accessIsValid: 'De toegang is geldig voor ',
    enjoy: ' Veel plezier',
    poweredBy: 'Ontwikkeld door'
  },
  no: {
    /* Norwegian */
    hello: 'Hei, ',
    youCanAccess: 'Du har nå tilgang til vårt Wi-Fi-nettverk',
    wifiNetwork: 'Wi-Fi-nettverk:',
    password: 'Passord:',
    accessIsValid: 'Tilgang gyldig for ',
    enjoy: 'Kos deg',
    poweredBy: 'Drevet av'
  },
  sv: {
    /* Swedish */
    hello: 'Hej ',
    youCanAccess: 'Du har nu tillgång till vårt Wi-Fi-nätverk',
    wifiNetwork: 'Wi-Fi-nätverk:',
    password: 'Lösenord:',
    accessIsValid: 'Åtkomst är giltig för ',
    enjoy: 'Mycket nöje',
    poweredBy: 'Drivs av'
  },
  it: {
    /* Italian */
    hello: 'Salve, ',
    youCanAccess: 'È ora possibile accedere alla nostra rete Wi-Fi',
    wifiNetwork: 'Rete Wi-Fi:',
    password: 'Password:',
    accessIsValid: 'L’accesso è valido per ',
    enjoy: 'Buon divertimento',
    poweredBy: 'Powered by'
  },
  es: {
    /* Spanish */
    hello: 'Hola ',
    youCanAccess: 'Ahora puede acceder a nuestra red Wi-Fi',
    wifiNetwork: 'Red Wi-Fi:',
    password: 'Contraseña:',
    accessIsValid: 'El acceso es válido para ',
    enjoy: 'Disfrute',
    poweredBy: 'Con la tecnología de'
  },
  de: {
    /* German */
    hello: 'Hallo ',
    youCanAccess: 'Sie können jetzt auf unser Wi-Fi-Netzwerk zugreifen.',
    wifiNetwork: 'Wi-Fi-Netzwerk:',
    password: 'Passwort:',
    accessIsValid: 'Der Zugriff gilt für ',
    enjoy: ' Viel Vergnügen!',
    poweredBy: 'Unterstützt von'
  },
  pt_PT: {
    /* Portuguese */
    hello: 'Olá ',
    youCanAccess: 'Pode agora aceder à nossa rede Wi-Fi',
    wifiNetwork: 'Rede Wi-Fi:',
    password: 'Palavra-passe:',
    accessIsValid: 'Acesso válido para ',
    enjoy: 'Desfrute',
    poweredBy: 'Produzido por'
  },
  pt_BR: {
    /* Portuguese Brazil*/
    hello: 'Olá ',
    youCanAccess: 'Agora você pode acessar nossa rede Wi-Fi',
    wifiNetwork: 'Rede Wi-Fi:',
    password: 'Senha:',
    accessIsValid: 'Acesso válido para ',
    enjoy: 'Bem Vindo',
    poweredBy: 'Produzido por'
  },
  tr: {
    /* Turkish */
    hello: 'Merhaba ',
    youCanAccess: 'Şimdi Wi-Fi misafir ağımıza erişebilirsiniz',
    wifiNetwork: 'Wi-Fi Ağı:',
    password: 'Parola:',
    accessIsValid: 'Erişimin geçerli olduğu süre ',
    enjoy: ' Keyifle Kullanın',
    poweredBy: 'ile güçlendirilmiştir'
  },
  el: {
    /* Greek */
    hello: 'Γεια σας ',
    youCanAccess: 'Τώρα μπορείτε να αποκτήσετε πρόσβαση στο δίκτυο Wi-Fi για τους επισκέπτες',
    wifiNetwork: 'Δίκτυο Wi-Fi:',
    password: 'Κωδικός πρόσβασης:',
    accessIsValid: 'Η πρόσβαση ισχύει για ',
    enjoy: 'Καλή διασκέδαση!',
    poweredBy: 'Με την υποστήριξη της'
  },
  ro: {
    /* Romanian */
    hello: 'Salut, ',
    youCanAccess: 'Acum puteți accesa rețeaua noastră Wi-Fi pentru vizitatori',
    wifiNetwork: 'Rețea Wi-Fi:',
    password: 'Parolă:',
    accessIsValid: 'Accesul este valabil pentru ',
    enjoy: 'Utilizare plăcută!',
    poweredBy: 'Dezvoltat cu ajutorul'
  },
  pl: {
    /* Polish */
    hello: 'Witaj ',
    youCanAccess: 'Masz teraz dostęp do naszej sieci Wi-Fi jako gość',
    wifiNetwork: 'Sieć Wi-Fi:',
    password: 'Hasło:',
    accessIsValid: 'Dostęp jest aktywny przez ',
    enjoy: 'Dobrej zabawy',
    poweredBy: 'Technologia'
  },
  ja: {
    /* Japanese */
    hello: 'Hello ',
    youCanAccess: 'Wi-Fi ゲスト アクセス ネットワークに接続することができます。',
    wifiNetwork: 'Wi-Fi ネットワーク:',
    password: 'パスワード:',
    accessIsValid: 'のアクセス権限が付与されました。 ',
    enjoy: 'お楽しみください',
    poweredBy: 'Powered by'
  }
}

export function getGuestDictionaryByLangCode (langCode: LangCode) {
  return guestPrintDictionary[langCode]
}

export const base64Images = {
  // eslint-disable-next-line max-len
  guestLogo: 'data:image/jpeg;base64,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',
  // eslint-disable-next-line max-len
  wlanIcon: 'data:image/jpeg;base64,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',
  // eslint-disable-next-line max-len
  lockIcon: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/wAALCAB2AHYBAREA/8QAHQABAAICAwEBAAAAAAAAAAAAAAgJBgcDBAUBAv/EAEUQAAEDAgMEAwoLBgcAAAAAAAEAAgMEBQYHERIhMUEIE1EJGDdhZ3F2pbTkFBUXIjJWdYGRktEWQlKisrMzNTZ0obHB/9oACAEBAAA/AJloiIi+Pc1jS5zg1oGpJOgAXHTVNNUhxp6iKYN49W8O0/BcqIiIiIiLguNbSW2gnr6+pipaSnjdLNNK8NZGwDUuJPAAKHGdfSwutbUz2fLWMUFE0lhus8e1PL442O3MHHe4F3A/NKjbiLEeIMRVTqm/3u43SYu2tqrqXy6HxbROn3LzqeaanmbNTyyQysOrXscWuHmIW2MsukNmTgqqiZJeJb9bGkB9Fc5DLq3sZIfns05aHTtBU4Mm80cNZoYdNzscxiqodG1tBKR11M48Ne1p36OG4+IggZyiIiIiKEXTazZqb3iabLuy1TmWi1yAXF0btBU1I3lh04tjO7T+MH+EFavyJyhxBmtfX09A4UNppXD4dcZGEsi1/caP33kbw3UeMjdrNfA3R7yqwtRMi/ZilvNSGgSVN1YKlzzpx2HDYb9zQvWv+S2VN6oXUlVgKxQNcPp0VI2lkHjDog0qJXSO6Odfl7SS4mwxUT3TDbSOvbLoZ6LUgAu00D2an6QA05jmtT5XY3vOXuNKLE1llIlgdpNCToyoiJ+fG7xEfgdCN4Cs5wlfbfifDNtxDa5OsorhTMqISeIDhroewjgRyIK9REREReZi27MsGFLvfZGhzLbQzVbmnmI43PI/4VUtTPVXK4y1M731FXVSl73He6R7jqT5ySrQMn8F0WAMu7ThikjY2SngDquRo/xqhwBkeTz1drp2AAcllqLirKanrKSakq4Y56eeN0csUjdpr2OGhaQeIIOmirFzzwc3AWat9wzDqaWnn6ykJOp6iRofGNeZDXAE9oKl/wBA28zXHJOW3zPLviq6zU8QPKNzWSj+aR6kAiIiIsRzs8DWN/R6v9nkVaGCf9Z2T7Rp/wC41WuoiKv/AKcvh7qvs6m/pK3T3PbwZ4g+2T/ZjUl0RERFiuM8wcC4TnZQ4pxNardNMzUU88oL3MPMsGp2Tv3kaFYw3ODJFrg5uLMOgg6ghnD+Vdv5c8o/r5aPzu/RPlzyj+vlo/O79E+XPKP6+Wj87v0T5c8o/r5aPzu/RdefOXJaeTrJ8Y2CV+mm09u0fxLVz27OXJ4StpqPG1ggMjtw6wRNJ8ZIAHnK2LG9kkbZI3texwDmuadQQeBBX6RERFU9iu+XDEuJLhf7pO+asr6h08rnu1OpO4eYDQAcgAF5aIiIin30FL1cbvki+CvqHzttd1moqUuOpbCI4pA3XsBkcB2DQcAt9IiIiqKRfQCToBqSpd5G9FKhqrJT33MmSsE9SwSR2mB/VdU08Oud9La00+a3TZ5knUDYWLuiplXdrc+Gy0ddh6r2T1c9PVyTt2uW0yVztR4gWnxqFeaeA77lzi+ow3f4miZg6yCZm+OoiJIbIw9h0O7iCCDwWKop09z78DV39IZvZ6ZSMRERFUUizrICho7lnXhCjuDWOp33WFzmv02XFrtoNOvEEgDTnrorO0UUu6I0VIbFhK4mNoq21U8IfzMZa1xHj3gebU9qhuinT3PvwNXf0hm9nplIxEREVRSLt2a41lnu9HdrfMYKyinZUQSDiyRjg5p+4gKx7IPOCx5rWF8tJFJR3iijZ8Y0bmnZjc7XRzHcHMJDtOY03jt2De7lRWWzV14uU3UUNDTyVNTLsl2xGxpc52gBJ0AJ0A1VePSezc+VXGFO+3wy09itbHxUDJdz5C4jblcORdstAHINHMlajRTp7n34Grv6Qzez0ykYiIiKopEUr+51/wCc4y/29J/VKpMZ2eBrG/o9X+zyKrhEU6e59+Bq7+kM3s9MpGIiIiqKRFnmTmauJ8q7rW1+HI7fP8OibFUQVsTnxu2Tq0/Nc1wI1PPTeddVm+OOlDmJizCdyw3WW/DtHS3GB1PPLSU0wl6t25wBfK4DUag7uBWjERTp7n34Grv6Qzez0ykYiIiKo2WN8Ur4pGFj2OLXNI0II4gr8IiIiKdXc/GuGTN1JaQHYgmIJHEfB6cf+KRaIiIo7ZsdFTDmMcUVGILHf5cOTVkhlqoBRiohfId5cwbbCwk7yNSNeACw7vLPKV6j94TvLPKV6j94TvLPKV6j94TvLPKV6j94TvLPKV6j94TvLPKV6j94XLSdC6nbUxuqsxZZYA4dYyKzhjnDmA4zOAPj0PmUmcCYUsuCcLUWG8P03wegpGkNDjq97idXPcebiSST/wBDcvcRERERERERERF//9k=',
  // eslint-disable-next-line max-len
  ruckusLogo: 'data:image/png;base64,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',
  // eslint-disable-next-line max-len
  ruckusCommScopeLogo: 'data:image/png;base64,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',
  // eslint-disable-next-line max-len
  poweredBy: 'data:image/png;base64,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'
}

export const BACKUP_DISABLE_TOOLTIP = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'The switch status must be "Operational" before you can create the backup configuration file.'
})

export const BACKUP_IN_PROGRESS_TOOLTIP = defineMessage({
  defaultMessage: 'Backup creation is in progress'
})

export const RESTORE_IN_PROGRESS_TOOLTIP = defineMessage({
  defaultMessage: 'Backup restore is in progress'
})

export enum ConfigurationBackupStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

export enum PortTaggedEnum {
  EMPTY = '',
  TAGGED = 'TAGGED',
  UNTAGGED = 'UNTAGGED',
  LAG = 'LAG'
}

export enum UnitStatus {
  OK = 'OK',
  FAILED = 'FAILED',
  NOT_PRESENT = 'NOT_PRESENT', // Legacy value - need confirm
  OTHER = 'OTHER', // Somehow SZ may send 'Other' status
}

export enum PortLabelType {
  GENERAL = '', // 1, 2. For high end models, fiber port doesn't have port label too
  COPPER = 'C', // C1, C2
  FIBER = 'X', // X1, X2 for 10G fiber port
  FIBER_1G = 'F' // F1, F2 for 1G fiber port
}

export const ICX_MODELS_INFORMATION: SwitchModelInfoMap = {
  ICX7150: {
    'C12P': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.COPPER },
        { portLabel: PortLabelType.FIBER }
      ]
    },
    'C08P': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.FIBER_1G }
      ]
    },
    'C08PT': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.FIBER_1G }
      ]
    },
    'C10ZP': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.COPPER },
        { portLabel: PortLabelType.FIBER }
      ]
    },
    '24': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.COPPER },
        { portLabel: PortLabelType.FIBER }
      ]
    },
    '24P': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.COPPER },
        { portLabel: PortLabelType.FIBER }
      ]
    },
    '24F': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.FIBER },
        { portLabel: PortLabelType.COPPER },
        { portLabel: PortLabelType.FIBER }
      ]
    },
    '48': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.COPPER },
        { portLabel: PortLabelType.FIBER }
      ]
    },
    '48P': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.COPPER },
        { portLabel: PortLabelType.FIBER }
      ]
    },
    '48PF': {
      powerSlots: 1, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.COPPER },
        { portLabel: PortLabelType.FIBER }
      ]
    },
    '48ZP': {
      powerSlots: 2, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.FIBER }
      ]
    }
  },
  ICX7550: {
    '24': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24P': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48P': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24ZP': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48ZP': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24F': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48F': {
      powerSlots: 2, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    }

  },
  ICX7650: {
    '48P': {
      powerSlots: 2, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48ZP': {
      powerSlots: 2, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48F': {
      powerSlots: 2, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    }
  },
  ICX7850: {
    '32Q': {
      powerSlots: 2, fanSlots: 6, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48FS': {
      powerSlots: 2, fanSlots: 5, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48F': {
      powerSlots: 2, fanSlots: 5, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48C': {
      powerSlots: 2, fanSlots: 5, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    }
  },
  ICX8200: {
    '24': {
      powerSlots: 1, fanSlots: 1, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24P': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48': {
      powerSlots: 2, fanSlots: 5, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48P': {
      powerSlots: 2, fanSlots: 5, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48PF': {
      powerSlots: 1, fanSlots: 1, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48PF2': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    // 'C08P': {
    //   powerSlots: 1, fanSlots: 0, portModuleSlots: [
    //     { portLabel: PortLabelType.GENERAL },
    //     { portLabel: PortLabelType.GENERAL }
    //   ]
    // },
    'C08PF': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24ZP': {
      powerSlots: 1, fanSlots: 3, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48ZP2': {
      powerSlots: 2, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24FX': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '24F': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    '48F': {
      powerSlots: 1, fanSlots: 2, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    },
    'C08ZP': {
      powerSlots: 1, fanSlots: 0, portModuleSlots: [
        { portLabel: PortLabelType.GENERAL },
        { portLabel: PortLabelType.GENERAL }
      ]
    }
    // 'C08PT': {
    //   powerSlots: 1, fanSlots: 0, portModuleSlots: [
    //     { portLabel: PortLabelType.GENERAL },
    //     { portLabel: PortLabelType.GENERAL }
    //   ]
    // },
    // 'C08PDC': {
    //   powerSlots: 1, fanSlots: 0, portModuleSlots: [
    //     { portLabel: PortLabelType.GENERAL },
    //     { portLabel: PortLabelType.GENERAL }
    //   ]
    // }
  }
}

export const VLAN_PREFIX = {
  VLAN: 'VLAN-',
  POOL: 'VLAN Pool: '
}

export const PORTAL_LIMIT_NUMBER = 256
export const DHCP_LIMIT_NUMBER = 120
export const VLAN_LIMIT_NUMBER = 64
export const AAA_LIMIT_NUMBER = 32

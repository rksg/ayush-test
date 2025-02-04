export enum IpSecAuthEnum {
  PSK = 'PSK',
  CERTIFICATE = 'CERTIFICATE'
}

export enum IpSecProposalTypeEnum {
  DEFAULT = 'DEFAULT',
  SPECIFIC = 'SPECIFIC'
}

export enum IpSecAdvancedOptionEnum {
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED'
}

export enum IpSecFailoverModeEnum {
  NON_REVERTIVE = 'NON_REVERTIVE',
  REVERTIVE = 'REVERTIVE'
}

export enum IpSecRekeyTimeUnitEnum {
  DAY = 'DAY',
  HOUR = 'HOUR',
  MINUTE = 'MINUTE'
}

export enum IpSecRetryDurationEnum {
  FOREVER = 'FOREVER',
  SPECIFIC = 'SPECIFIC'
}

export enum IpSecDhGroupEnum {
  NONE = 'NONE',
  MODP768 = 'MODP768',
  MODP1024 = 'MODP1024',
  MODP1536 = 'MODP1536',
  MODP2048 = 'MODP2048',
  MODP3072 = 'MODP3072',
  MODP4096 = 'MODP4096',
  MODP6144 = 'MODP6144',
  MODP8192 = 'MODP8192',
  ESP384 = 'ESP384'
}

export enum IpSecEncryptionAlgorithmEnum {
  NONE = 'NONE',
  THREE_DES = 'THREE_DES',
  AES128 = 'AES128',
  AES192 = 'AES192',
  AES256 = 'AES256'
}

export enum IpSecIntegrityAlgorithmEnum {
  MD5 = 'MD5',
  SHA1 = 'SHA1',
  AEX_XBC = 'AESXCBC',
  SHA256 = 'SHA256',
  SHA384 = 'SHA384',
  SHA512 = 'SHA512'
}

export enum IpSecPseudoRandomFunctionEnum {
  USE_INTEGRITY_ALG = 'USE_INTEGRITY_ALG',
  PRF_MD5 = 'PRF_MD5',
  PRF_SHA1 = 'PRF_SHA1',
  PRF_AES_CBC = 'PRF_AES_XCBC',
  PRF_AES_MAC = 'PRF_AES_CMAC',
  PRF_SHA256 = 'PRF_SHA256',
  PRF_SHA384 = 'PRF_SHA384',
  PRF_SHA512 = 'PRF_SHA512'
}
export enum TenantType {
  REC = 'REC', // ("Regular End Customer")
  VAR = 'VAR', // ("Value Added Reseller")
  MSP = 'MSP', // ("Managed Service Provider")
  MSP_EC = 'MSP_EC', // ("MSP-End Customer")
  MSP_NON_VAR = 'MSP_NON_VAR', // ("Disti or Carrier account")
  MSP_INTEGRATOR = 'MSP_INTEGRATOR', // (MSP Integrator)
  MSP_INSTALLER = 'MSP_INSTALLER', // (MSP Installer)
  UNRECOGNIZED = 'UNRECOGNIZED' // ("Un recognised")
}
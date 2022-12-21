import { SwitchStatusEnum } from '../../types'

export const modelMap: ReadonlyMap<string, string> = new Map([
  ['CRH', 'ICX7750-48F'],
  ['CRJ', 'ICX7750-48C'],
  ['CRK', 'ICX7750-26Q'],
  ['EZC', 'ICX7650-48ZP'],
  ['EZD', 'ICX7650-48P'],
  ['EZE', 'ICX7650-48F'],
  ['FLU', 'ICX7850-32Q'],
  ['FLV', 'ICX7850-48FS'],
  ['FLW', 'ICX7850-48F'],
  ['FLX', 'ICX7850-48C'],
  ['EAR', 'ICX7450-32P'],
  ['CYQ', 'ICX7450-48'],
  ['CYR', 'ICX7450-48P'],
  ['CYS', 'ICX7450-48F'],
  ['CYT', 'ICX7450-24'],
  ['CYU', 'ICX7450-24P'],
  ['DUH', 'ICX7250-24'],
  ['DUI', 'ICX7250-24P'],
  ['DUJ', 'ICX7250-48'],
  ['DUK', 'ICX7250-48P'],
  ['FJN', 'ICX7150-48ZP'],
  ['FJP', 'ICX7150-48ZP'],
  ['FMD', 'ICX7150-C10ZP'],
  ['FME', 'ICX7150-C10ZP'],
  ['FMF', 'ICX7150-C08P'],
  ['FMG', 'ICX7150-C08P'],
  ['FMU', 'ICX7150-C08PT'],
  ['FEA', 'ICX7150-24P'],
  ['FEB', 'ICX7150-24P'],
  ['FEC', 'ICX7150-48P'],
  ['FED', 'ICX7150-48P'],
  ['FEE', 'ICX7150-48PF'],
  ['FEF', 'ICX7150-48PF'],
  ['FEG', 'ICX7150-24'],
  ['FEM', 'ICX7150-24'],
  ['FMH', 'ICX7150-24F'],
  ['FMJ', 'ICX7150-24F'],
  ['FEH', 'ICX7150-48'],
  ['FEJ', 'ICX7150-48'],
  ['FEK', 'ICX7150-C12P'],
  ['FEL', 'ICX7150-C12P'],
  ['DUM', 'ICX7250-24G'],
  ['FMK', 'ICX7550-24'],
  ['FML', 'ICX7550-48'],
  ['FMM', 'ICX7550-24P'],
  ['FMN', 'ICX7550-48P'],
  ['FMP', 'ICX7550-24ZP'],
  ['FMQ', 'ICX7550-48ZP'],
  ['FMR', 'ICX7550-24F'],
  ['FMS', 'ICX7550-48F']
])

export const isOperationalSwitch = (status: SwitchStatusEnum, syncedSwitchConfig: boolean) => {
  return status === SwitchStatusEnum.OPERATIONAL && syncedSwitchConfig
}

export const getSwitchModel = (serial: string) => {
  if (!serial || serial.length < 3) {
    return 'Unknown'
  }

  const productCode = serial.slice(0, 3)
  return modelMap.get(productCode)
}
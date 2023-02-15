export interface ClientConfig{
  secret?: string,
  ipAddress?: string[]
}

export interface RadiusServerSetting{
  host: string,
  authenticationPort: number
  accountingPort: number
}

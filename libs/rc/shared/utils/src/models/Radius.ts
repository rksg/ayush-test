import { RadiusServer }  from './RadiusServer'
import { RadSecOptions } from './RadSecOptions'

export class Radius {
  primary?: RadiusServer

  secondary?: RadiusServer

  id?: string
  name?: string
  type?: string

  radSecOptions?: RadSecOptions
}
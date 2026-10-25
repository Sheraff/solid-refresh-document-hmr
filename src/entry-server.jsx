import { renderToString } from 'solid-js/web'
import { Document } from './Document'

export const render = () => '<!DOCTYPE html>' + renderToString(() => <Document />)

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let DOMAIN_SET = null
// read the domain from json file (cached after the first read)
const loadDomains = () => {
    if (DOMAIN_SET) return DOMAIN_SET

    try {
        const domainFile_path = path.join(__dirname, '..', 'disposable_domains.json')

        const domainList = JSON.parse(fs.readFileSync(domainFile_path, 'utf-8'))

        DOMAIN_SET = new Set(domainList.map((domain) => String(domain).toLowerCase().trim()))
    } catch (error) {
        console.warn('[DisposableEmail] Could not load domain blocklist', error.message)
        DOMAIN_SET = new Set()
    }

    return DOMAIN_SET
}

export const extractDomain = (email) => {
    const value = String(email || '').trim().toLowerCase()
    const at = value.lastIndexOf('@')
    if (at === -1) return ''
    return value.slice(at + 1)
}

export const isDisposableDomain = (domain) => {
    const domainSet = loadDomains()

    if (!domainSet || domainSet.size === 0) {
        return false
    }

    const lables = String(domain || '').split('.')

    for (let i = 0; i < lables.length - 1; i++) {
        const candidate = lables.slice(i).join('.');
        if (domainSet.has(candidate)) {
            return true
        }
    }
    return false
}

export const isDisposableEmail = (email) => isDisposableDomain(extractDomain(email))

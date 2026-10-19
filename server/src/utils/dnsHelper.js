import dns from 'node:dns/promises'
import net from 'node:net'

/**
 * Resolves a hostname to an IPv4 address to avoid ENETUNREACH on platforms
 * (such as Render, Docker, or Linux containers) that lack IPv6 routes.
 *
 * If the host is already an IP, or if resolution fails, returns the original host.
 */
export async function resolveIpv4Host(hostname) {
  if (!hostname || typeof hostname !== 'string') return hostname
  const trimmed = hostname.trim()
  if (net.isIP(trimmed)) return trimmed

  try {
    const addresses = await dns.resolve4(trimmed)
    if (addresses && addresses.length > 0) {
      return addresses[0]
    }
  } catch {
    // If resolve4 fails, return original hostname so caller can attempt standard resolution
  }

  return trimmed
}

export default resolveIpv4Host

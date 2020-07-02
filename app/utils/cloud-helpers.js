import { OpenStackClient } from 'openstack-client'

/**
 * Helper to retrieve some OpenStack server data's IP address:
 *
 * @param openStackServer A full OpenStack server data object
 * @returns {string} The public IP address of Hyphe on that openStackServer
 */
export function getIP (openStackServer) {
  return Object.keys(openStackServer.addresses)
    .reduce((ips, key) => ips.concat(
      openStackServer.addresses[key]
        .filter(({ version }) => version === 4)
        .map(({ addr }) => addr)
    ), [])[0]
}

/**
 * Returns a promise that will resolve only if the given Cloud server is
 * installed.
 *
 * The promise rejects when the given server is not a cloud server or is not yet
 * installed, and only resolves for properly installed servers.
 *
 * @param server A cloud server, installed from this Hyphe browser
 * @returns {Promise}
 */
export function isInstalledPromise (server) {
  if (!server || !server.cloud) return Promise.reject('Server is not a cloud server')

  if (server.cloud.installed) return Promise.resolve(true)

  return new Promise((resolve, reject) => {
    fetch(server.url)
      .then(res => res.json())
      .then(() => resolve())
      .catch(() => reject('Server is not properly installed'))
  })
}

/**
 * Takes a full (cloud) server data object, and returns a promise that will emit
 * an authentified client if possible, or an error else
 *
 * @param server A cloud server, installed from this Hyphe browser
 * @returns {Promise<OpenStackClient>}
 */
export function getOpenStackClientPromise (server) {
  if (!server || !server.cloud) return Promise.reject('Server is not a cloud server')

  const { keystone, id, password, domain, project } = server.cloud.openStack
  const client = new OpenStackClient(keystone)

  return client.authenticate(id, password, domain, project)
    .then(() => client)
}

/**
 * Takes a full (cloud) server data object, and returns a promise that will
 * perform a given action, and return the related promise.
 *
 * Some available actions:
 * - "os-start"
 * - "os-stop"
 * - "suspend"
 * - "resume"
 * - "pause"
 * - "unpause"
 *
 * @param server A cloud server, installed from this Hyphe browser
 * @param action The string action name
 * @returns {Promise}
 */
export function performActionOnServerPromise (server, action) {
  if (!server || !server.cloud) return Promise.reject('Server is not a cloud server')

  const { region, id } = server.cloud.server

  return (
    getOpenStackClientPromise(server)
      .then(client => client.actionComputeServer(
        region,
        id,
        { [action]: null }
      ))
  )
}

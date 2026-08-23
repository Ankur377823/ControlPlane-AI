/**
 * ControlPlane AI — URL Router Module
 * Handles Hash Routing + Path Parameters + Query Parameters
 */

export function parseHash() {
  const hash = window.location.hash || '#/dashboard';
  const [pathPart, queryPart] = hash.substring(2).split('?');

  let route = pathPart || 'dashboard';
  if (route.endsWith('/')) route = route.slice(0, -1);

  const queryParams = new URLSearchParams(queryPart || '');
  return { route, queryParams };
}

export function navigate(newHash) {
  window.location.hash = newHash;
}

export function updateQueryParams(paramsObj) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(paramsObj)) {
    if (val && val !== 'All' && val !== 'All severities') {
      params.set(key, val);
    }
  }

  const qStr = params.toString();
  const currentPath = (window.location.hash || '#/dashboard').split('?')[0];
  window.history.replaceState(null, '', `${currentPath}${qStr ? '?' + qStr : ''}`);
}

export function formatTitle(str) {
  if (!str) return '';
  return str.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

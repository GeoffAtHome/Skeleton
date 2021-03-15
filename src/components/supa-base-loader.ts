/**
 * @param apiKey    API Key, or object with the URL parameters. For example
 *                  to use Google Maps Premium API, pass
 *                    `{ client: <YOUR-CLIENT-ID> }`.
 *                  You may pass the libraries and/or version (as `v`) parameter into
 *                  this parameter and skip the next two parameters
 * @param version   Google Maps version
 * @param libraries Libraries to load (@see
 *                  https://developers.google.com/maps/documentation/javascript/libraries)
 * @param loadCn    Boolean. If set to true, the map will be loaded from google maps China
 *                  (@see https://developers.google.com/maps/documentation/javascript/basics#GoogleMapsChina)
 *
 * Example:
 * ```
 *      import {load} from 'vue-google-maps'
 *
 *      load(<YOUR-API-KEY>)
 *
 *      load({
 *              key: <YOUR-API-KEY>,
 *      })
 *
 *      load({
 *              client: <YOUR-CLIENT-ID>,
 *              channel: <YOUR CHANNEL>
 *      })
 * ```
 */

export interface ISupaBase {
  createClient: any;
  SupabaseClient: any;
  SupabaseClientOptions: any;
  SupabaseRealtimePayload: any;
  AuthUser: any;
}

declare global {
  interface Window {
    supabase: ISupaBase;
  }
}

function waitFor(conditionFunction: () => boolean) {
  const poll = (resolve: () => void) => {
    if (conditionFunction()) resolve();
    else setTimeout(() => poll(resolve), 400);
  };

  return new Promise<void>(poll);
}

function isSupaBaseApiLoaded(): boolean {
  return window.supabase !== undefined;
}

async function waitForLoader(element: Element) {
  await waitFor(isSupaBaseApiLoaded);
  const event = new CustomEvent<ISupaBase>('SupaBaseLoaded', {
    detail: window.supabase,
  });
  if (element) {
    element.dispatchEvent(event);
  }
}

export default (() => {
  let isApiSetUp = false;

  return (element: Element) => {
    if (typeof document === 'undefined') {
      // Do nothing if run from server-side
      return;
    }

    if (!isApiSetUp) {
      isApiSetUp = true;

      const loaderScript = document.createElement('SCRIPT');
      const url = `https://cdn.jsdelivr.net/npm/@supabase/supabase-js`;
      loaderScript.setAttribute('src', url);
      loaderScript.setAttribute('async', '');
      loaderScript.setAttribute('defer', '');
      document.head.appendChild(loaderScript);
      waitForLoader(element);
    } else {
      waitForLoader(element);
    }
  };
})();

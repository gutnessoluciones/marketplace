/**
 * Microsoft Graph API client — handles OAuth 2.0 token acquisition
 * via client credentials flow and provides an authenticated Graph client.
 */

import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import {
  TokenCredentialAuthenticationProvider,
  type TokenCredentialAuthenticationProviderOptions,
} from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials/index.js";
import { getEmailConfig } from "./config";

let graphClient: Client | null = null;

/**
 * Returns an authenticated Microsoft Graph client using client credentials.
 * The client is cached for reuse across requests within the same serverless instance.
 */
export function getGraphClient(): Client {
  if (graphClient) return graphClient;

  const config = getEmailConfig();

  const credential = new ClientSecretCredential(
    config.tenantId,
    config.clientId,
    config.clientSecret,
  );

  const authProviderOptions: TokenCredentialAuthenticationProviderOptions = {
    scopes: ["https://graph.microsoft.com/.default"],
  };

  const authProvider = new TokenCredentialAuthenticationProvider(
    credential,
    authProviderOptions,
  );

  graphClient = Client.initWithMiddleware({
    authProvider,
  });

  return graphClient;
}

/**
 * Clears the cached Graph client. Useful for testing or credential rotation.
 */
export function resetGraphClient(): void {
  graphClient = null;
}

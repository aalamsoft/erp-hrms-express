import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";

class SharePointService {
  private client: Client;

  constructor() {
    const credential = new ClientSecretCredential(
      process.env.TENANT_ID!,
      process.env.CLIENT_ID!,
      process.env.CLIENT_SECRET!
    );
    console.log("credential", credential);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ["https://graph.microsoft.com/.default"],
    });
    console.log("authProvider", authProvider);

    this.client = Client.initWithMiddleware({
      authProvider: authProvider,
    });
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folderPath: string
  ): Promise<any> {
    try {
      // Get the SharePoint site ID
      const site = await this.client.api("/sites/root").get();

      // Ensure the folder exists
      await this.ensureFolderExists(site.id, folderPath);

      // Upload the file
      const driveItem = await this.client
        .api(`/sites/${site.id}/drive/root:/${folderPath}/${fileName}:/content`)
        .put(fileBuffer);

      return driveItem;
    } catch (error) {
      console.error("Error uploading file to SharePoint:", error);
      throw error;
    }
  }

  private async ensureFolderExists(
    siteId: string,
    folderPath: string
  ): Promise<void> {
    const folders = folderPath.split("/").filter(Boolean);
    let currentPath = "";

    for (const folder of folders) {
      currentPath += `/${folder}`;
      try {
        await this.client
          .api(`/sites/${siteId}/drive/root:${currentPath}`)
          .get();
      } catch (error: any) {
        if (error.statusCode === 404) {
          // Folder doesn't exist, create it
          // Folder doesn't exist, create it
          await this.client
            .api(`/sites/${siteId}/drive/root:${currentPath}`)
            .post({
              name: folder,
              folder: {},
            });
        } else {
          throw error;
        }
      }
    }
  }
}

export default SharePointService;

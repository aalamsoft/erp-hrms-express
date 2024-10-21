import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";
import * as fs from "fs";
import * as path from "path";

class SharePointService {
  private client: Client;

  constructor() {
    const credential = new ClientSecretCredential(
      process.env.TENANT_ID!,
      process.env.CLIENT_ID!,
      process.env.CLIENT_SECRET!
    );
    console.log("Credential created");
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ["https://graph.microsoft.com/.default"],
    });
    console.log("AuthProvider created");

    this.client = Client.initWithMiddleware({
      authProvider: authProvider,
      debugLogging: true,
    });
    console.log("Graph client initialized");
  }

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    folderPath: string,
    siteName: string = "AalamInfoSolutinonsLLP"
  ): Promise<any> {
    try {
      // Get the SharePoint site ID
      console.log(`Fetching SharePoint site ID for ${siteName}`);
      const site = await this.client
        .api(`/sites/root:/sites/${siteName}`)
        .get();
      console.log("SharePoint site ID:", site.id);

      // Normalize the folder path
      const normalizedFolderPath = this.normalizeFolderPath(folderPath);
      console.log("Normalized folder path:", normalizedFolderPath);

      // Get the file name from the path
      // const fileName = path.basename(filePath);
      // console.log("Uploading file:", fileName);

      // // Read the file
      // const fileContent = fs.readFileSync(filePath);

      // Upload the file

      const driveItem = await this.client
        .api(
          `/sites/${site.id}/drive/root:${normalizedFolderPath}/${fileName}:/content`
        )
        .put(fileBuffer);

      console.log("File uploaded successfully");
      return driveItem;
    } catch (error: any) {
      console.error("Error uploading file to SharePoint:");
      console.error("Error object:", JSON.stringify(error, null, 2));
      console.error("Error message:", error.message);
      console.error("Error code:", error.code);
      console.error("Status code:", error.statusCode);
      console.error("Request ID:", error.requestId);
      if (error.body) {
        console.error("Error body:", error.body);
      }
      throw error;
    }
  }

  private normalizeFolderPath(folderPath: string): string {
    let normalized = folderPath.replace(/^\/+|\/+$/g, "");
    if (!normalized.startsWith("Shared Documents")) {
      normalized = `Shared Documents/${normalized}`;
    }
    return `/${normalized}`;
  }
}

export default SharePointService;

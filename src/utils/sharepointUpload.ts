// src/services/SharePointService.ts

import { ConfidentialClientApplication } from "@azure/msal-node";
import axios from "axios";
import fs from "fs";
import path from "path";

class SharePointService {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;
  private msalClient: ConfidentialClientApplication;
  private graphApiUrl: string;

  constructor() {
    this.clientId = process.env.CLIENT_ID as string;
    this.clientSecret = process.env.CLIENT_SECRET as string;
    this.tenantId = process.env.TENANT_ID as string;
    this.graphApiUrl = process.env.SHAREPOINT_URL as string;

    this.msalClient = new ConfidentialClientApplication({
      auth: {
        clientId: this.clientId,
        authority: `https://login.microsoftonline.com/${this.tenantId}`,
        clientSecret: "NZgXaezmD4Nz3NAj3i8aNjdZjz3YExeTTMX0FwxpQGg=",
      },
    });
  }

  // Function to get an access token
  private async getAccessToken(): Promise<string> {
    const response: any = await this.msalClient.acquireTokenByClientCredential({
      scopes: [`${this.graphApiUrl}/.default`],
    });
    return response.accessToken!;
  }
  // Function to get site ID by site name
  public async getSiteIdByName(siteName: string): Promise<string> {
    const accessToken = await this.getAccessToken();
    console.log("siteName", siteName);
    const url = `${this.graphApiUrl}/sites?search=${encodeURIComponent(
      siteName
    )}`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log("getSiteIdByName", response);

    // Check if any sites were found
    if (response.data.value.length > 0) {
      return response.data.value[0].id; // Return the first site ID found
    } else {
      throw new Error(`Site with name "${siteName}" not found.`);
    }
  }
  // Function to upload a file to SharePoint
  public async uploadFile(
    filePath: string,
    fileName: string,
    siteId: string
  ): Promise<string> {
    const accessToken = await this.getAccessToken();
    console.log("accessToken", accessToken);
    const siteName = await this.getSiteIdByName(siteId);
    console.log("siteName", siteName);

    // Prepare the upload URL
    const uploadUrl = `${this.graphApiUrl}/sites/${siteId}/drive/root:/${fileName}:/content`;

    const fileStream = fs.createReadStream(filePath);

    // Upload the file
    const response = await axios.put(uploadUrl, fileStream, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
      },
    });

    // Return the file's web URL
    return response.data.webUrl;
  }
}

export default SharePointService;

import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config();

const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
// const clientSecret = "NZgXaezmD4Nz3NAj3i8aNjdZjz3YExeTTMX0FwxpQGg=";
const sharepointUrl = process.env.SHAREPOINT_URL; // Your SharePoint tenant URL
// const sharepointUrl =; // Your SharePoint tenant URL

async function getSharePointAccessToken() {
  // Use Microsoft v2.0 OAuth token endpoint
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const scope = `${sharepointUrl}/.default`; // Scope should use the SharePoint URL with /.default

  try {
    // Prepare the URLSearchParams for x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", `${clientId}@${tenantId}` || "");
    params.append("client_secret", clientSecret || "");
    params.append("scope", scope); // Use scope instead of resource for v2.0

    // Make the request to get the token
    const response = await axios.post(tokenUrl, params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const accessToken = response.data.access_token;
    const siteURL: any = process.env.SHAREPOINT_SITE__URL;
    const siteUrl: string = encodeURIComponent(siteURL);
    console.log("accessToken----->", accessToken);

    return accessToken;
  } catch (error: any) {
    console.error(
      "Error fetching SharePoint access token:",
      error.response?.data || error.message
    );
    throw error;
  }
}

export { getSharePointAccessToken };

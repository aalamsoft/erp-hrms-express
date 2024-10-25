"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const identity_1 = require("@azure/identity");
const microsoft_graph_client_1 = require("@microsoft/microsoft-graph-client");
const azureTokenCredentials_1 = require("@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials");
class SharePointService {
    constructor() {
        const credential = new identity_1.ClientSecretCredential(process.env.TENANT_ID, process.env.CLIENT_ID, process.env.CLIENT_SECRET);
        console.log("Credential created");
        const authProvider = new azureTokenCredentials_1.TokenCredentialAuthenticationProvider(credential, {
            scopes: ["https://graph.microsoft.com/.default"],
        });
        console.log("AuthProvider created");
        this.client = microsoft_graph_client_1.Client.initWithMiddleware({
            authProvider: authProvider,
            debugLogging: true,
        });
        console.log("Graph client initialized");
    }
    uploadFile(fileBuffer_1, fileName_1, folderPath_1) {
        return __awaiter(this, arguments, void 0, function* (fileBuffer, fileName, folderPath, siteName = "AalamInfoSolutinonsLLP") {
            try {
                // Get the SharePoint site ID
                console.log(`Fetching SharePoint site ID for ${siteName}`);
                const site = yield this.client
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
                const driveItem = yield this.client
                    .api(`/sites/${site.id}/drive/root:${normalizedFolderPath}/${fileName}:/content`)
                    .put(fileBuffer);
                console.log("File uploaded successfully");
                return driveItem;
            }
            catch (error) {
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
        });
    }
    normalizeFolderPath(folderPath) {
        let normalized = folderPath.replace(/^\/+|\/+$/g, "");
        if (!normalized.startsWith("Shared Documents")) {
            normalized = `Shared Documents/${normalized}`;
        }
        return `/${normalized}`;
    }
}
exports.default = SharePointService;

"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharePointAccessToken = getSharePointAccessToken;
const axios_1 = __importDefault(require("axios"));
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
// const clientSecret = "NZgXaezmD4Nz3NAj3i8aNjdZjz3YExeTTMX0FwxpQGg=";
const sharepointUrl = process.env.SHAREPOINT_URL; // Your SharePoint tenant URL
// const sharepointUrl =; // Your SharePoint tenant URL
function getSharePointAccessToken() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
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
            const response = yield axios_1.default.post(tokenUrl, params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            const accessToken = response.data.access_token;
            const siteURL = process.env.SHAREPOINT_SITE__URL;
            const siteUrl = encodeURIComponent(siteURL);
            console.log("accessToken----->", accessToken);
            return accessToken;
        }
        catch (error) {
            console.error("Error fetching SharePoint access token:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw error;
        }
    });
}

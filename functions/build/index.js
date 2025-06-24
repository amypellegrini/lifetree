import * as functions from "firebase-functions";
import { MCPClient } from "./mcpClient.js";
const MCP_SERVER_SCRIPT = process.env.MCP_SERVER_SCRIPT;
export const callMCP = functions.https.onRequest(async (req, res) => {
    const { input } = req.body;
    try {
        const mcpClient = new MCPClient("Amy");
        await mcpClient.connectToServer(MCP_SERVER_SCRIPT || "");
        const output = await mcpClient.processQuery(input);
        res.status(200).json({ output });
    }
    catch (err) {
        console.error("Error calling MCP:", err);
        res.status(500).send("MCP request failed.");
    }
});

import http from "node:http";
import path from "node:path";
import { serveAsset } from "../desktop/protocol.mjs";
const port = Number(process.env.PORT ?? 3015);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid port");
const root = path.resolve("out");
http.createServer(async (req,res) => {
  try {
    const response = await serveAsset(root,new Request(`village://app${req.url}`,{method:req.method}),{scheme:"village",host:"app"});
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch { res.writeHead(500); res.end("Preview failed"); }
}).listen(port,"127.0.0.1",()=>console.log(`Static preview: http://127.0.0.1:${port}`));

import { Server } from "https://js.sabae.cc/Server.js";
import { BBS } from "./BBS.js";

class BBSServer extends Server {
  async api(path, req) {
    if (path == "/api/list") {
      return await BBS.list();
    } else if (path == "/api/add") {
      return await BBS.add(req);
    } else if (path == "/api/regist") {
      return await BBS.regist(req);
    }
  }
}

new BBSServer(3001);

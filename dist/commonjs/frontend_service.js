"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class FrontendService {
    constructor(serverSideRenderService) {
        this._serverSideRenderService = undefined;
        this.config = undefined;
        this._serverSideRenderService = serverSideRenderService;
    }
    get serverSideRenderService() {
        return this._serverSideRenderService;
    }
    async initialize() {
        if (this.serverSideRenderService) {
            this.serverSideRenderService.initialize(this.config);
        }
    }
    getFrontend() {
        return (req, res, next) => {
            if (this.serverSideRenderService) {
                this.serverSideRenderService.render(req, res, next);
            }
            else if (this.config.frontendIndexFilePath) {
                res.status(200).sendFile(path.resolve(this.config.frontendIndexFilePath, (this.config.frontendIndexFileName ? this.config.frontendIndexFileName : 'index.html')));
            }
            else {
                res.status(404).send('No functional frontend configuration found (no Static Frontend nor SSRService configured).');
            }
        };
    }
}
exports.FrontendService = FrontendService;

//# sourceMappingURL=frontend_service.js.map

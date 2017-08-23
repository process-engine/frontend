"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class FrontendService {
    constructor(serverSideRenderService, frontendProvider) {
        this._serverSideRenderService = undefined;
        this._frontendProvider = undefined;
        this.config = undefined;
        this._serverSideRenderService = serverSideRenderService;
        this._frontendProvider = frontendProvider;
    }
    get serverSideRenderService() {
        return this._serverSideRenderService;
    }
    get frontendProvider() {
        return this._frontendProvider;
    }
    async initialize() {
        if (this.serverSideRenderService) {
            this.serverSideRenderService.initialize();
        }
        if (this.frontendProvider) {
            this.frontendProvider.initialize();
        }
    }
    getFrontend() {
        return (req, res, next) => {
            if (this.serverSideRenderService) {
                res.status(200).send(this.serverSideRenderService.render(this.frontendProvider));
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

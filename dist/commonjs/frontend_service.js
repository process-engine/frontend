"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class FrontendService {
    constructor(serverSideRenderServiceFactory) {
        this._serverSideRenderService = undefined;
        this._serverSideRenderServiceFactory = undefined;
        this.config = undefined;
        this._serverSideRenderServiceFactory = serverSideRenderServiceFactory;
    }
    get serverSideRenderServiceFactory() {
        return this._serverSideRenderServiceFactory;
    }
    get serverSideRenderService() {
        return this._serverSideRenderService;
    }
    async initialize() {
        if (this.serverSideRenderServiceFactory) {
            this._serverSideRenderService = await this.serverSideRenderServiceFactory([], this._getSsrConfig());
        }
    }
    _getSsrConfig() {
        return {
            frontend: this.config,
        };
    }
    getFrontend() {
        return (req, res, next) => {
            if (this.serverSideRenderService) {
                this.serverSideRenderService.render(req, res, next);
            }
            else if (this.config.frontendIndexFilePath) {
                let indexFileName = 'index.html';
                if (this.config.frontendIndexFileName !== undefined &&
                    this.config.frontendIndexFileName !== null) {
                    indexFileName = this.config.frontendIndexFileName;
                }
                const indexFilePath = path.resolve(this.config.frontendIndexFilePath, indexFileName);
                res.status(200).sendFile(indexFilePath);
            }
            else {
                res.status(404).send('No functional frontend configuration found (no Static Frontend nor SSRService configured).');
            }
        };
    }
}
exports.FrontendService = FrontendService;

//# sourceMappingURL=frontend_service.js.map

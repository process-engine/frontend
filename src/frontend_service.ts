import {IFrontendService, IServerSideRenderService} from "@process-engine-js/frontend_contracts";
import * as path from 'path';

export class FrontendService implements IFrontendService {

  private _serverSideRenderService: IServerSideRenderService = undefined;

  public config: any = undefined;

  constructor(serverSideRenderService: IServerSideRenderService) {
    this._serverSideRenderService = serverSideRenderService;
  }

  private get serverSideRenderService(): IServerSideRenderService {
    return this._serverSideRenderService;
  }

  public async initialize(): Promise<void> {
    if (this.serverSideRenderService) {
      this.serverSideRenderService.initialize(this.config);
    }
  }

  getFrontend() {
    return (req: any, res: any, next) => {
      if (this.serverSideRenderService) {
        this.serverSideRenderService.render(req, res, next);
      } else if (this.config.frontendIndexFilePath) {
        res.status(200).sendFile(path.resolve(this.config.frontendIndexFilePath, (this.config.frontendIndexFileName ? this.config.frontendIndexFileName : 'index.html')));
      } else {
        res.status(404).send('No functional frontend configuration found (no Static Frontend nor SSRService configured).');
      }
    }
  }
}

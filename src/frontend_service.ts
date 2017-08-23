import {IFrontendProvider, IFrontendService, IServerSideRenderService} from "@process-engine-js/frontend_contracts";
import * as path from 'path';

export class FrontendService implements IFrontendService {

  private _serverSideRenderService: IServerSideRenderService = undefined;
  private _frontendProvider: IFrontendProvider = undefined;

  public config: any = undefined;

  constructor(serverSideRenderService: IServerSideRenderService, frontendProvider: IFrontendProvider) {
    this._serverSideRenderService = serverSideRenderService;
    this._frontendProvider = frontendProvider;
  }

  private get serverSideRenderService(): IServerSideRenderService {
    return this._serverSideRenderService;
  }

  private get frontendProvider(): IFrontendProvider {
    return this._frontendProvider;
  }

  public async initialize(): Promise<void> {
    if (this.serverSideRenderService) {
      this.serverSideRenderService.initialize();
    }
    if (this.frontendProvider) {
      this.frontendProvider.initialize();
    }
  }

  getFrontend() {
    return (req: any, res: any, next) => {
      if (this.serverSideRenderService) {
        res.status(200).send(this.serverSideRenderService.render(this.frontendProvider));
      } else if (this.config.frontendIndexFilePath) {
        res.status(200).sendFile(path.resolve(this.config.frontendIndexFilePath, (this.config.frontendIndexFileName ? this.config.frontendIndexFileName : 'index.html')));
      } else {
        res.status(404).send('No functional frontend configuration found (no Static Frontend nor SSRService configured).');
      }
    }
  }
}

import {IFrontendService, IServerSideRenderService} from '@process-engine-js/frontend_contracts';
import {IFactoryAsync} from 'addict-ioc';
import * as path from 'path';

export class FrontendService implements IFrontendService {

  private _serverSideRenderService: IServerSideRenderService = undefined;
  private _serverSideRenderServiceFactory: IFactoryAsync<IServerSideRenderService> = undefined;

  public config: any = undefined;

  constructor(serverSideRenderServiceFactory: IFactoryAsync<IServerSideRenderService>) {
    this._serverSideRenderServiceFactory = serverSideRenderServiceFactory;
  }

  private get serverSideRenderServiceFactory(): IFactoryAsync<IServerSideRenderService> {
    return this._serverSideRenderServiceFactory;
  }

  private get serverSideRenderService(): IServerSideRenderService {
    return this._serverSideRenderService;
  }

  public async initialize(): Promise<void> {
    if (this.serverSideRenderServiceFactory) {
      this._serverSideRenderService = await this.serverSideRenderServiceFactory([], this._getSsrConfig());
    }
  }

  private _getSsrConfig(): any {
    return {
      frontend: this.config,
    };
  }

  getFrontend() {
    return (req: any, res: any, next) => {
      if (this.serverSideRenderService) {
        this.serverSideRenderService.render(req, res, next);
      } else if (this.config.frontendIndexFilePath) {
        let indexFileName = 'index.html';
        if (this.config.frontendIndexFileName !== undefined &&
          this.config.frontendIndexFileName !== null) {
          indexFileName = this.config.frontendIndexFileName;
        }

        const indexFilePath = path.resolve(this.config.frontendIndexFilePath, indexFileName);
        res.status(200).sendFile(indexFilePath);
      } else {
        res.status(404).send('No functional frontend configuration found (no Static Frontend nor SSRService configured).');
      }
    }
  }
}

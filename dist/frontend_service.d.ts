import { IFrontendService, IServerSideRenderService } from '@process-engine-js/frontend_contracts';
import { IFactoryAsync } from 'addict-ioc';
export declare class FrontendService implements IFrontendService {
    private _serverSideRenderService;
    private _serverSideRenderServiceFactory;
    config: any;
    constructor(serverSideRenderServiceFactory: IFactoryAsync<IServerSideRenderService>);
    private readonly serverSideRenderServiceFactory;
    private readonly serverSideRenderService;
    initialize(): Promise<void>;
    private _getSsrConfig();
    getFrontend(): (req: any, res: any, next: any) => void;
}

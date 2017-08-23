import { IFrontendProvider, IFrontendService, IServerSideRenderService } from "@process-engine-js/frontend_contracts";
export declare class FrontendService implements IFrontendService {
    private _serverSideRenderService;
    private _frontendProvider;
    config: any;
    constructor(serverSideRenderService: IServerSideRenderService, frontendProvider: IFrontendProvider);
    private readonly serverSideRenderService;
    private readonly frontendProvider;
    initialize(): Promise<void>;
    getFrontend(): (req: any, res: any, next: any) => void;
}

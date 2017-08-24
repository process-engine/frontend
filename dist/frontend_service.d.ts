import { IFrontendService, IServerSideRenderService } from "@process-engine-js/frontend_contracts";
export declare class FrontendService implements IFrontendService {
    private _serverSideRenderService;
    config: any;
    constructor(serverSideRenderService: IServerSideRenderService);
    private readonly serverSideRenderService;
    initialize(): Promise<void>;
    getFrontend(): (req: any, res: any, next: any) => void;
}

import type { IHighlite } from './interfaces/highlite/core.interface';
import type { Plugin } from './interfaces/highlite/plugin/plugin.class';
declare global {
    interface Window {
        [key: string]: any;
    }

    interface Document {
        highlite: {
            managers: {
                [key: string]: any;
            };
            gameHooks: {
                [key: string]: any;
            };
            gameLookups: {
                [key: string]: any;
            };
            plugins: Array<Plugin>;
            core: IHighlite;
        };

        client: {
            [key: string]: any;
        };

        game: {
            [key: string]: any;
        };
    }
}

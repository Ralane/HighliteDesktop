import { Plugin } from '../core/interfaces/highlite/plugin/plugin.class';
import { SettingsTypes } from '../core/interfaces/highlite/plugin/pluginSettings.interface';

export class CustomCursor extends Plugin {
    pluginName: string = 'Custom Cursor';
    author = '0rangeYouGlad';

    constructor() {
        super();

        this.settings.cursorOffset = {
            text: 'Cursor Offset',
            type: SettingsTypes.text,
            value: "auto",
            callback: this.reset_cursor,
        } as any;

        this.settings.cursorImportant = {
            text: 'Cursor Important (Hover and Click)',
            type: SettingsTypes.checkbox,
            value: true,
            callback: this.reset_cursor,
        } as any;

        this.settings.cursorImagePresets = {
            text: 'Cursor Presets',
            type: SettingsTypes.range,
            value: 1,
            callback: this.reset_cursor,
        } as any;

        this.settings.cursorCustomImage = {
            text: 'Cursor Custom Image',
            type: SettingsTypes.text,
            value: "",
            callback: this.reset_cursor,
        } as any;
    }
    
    get_legendary_scimitar_png() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAkUExURbIACYwAB3cABiMjIzg4OC0tLWBgYExMTCgoKD09PTMzMwAAAO7Zk5kAAAAMdFJOU///////////////ABLfzs4AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuOBtp6qgAAAC2ZVhJZklJKgAIAAAABQAaAQUAAQAAAEoAAAAbAQUAAQAAAFIAAAAoAQMAAQAAAAIAAAAxAQIAEAAAAFoAAABphwQAAQAAAGoAAAAAAAAAYAAAAAEAAABgAAAAAQAAAFBhaW50Lk5FVCA1LjEuOAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlAAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAACrgCETU544KAAAAOhJREFUSEvt1MsSgyAMBdCgiDz+/38bILYNRkh2XfSuNDPHS3RGgGILWAUCmwBwm0lggU004AyiA4OAtgV2aEkHrURnCNQS52g2DT61CyTbRsNZGugCDQ1nqed+Cy0wif5mLqEGl9ADvbgACQPoYv0pPkApvkAla8GARnCgEAPAQRUTcgMrcQcLIQAUbZGdbnkk0IU/RCGCKsLp6YZHBgVCCJGueR6AP0PKUdpcBvvhY07gcrzVPDTgvtFBEloeQM2GJdgydEwAlmRsyVxMAbZgSWanWgAsSfwPugJl3HoJxvyBJj8HSnkBTPJaBU5Anq0AAAAASUVORK5CYII='
    }

    get_celadon_scimitar_png() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAkUExURQCyqQCMhQB3cSMjIzg4OC0tLWBgYExMTCgoKD09PTMzMwAAAKNN4NsAAAAMdFJOU///////////////ABLfzs4AAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuOBtp6qgAAAC2ZVhJZklJKgAIAAAABQAaAQUAAQAAAEoAAAAbAQUAAQAAAFIAAAAoAQMAAQAAAAIAAAAxAQIAEAAAAFoAAABphwQAAQAAAGoAAAAAAAAAYAAAAAEAAABgAAAAAQAAAFBhaW50Lk5FVCA1LjEuOAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlAAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAACrgCETU544KAAAAOhJREFUSEvt1MsSgyAMBdCgiDz+/38bILYNRkh2XfSuNDPHS3RGgGILWAUCmwBwm0lggU004AyiA4OAtgV2aEkHrURnCNQS52g2DT61CyTbRsNZGugCDQ1nqed+Cy0wif5mLqEGl9ADvbgACQPoYv0pPkApvkAla8GARnCgEAPAQRUTcgMrcQcLIQAUbZGdbnkk0IU/RCGCKsLp6YZHBgVCCJGueR6AP0PKUdpcBvvhY07gcrzVPDTgvtFBEloeQM2GJdgydEwAlmRsyVxMAbZgSWanWgAsSfwPugJl3HoJxvyBJj8HSnkBTPJaBU5Anq0AAAAASUVORK5CYII='
    }

    get_ember_staff_png() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFQUExUReVkPORmPOVkO+RpPu4yJ+NsP993ReViO+8PHe0yJvAAG+0zJvAFHOhTM+tGLu0sJfM+H+8jIO8gIfEAGe8RH/ZLH/I3IO4YIe4YIOw7Ku4gH+RqP/VJH/hVHvVMH/ZHH/EvH+8eIeFuP+JuQPAtIPlVHvlqHvp1H/VEH/VKH/ApIetELetFLe8XH/VGH/lWHvlnH/yeIflQHvlZHvI6IO8UH/I5IPlYHvlKHvuaIf23I/uQIflSHfMzHfI4IPlcHvqKIPypIv21I/yNHO0xJvAbHvdHHvuGIP24I/20I/+2IeerSO4lI/EuIPlhHvymIvy1Is+IH65pG69qHG4sEXY0GHMxFoZEJXYzF3w5HI1LKo1LK3g1GW8tEotJKnQyFnc1GZ1bOJhWM3w5HY5MK5dVMnEvFIpIKJtZNppYNZFPLpxZNodFJoE+IXs4HAAAAJiwptkAAABwdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wC3YWLSAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGHRFWHRTb2Z0d2FyZQBQYWludC5ORVQgNS4xLjgbaeqoAAAAtmVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABAAAABaAAAAaYcEAAEAAABqAAAAAAAAAGAAAAABAAAAYAAAAAEAAABQYWludC5ORVQgNS4xLjgAAwAAkAcABAAAADAyMzABoAMAAQAAAAEAAAAFoAQAAQAAAJQAAAAAAAAAAgABAAIABAAAAFI5OAACAAcABAAAADAxMDAAAAAAq4AhE1OeOCgAAAGVSURBVEhL1ZNXd4JAEEYx1WB67733XkzvvYcQIyqosaTN/3/LsrsnCbA7mMfcB/h2Dld2hlUBin0LsOiDAgHyYJEdCxbI9ftZf4ltqbikFMrKSQjSJQbvoUINVVbZwdcgAtlGdU1tXX0DL+EQgfxoqLGpuaW1Ddp5FYFtqUPt7Oru6Q320RUKFfoH1MGh4ZHRsXFaQ6HCxOTU9Mzs3PzCIq2hKPbk1aXlldW18PrGJitiKHSQ6tb2zu5eeJ/VUJhwcHh0fHJ6ds5qKGxKcHF5dX1ze8cWKFxg3D/wgOAQNO2RJzkOAXT9KcKjDKcAz5rGkwyXAFEjxpMEtwBxn8Y9QiSS4EmMRwDTMHgS4hUsw8De4RUgaf5RsCwTmZRAACsVN3n0IhLAihrSzyEUyPczTclLJAKkU5LpygRyrMS7kgvkWPHgABOEBiJAXBc0jgkveiLD4w+YAOlsJuX+Q6FC0spp7lGhAkAu7z5XPgLkX12N+wlvuukcrp8A8P7BA8NfgOwnD5RChNjvvgsQ4M+Cg/8vAHwB/s/CmmY1C5IAAAAASUVORK5CYII='
    }

    get_png_from_preset() {
        // Don't think it's feasible to use the copy alredy in the game files unfortunately, need a separate png
        switch(this.settings.cursorImagePresets.value) {
            case 1:
                return this.get_legendary_scimitar_png();
            case 2:
                return this.get_celadon_scimitar_png();
            case 3:
            default:
                return this.get_ember_staff_png();
        }
    }

    get_cursor_url() {
        return `url(${this.settings.cursorCustomImage.value || this.get_png_from_preset()})`
    }

    init(): void {
        this.log('Initialized CustomCursor');
    }

    start(): void {
        this.log('Started CustomCursor');
        this.set_cursor()
    }

    stop(): void {
        this.log('Stopped CustomCursor');
        this.clear_cursor();
    }

    private addCSSStyles(cursorName?: string): void {
        const preexistingStyle = document.head.querySelector('#cursorStyle');
        if(preexistingStyle) {
            document.head.removeChild(preexistingStyle);
        }
        if(cursorName) {
            const style = document.createElement('style');
            style.id = "cursorStyle";
            style.textContent = `
                /* Ensure panel takes full width and height */
                .hs-screen-mask {
                    cursor: ${cursorName};
                }
                :hover {
                    cursor: ${cursorName};
                }
                html {
                    cursor: ${cursorName};
                }
            `;
            document.head.appendChild(style);
        }
    }

    set_cursor() {
        this.addCSSStyles(`${this.get_cursor_url()}, ${this.settings.cursorOffset.value || 'auto'} ${this.settings.cursorImportant.value ? '!important' : ''}`);
    }

    reset_cursor() {
        this.clear_cursor();
        this.set_cursor();
    }

    clear_cursor() {
        this.addCSSStyles();
    }
}

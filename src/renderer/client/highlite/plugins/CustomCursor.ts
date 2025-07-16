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
            value: "auto !important",
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
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACbklEQVR4nO2ZMYsTQRiGnwleM9Ok2FwbTBEOU1gIIoJgY22aK87qahs7WdKENEews/EH2F5z1jbCYaFw3SkSEiHlsSm22W0OMxZx4l6Im91sMjuRe5sU2YR5eN/5Zr5vxXv/gF1WpewFFNUtQNn6fwGq/bG2uZB1lerALkCsjJDrEKkAA6Z85pfTEKkATSrUEE5DZK5CA6ZOQuQqoy5C/BMg9OsC/sYoQBOg5xCugNzJ87ABgSkAzQSEAbatXACQhAADArC/qRXlVOoeWBYjmEEkYxWg+db/WUqkMjvQpAJMCdDUmKXFfAIJV+xqZRVKZnvRCReUqYxmgaghSolR5nPAVSdyHWQuQuRuaNIgyojRWh2ZS06s3VKmQdh0oVBPvAzCyBZE4aY+9Oti8cQ2sgGxsalEWRAbHauUASG2NRut9sd68OfulFTLb2z02r21wVbo18WiE7B5N7Y6mbMBsfXRYhJi2b7onV4XgrEyGzUQcLOHePepqqWUhSCsDXcXIa6OX+B5Hkopuod7a29sq9NpA3F5fASA53mEYVjoP62P108e3WcymQAwGo1QSnFyhl53Y+eeShRR7/RaSxkBMBwOUUohpaR78Z0BgrcflY6i2fedNpliZdWB7uGeiOOYl09D0Wkjoiji+flXAD48eYiUEqUUkL3UWo9QcsN22ogAzeuDOnEcAyCl5M2PMTUEJ2erm4zSXzG1/MbcjTiObzhi9kfa70sHMOq0Ea+eRSJA03twD2AeqbQ4OQNg1PIbczcAji4uUy+AzgHAzI0oinh8/oV9/25qNbJaRvNoVkYbK59z0oE8ugUoWzsP8Bt4eQe1RUMtigAAAABJRU5ErkJggg=='
    }

    get_celadon_scimitar_png() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACMElEQVR4nO2Yv27TQACHPyOmu/X8BK4q71mylKkDU5FYKra+QiXUDgwVSyVg6MJLdKQTAxMIKUs2BivYD4AaiSy+1QyWE6dJL3Zsn6/I35izI3/+/e6PDAMDA/8pd7dZ349QhWfG0ScgYRYA5yXMArMYfk6cljALHB6Ar5yW2F2hglnspER1AXBSwjOOFg87i+F+nv/mq7xaACen5vst8LzW1b5aicB6Gj3J1BOATYme2f3WHtbIV6uxhyIfbqynUD2BovdlCZOMJXavQuVuF/uCQxWqtoxWkfAVXJ5bX2Kr7wOOJlFvI3NQop4AmCV6qFF9AXAqiWbrdnknLh83wNqesF8CBduSKLBUpfbe0raDH3SeRLMEyhRpWE6iPQHoRaK7eO9us406QeuVajeBMien3kYS0Hoa3QmAFYluBWBdYsu8CIKgkUz3ArCSgDWJ8XicCSEaSdgRgA2Jsz9/UUohpSRJkr0ntj0BWEqc/foNgFKKxWLR6C/tCgDj6xvm83xpTZIEKSVhGGb7Tuz6XyUaEARBlqYpAHEcI6VECMH06gJmMaPRaDkeRVGlWllNIEkST2vNZDLxoijy0jTlx6uXABx9+YoQAillfnHFRKxXqDxhoyjyuJ8TXlyhtQZACEH08T34Kq/WDnr/NFgQhmEmpWT65jUcHnD06TNaa9I0NdbJGYEll+fZ6Nt3hBAAaK2ZHr949AzlngCrNIQQ+Rx5+87J5zTSZGkdGBh4QvwDwDfdsHg0YEcAAAAASUVORK5CYII='
    }

    get_ember_staff_png() {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAFQUExUReVkPORmPOVkO+RpPu4yJ+NsP993ReViO+8PHe0yJvAAG+0zJvAFHOhTM+tGLu0sJfM+H+8jIO8gIfEAGe8RH/ZLH/I3IO4YIe4YIOw7Ku4gH+RqP/VJH/hVHvVMH/ZHH/EvH+8eIeFuP+JuQPAtIPlVHvlqHvp1H/VEH/VKH/ApIetELetFLe8XH/VGH/lWHvlnH/yeIflQHvlZHvI6IO8UH/I5IPlYHvlKHvuaIf23I/uQIflSHfMzHfI4IPlcHvqKIPypIv21I/yNHO0xJvAbHvdHHvuGIP24I/20I/+2IeerSO4lI/EuIPlhHvymIvy1Is+IH65pG69qHG4sEXY0GHMxFoZEJXYzF3w5HI1LKo1LK3g1GW8tEotJKnQyFnc1GZ1bOJhWM3w5HY5MK5dVMnEvFIpIKJtZNppYNZFPLpxZNodFJoE+IXs4HAAAAJiwptkAAABwdFJOU////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wC3YWLSAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGHRFWHRTb2Z0d2FyZQBQYWludC5ORVQgNS4xLjgbaeqoAAAAtmVYSWZJSSoACAAAAAUAGgEFAAEAAABKAAAAGwEFAAEAAABSAAAAKAEDAAEAAAACAAAAMQECABAAAABaAAAAaYcEAAEAAABqAAAAAAAAAGAAAAABAAAAYAAAAAEAAABQYWludC5ORVQgNS4xLjgAAwAAkAcABAAAADAyMzABoAMAAQAAAAEAAAAFoAQAAQAAAJQAAAAAAAAAAgABAAIABAAAAFI5OAACAAcABAAAADAxMDAAAAAAq4AhE1OeOCgAAAGcSURBVEhLzZPXcsIwEEVDKjHpvffeeyG99x7HIRiwgVDS9v/fItmLHYwkm7ecGZi7Gg7SruUSKBJboMlnRhGG4CM/LDUC/RJjCvgxcJGsI5WVV0BlFQl+s+Zh91AtBWpqaRAbpkCOUVff0NjUbFRCTIH8aaClta29oxO6jAU+1pG6pZ7evv4B/yDWPHLC0LA0Mjo2PjE5hQs8csL0zOzc/MLi0vIKLvCgAp28tLq2vrEZ3NreMZb5GDvQQUq7e/sHh8EjWouwhOOT07Pzi8srWovI9QBwfXN7d//wiBUXWzB5esbAwynI8gsmDk4BFOU1hJFJgQBvsoyJSaEAYTWCiQVDgKiocZYQCsUwMWAJoKkqpkKYgq6q3D2YAsS1IgVd13iTYgugJ6IaRgccAfSwyn4cPIE8P01jbcIXIJlgTVcgkGvFOJVQINcKg42LUGiIBYgqzsZdhHcllsKIuAiQTKcSeS+UmxDXM3LeqNwEgEw27165C5D9+Nu4B+FT0f4M14MA8PWNgeBJgPQPBs9CxOrbmwBFCzb/TgD4BW1XwpoSy4PIAAAAAElFTkSuQmCC'
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
                .full-size {
                    cursor: ${cursorName};
                }
                .full-size:hover {
                    cursor: ${cursorName};
                }
            `;
            document.head.appendChild(style);
        }
    }

    set_cursor() {
        this.addCSSStyles(`${this.get_cursor_url()}, ${this.settings.cursorOffset.value || 'auto'}`);
    }

    reset_cursor() {
        this.clear_cursor();
        this.set_cursor();
    }

    clear_cursor() {
        this.addCSSStyles();
    }
}

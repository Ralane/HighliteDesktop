import { Plugin } from '../core/interfaces/highlite/plugin/plugin.class';
import { SettingsTypes } from '../core/interfaces/highlite/plugin/pluginSettings.interface';

export class BankTabs extends Plugin {
    pluginName = 'Bank Tabs';
    author = '0rangeYouGlad';

    private tabBox: HTMLElement | null = null;
    private resizeListener: (() => void) | null = null;
    private lastQuery: [string] = ['*'];
    private selectedTab = 'All';

    constructor() {
        super();

        this.settings.memory = {
            text: 'Remember selected tab between banking session',
            type: SettingsTypes.checkbox,
            value: false,
            callback: () => {},
        }

        this.settings.tabGroups = {
            text: `Tab Groups ({tabName1: ['item1', 'item2'], tabName2: ['item1', 'item2']} (accepts both item IDs and item names)`,
            type: SettingsTypes.text,
            value: `{
   "All":[
      "*"
   ],
   "Food":[
      "Baked Potato",
      "Carrot",
      "Clownfish",
      "Rodent Meat",
      "Bass",
      "Bluegill",
      "Chicken",
      "Grilled Corn",
      "Steak",
      "Game Meat",
      "Half Glass Of Calcium Brew",
      "Half Glass Of Giant's Milk",
      "Salmon",
      "Carp",
      "Piranha",
      "Stingray",
      "Koi",
      "Walleye",
      "Calcium Brew",
      "Crab",
      "Giant's Milk",
      "Frog",
      "Tuna",
      "Marlin",
      "Turtle",
      "Whaleshark",
      "Octopus"
   ]
}`,
            callback: () => {},
        }
    }

    start(): void {
        if (!this.settings.enable.value) {
            return;
        }
        this.injectTabBox();
        this.updateTabBoxVisibility();
        this.injectSearchBox();
        this.updateSearchBoxVisibility();
    }

    init(): void {
    }

    stop(): void {
        this.destroy();
    }

    BankUIManager_showBankMenu() {
        if (!this.settings.enable.value) {
            return;
        }
        this.injectTabBox();
        this.updateTabBoxVisibility();
        this.injectSearchBox();
        this.updateSearchBoxVisibility();

        const mainPlayer = document.highlite?.gameHooks?.EntityManager?.Instance?.MainPlayer;
        const bankStorage = mainPlayer.BankStorageItems;

        if (mainPlayer && bankStorage) {
            bankStorage.OnInventoryChangeListener.add(this.updateTab.bind(this));
            bankStorage.OnReorganizedItemsListener.add(this.updateTab.bind(this));
        }
    }

    
    updateSearchBoxVisibility() {
        const bankMenu = document.getElementById('hs-bank-menu');
        if (!bankMenu) {
            this.removeSearchBox();
            return;
        }

        // Check if bank is visible
        const isVisible = this.isBankVisible(bankMenu);

        if (isVisible && !this.searchBox) {
            this.injectSearchBox();
        } else if (!isVisible && this.searchBox) {
            this.removeSearchBox();
        }
    }

    // In removeSearchBox, just remove from DOM (header) and cleanup
    removeSearchBox() {
        const existingSearchBoxes = document.querySelectorAll('#bank-tab-edit-box');
        existingSearchBoxes.forEach(box => box.remove());
        this.searchBox = null;
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
            this.resizeListener = null;
        }
    }

    injectSearchBox() {
        // Prevent duplicate injection - check both internal reference and DOM presence
        if (this.searchBox || document.getElementById('bank-tab-edit-box'))
            return;

        // Find the bank menu and header
        const bankMenu = document.getElementById('hs-bank-menu');
        if (!bankMenu) return;
        const header = bankMenu.querySelector('.hs-menu-header');
        if (!header) return;

        // Create the search box container
        const searchContainer = document.createElement('div');
        searchContainer.id = 'bank-tab-edit-box';
        searchContainer.classList.add('bank-tab-edit-container');
        searchContainer.style.marginLeft = 'auto'; // Remove left margin
        this.searchBox = searchContainer;

        // Create the input
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Add/Remove Tab';
        input.classList.add('bank-tab-edit-input');
        input.classList.add('hs-text-input');
        input.style.width = '160px'; // Slightly more compact
        input.style.outline = 'none';
        input.style.marginRight = '8px'; // Small space between input and close button
        // input.value = this.settings.memory.value ? this.lastQuery : '';

        // Prevent game from processing keystrokes while typing
        input.addEventListener('keydown', e => e.stopPropagation());
        input.addEventListener('keyup', e => e.stopPropagation());
        input.addEventListener('keypress', e => {
            e.stopPropagation();

            if(e.key === 'Enter') {

                if(!input.value) {
                    return;
                }
                
                let tabJsonNew = JSON.parse(`${this.settings.tabGroups.value}`);

                if(Object.keys(tabJsonNew).includes(input.value)) {
                    tabJsonNew[input.value] = undefined;
                } else {
                    tabJsonNew[input.value] = [];
                }

                this.settings.tabGroups!.value = JSON.stringify(tabJsonNew);
                input.value = "";

                            // const query = input.value.trim().toLowerCase();
            // this.lastQuery = query; // Store the last query
            // this.highlightBankQuery(query);

              this.settings.tabGroups!.value = JSON.stringify(tabJsonNew);

              this.removeTabBox();
              this.injectTabBox();

                                      document.highlite.managers.SettingsManager.updatePluginSettingsUI(
                            this
                        );

            }
        });

        // Add focus styling and prevent focus stealing (matching other plugins)
        input.addEventListener('focus', e => {
            e.preventDefault();
            e.stopPropagation();
        });

        // Prevent focus stealing on mousedown
        searchContainer.addEventListener('mousedown', e => {
            e.preventDefault();
            e.stopPropagation();
            input.focus();
        });

        searchContainer.appendChild(input);

        // Insert the search bar immediately before the close button
        const closeBtn = header.querySelector('button');
        if (closeBtn) {
            header.insertBefore(searchContainer, closeBtn);
        } else {
            header.appendChild(searchContainer);
        }

        // Add highlight style if not present
        if (!document.getElementById('bank-helper-highlight-style')) {
            const style = document.createElement('style');
            style.id = 'bank-helper-highlight-style';
            style.textContent = `
        .bank-tab-edit-container {
          padding: 0px;
        }
        .bank-tab-edit-input {
          padding: 6px 10px;
          color: #fff;
          font-size: 14px;
        }
        .bank-helper-greyed-out {
          opacity: 0.3 !important;
          filter: grayscale(100%) !important;
          transition: opacity 0.2s, filter 0.2s;
        }
      `;
            document.head.appendChild(style);
        }
    }
    
    BankUIManager_handleCenterMenuWillBeRemoved() {
        this.destroy();
    }

    updateTab() {
        this.highlightBankQuery(this.lastQuery)
    }

    updateTabBoxVisibility() {
        const bankMenu = document.getElementById('hs-bank-menu');
        if (!bankMenu) {
            this.removeTabBox();
            return;
        }

        // Check if bank is visible
        const isVisible = this.isBankVisible(bankMenu);

        if (isVisible && !this.tax) {
            this.injectTabBox();
        } else if (!isVisible && this.tabBox) {
            this.removeTabBox();
        }
    }

    isBankVisible(bankMenu: HTMLElement): boolean {
        // Check if the bank menu is visible
        const style = window.getComputedStyle(bankMenu);
        if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
        }

        // Check if parent containers are visible
        let parent = bankMenu.parentElement;
        while (parent) {
            const parentStyle = window.getComputedStyle(parent);
            if (
                parentStyle.display === 'none' ||
                parentStyle.visibility === 'hidden'
            ) {
                return false;
            }
            parent = parent.parentElement;
        }

        // Check if bank menu has any content (indicating it's actually open)
        const hasItems = bankMenu.querySelectorAll('[data-slot]').length > 0;
        return hasItems;
    }

    injectTabBox() {
        // Prevent duplicate injection - check both internal reference and DOM presence
        if (this.tabBox || document.getElementById('bank-tabs'))
            return;

        // Find the bank menu and header
        const bankMenu = document.getElementById('hs-bank-menu');
        if (!bankMenu) return;

        const mainBankItemsBox = document.getElementById('hs-bank-menu__content-container')
        if (!mainBankItemsBox) return;

        // Add highlight style if not present
        if (!document.getElementById('bank-tabs-highlight-style')) {
            const style = document.createElement('style');
            style.id = 'bank-tabs-highlight-style';
            style.textContent = `

/* Style the buttons that are used to open the tab content */
.bank-tab-button {
  float: left;
  // border: solid 2px;
  // border-color: rgb(188, 188, 188);
  padding: 14px 16px;
  transition: 0.3s;
  background-color: rgb(130, 130, 130);
  width: min-content;
}

/* Change background color of buttons on hover */
.bank-tab-button:hover {
  background-color: rgb(170, 170, 170);
  // border: solid 2px;
  // border-color: rgb(211, 211, 211);
}

.bank-tab-button.dragover {
  background-color: purple;
}

/* Create an active/current tablink class */
.active {
  background-color: rgb(180, 180, 200) !important;
  // border: solid 2px !important;
  // border-color: rgb(222, 222, 222) !important;
}
      `;
            document.head.appendChild(style);
        }


        // Create the tab container
        const tabBox = document.createElement('div');
        tabBox.id = 'bank-tabs';
        tabBox.style.display = 'flex';
        tabBox.style.flexWrap = 'wrap';
        tabBox.classList.add('bank-tabs-container');
        this.tabBox = tabBox;

        let tabJson = JSON.parse(`${this.settings.tabGroups.value}`);

        if(!Object.keys(tabJson).includes('All')) {
            this.log("Bank Tabs: Inserted All tab");
            tabJson = {All: ['*'], ...tabJson};
        }

        Object.keys(tabJson).forEach((key) => {
            // Create the tab buttons
            const input = document.createElement('input');
            // const iconSlot = 11 + i;
            // input.innerHTML = `<div id="hs-inventory-item--${iconSlot}" class="hs-inventory-item" draggable="false"><div class="hs-inventory-item__image" style="display: block;padding:24px"></div></div>Tab ${i}`;
            input.value = `${key.trim()}`;
            input.style.flex = 'flex-grow';
            input.id = `bank-tab-id-${key.trim()}`;
            input.maxLength = 0;
            input.size = 1;
            input.classList.add('bank-tab-button');
            input.classList.add('hs-text--white');
            // input.classList.add('hs-text-button hs-text-button-with-bg')

            if(this.settings.memory.value) {
                if(key === this.selectedTab)
                    input.classList.add('active');
            } else {
                if(key === 'All') {
                    input.classList.add('active');
                }
            }


            tabBox.appendChild(input);

            
            // Input event
            input.addEventListener('click', e => {
                this.log(`Bank Tab selected: ${key}`)
                let tabJsonNew = JSON.parse(`${this.settings.tabGroups.value}`);

                const query = tabJsonNew[key];
                this.lastQuery = query; // Store the last query
                this.highlightBankQuery(query);
                this.selectedTab = key;

                let allTabs = document.getElementsByClassName("bank-tab-button");
                for (let b = 0; b < allTabs.length; b++) {
                    if(allTabs[b].id === `bank-tab-id-${this.selectedTab.trim()}`) {
                        allTabs[b].className = `${allTabs[b].className} active`;
                    } else {
                        allTabs[b].className = allTabs[b].className.replaceAll(" active", "");
                    }
                }
            });

            input.addEventListener("drop", (event) => {
            // prevent default action (open as link for some elements)
            event.preventDefault();
            // this.log(event);
              const data = event.dataTransfer?.getData("text");
                // this.log(data);

                        // Get bank items from the game data
        const bankItems =
            document.highlite?.gameHooks?.EntityManager?.Instance?.MainPlayer
                ?._bankItems?.Items || [];

                const itemElement = document.getElementById(data);


                         const bankItem = bankItems[Number(itemElement?.parentElement?.getAttribute('data-slot'))];
            if (!bankItem) {
                return;
            }

            // Get item definition
            const itemDef = document.highlite?.gameHooks?.ItemDefMap?.ItemDefMap
                ?.get
                ? document.highlite.gameHooks.ItemDefMap.ItemDefMap.get(
                      bankItem._id
                  )
                : null;

                const itemId = bankItem._id;
            const itemName = itemDef
                ? itemDef._nameCapitalized ||
                  itemDef._name ||
                  `Item ${bankItem._id}`
                : `Item ${bankItem._id}`;

                this.log(`Dragged ${itemName} ID ${itemId} to tab ${key}`);

                let tabJsonTmp = JSON.parse(`${this.settings.tabGroups.value}`);

                Object.keys(tabJsonTmp).forEach((allKey) => {
                    let index = tabJsonTmp[allKey].indexOf(`${itemId}`);
                    if (index > -1) {
                        this.log(`Removed ${itemName} ID ${itemId} from tab ${allKey}`);
                        tabJsonTmp[allKey].splice(index, 1);
                    }

                    index = tabJsonTmp[allKey].indexOf(`${itemName}`);
                    if (index > -1) {
                        this.log(`Removed ${itemName} ID ${itemId} from tab ${allKey}`);
                        tabJsonTmp[allKey].splice(index, 1);
                    }

                })
                
                tabJsonTmp[key] = [...(tabJsonTmp[key]), itemName];

                // this.log("New JSON: " + JSON.stringify(tabJsonTmp));

                this.settings.tabGroups!.value = JSON.stringify(tabJsonTmp);

                const query = tabJsonTmp[this.selectedTab];
                this.lastQuery = query; // Store the last query
                this.highlightBankQuery(query);
                    document.highlite.managers.SettingsManager.updatePluginSettingsUI(
                        this
                    );                    
            });


        });


        // Insert the tab box immediately before the close button
        if (bankMenu) {
            bankMenu.insertBefore(tabBox, mainBankItemsBox);
        }

        // If there is a last query, immediately highlight
        if (this.lastQuery) {
            this.highlightBankQuery(this.lastQuery);
        }
    }

    // In removeTabBox, just remove from DOM (header) and cleanup
    removeTabBox() {
        const existingTabBoxes = document.querySelectorAll('#bank-tabs');
        existingTabBoxes.forEach(box => box.remove());
        this.tabBox = null;
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
            this.resizeListener = null;
        }
    }

    highlightBankQuery(query: [string]) {
        // Get bank items from the game data
        const bankItems =
            document.highlite?.gameHooks?.EntityManager?.Instance?.MainPlayer
                ?._bankItems?.Items || [];

        // Find all bank item elements by data-slot attribute
        const bankMenu = document.getElementById('hs-bank-menu');
        if (!bankMenu) return;

        // Query all elements with data-slot attribute
        const itemElements = Array.from(
            bankMenu.querySelectorAll('[data-slot]')
        );

        // If query is *, show all items
        if (query && query.some((s) => s === '*')) {
            itemElements.forEach(el => {
                (el as HTMLElement).style.display = '';
            });
            return;
        }

        // Loop through all itemElements (slots)
        itemElements.forEach((el, i) => {
            const bankItem = bankItems[i];
            if (!bankItem) {
                // No item in this slot, always hide when searching
                (el as HTMLElement).style.display = 'none';
                return;
            }

            // Get item definition
            const itemDef = document.highlite?.gameHooks?.ItemDefMap?.ItemDefMap
                ?.get
                ? document.highlite.gameHooks.ItemDefMap.ItemDefMap.get(
                      bankItem._id
                  )
                : null;

            const itemName = itemDef
                ? itemDef._nameCapitalized ||
                  itemDef._name ||
                  `Item ${bankItem._id}`
                : `Item ${bankItem._id}`;

            if (query.some((q) => itemName.toLowerCase() === q.trim().toLowerCase() || `${itemDef._id}` === q.trim().toLowerCase())) {
                (el as HTMLElement).style.display = '';
            } else {
                (el as HTMLElement).style.display = 'none';
            }
        });
    }

    // Cleanup method
    destroy(): void {
        const mainPlayer = document.highlite?.gameHooks?.EntityManager?.Instance?.MainPlayer;
        const bankStorage = mainPlayer.BankStorageItems;

        if (mainPlayer && bankStorage) {
            bankStorage.OnInventoryChangeListener.remove(this.updateTab);
            bankStorage.OnReorganizedItemsListener.remove(this.updateTab);
        }
      
        if (!this.settings.memory.value) {
            this.lastQuery = ['*'];
        }

        // Find all bank item elements by data-slot attribute
        const bankMenu = document.getElementById('hs-bank-menu');
        if (!bankMenu) return;

        // Query all elements with data-slot attribute
        const itemElements = Array.from(
            bankMenu.querySelectorAll('[data-slot]')
        );

        itemElements.forEach(el => {
            (el as HTMLElement).style.display = ''; // Ensure all items are visible on destroy
        });

        this.removeTabBox();

        // Ensure resize listener is removed
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
            this.resizeListener = null;
        }
    }
}

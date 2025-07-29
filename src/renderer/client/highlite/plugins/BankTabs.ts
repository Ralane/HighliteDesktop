import { Plugin } from '../core/interfaces/highlite/plugin/plugin.class';
import { SettingsTypes } from '../core/interfaces/highlite/plugin/pluginSettings.interface';

export class BankTabs extends Plugin {
    pluginName = 'Bank Tabs';
    author = '0rangeYouGlad';

    private tabBox: HTMLElement | null = null;
    private resizeListener: (() => void) | null = null;
    private lastQuery: string = '';
    private tabCount = 8;
    private selectedTab = 0;

    constructor() {
        super();

        this.settings.memory = {
            text: 'Remember selected tab between banking session',
            type: SettingsTypes.checkbox,
            value: false,
            callback: () => {},
        }
    }

    start(): void {
        if (!this.settings.enable.value) {
            return;
        }
        this.injectTabBox();
        this.updateTabBoxVisibility();
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

        const mainPlayer = document.highlite?.gameHooks?.EntityManager?.Instance?.MainPlayer;
        const bankStorage = mainPlayer.BankStorageItems;

        if (mainPlayer && bankStorage) {
            bankStorage.OnInventoryChangeListener.add(this.updateTab.bind(this));
            bankStorage.OnReorganizedItemsListener.add(this.updateTab.bind(this));
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
}

/* Change background color of buttons on hover */
.bank-tab-button:hover {
  background-color: rgb(170, 170, 170);
  // border: solid 2px;
  // border-color: rgb(211, 211, 211);
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

        for (let i = 0; i < this.tabCount; i++) {
            // Create the tab buttons
            const input = document.createElement('button');
            // const iconSlot = 11 + i;
            // input.innerHTML = `<div id="hs-inventory-item--${iconSlot}" class="hs-inventory-item" draggable="false"><div class="hs-inventory-item__image" style="display: block;padding:24px"></div></div>Tab ${i}`;
            input.innerHTML = `Tab ${i}`;
            input.style.flex = 'flex-grow';
            input.classList.add('bank-tab-button');
            input.classList.add('hs-text--white');
            // input.classList.add('hs-text-button hs-text-button-with-bg')

            if(this.settings.memory.value) {
                if(i === this.selectedTab)
                    input.classList.add('active');
            } else {
                if(i === 0) {
                    input.classList.add('active');
                }
            }


            tabBox.appendChild(input);

            
            // Input event
            input.addEventListener('click', e => {
                this.log(`Bank Tab selected: ${i}`)
                const query = input.value.trim().toLowerCase();
                this.lastQuery = query; // Store the last query
                this.highlightBankQuery(query);
                this.selectedTab = i;

                let allTabs = document.getElementsByClassName("bank-tab-button");
                for (let b = 0; b < allTabs.length; b++) {
                    if(b === i) {
                        allTabs[b].className = `${allTabs[b].className} active`;
                    } else {
                        allTabs[b].className = allTabs[b].className.replace(" active", "");
                    }
                }
            });
        }


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

    highlightBankQuery(query) {
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

        // If query is empty, show all items
        if (!query) {
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

            if (itemName.toLowerCase().includes(query)) {
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
            this.lastQuery = '';
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

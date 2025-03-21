customElements.define(
    'var-dump',

    class extends HTMLElement {
        constructor() {
            super();

            const shadow = this.attachShadow({ mode: "open" });
            shadow.innerHTML = `
            <style>
                :host slot {
                    display: block;
                    white-space: pre;
                    font-size: inherit;
                    background: #F9F9F9;
                    padding: 10px;
                    border-radius: 3px;
                    font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace !important;
                }
            </style>
            <slot></slot>
            `

            this.html = null;
            this.file = null;
            this.line = null;
            this.uid = Date.now().toString(36) + Math.random().toString(36).substr(2, 10);
        }

        connectedCallback() {
            this.html = this.innerHTML;
            if (this.getAttribute("file")) this.file = this.getAttribute("file");
            if (this.getAttribute("line")) this.line = this.getAttribute("line");

            if (!window.myDebug) {
                throw Error("Nie dodano jako pierwszego komponentu <debug-show>");
            }
            window.myDebug.push(this);
        }

        disconnectedCallback() {
            if (window.myDebug) {
                const index = window.myDebug.find(el => el === this);
                window.myDebug.splice(index, 1);
            }
        }
    }
);

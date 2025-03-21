customElements.define(
    'debug-show',

    class extends HTMLElement {
        constructor() {
            super();

            this.attachShadow({ mode: 'open' });
            this.DOM = {};
            this.data = [];
            this.dataCollapse = new Map();
            this.createDebug();
        }

        createDebug() {
            const style = document.createElement("style");
            style.textContent = `
                .my-debug {
                    --color: #03a6ff;
                    box-sizing: border-box;
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    color: #000;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-family: sans-serif;
                }
                .my-debug [hidden] {
                    display: none;
                }
                .my-debug.is-show {
                    .my-debug-body {
                        display: block;
                    }
                    .my-debug-search-input {
                        display: block;
                    }
                }
                .my-debug-mark {
                    background: gold;
                    font-weight: bold;
                }
                .my-debug-header {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 13px;
                }
                .my-debug-search-input {
                    display: none;
                    height: 35px;
                    max-width: 302px;
                    flex: 1;
                    box-sizing: border-box;
                    border: 1px solid #D4D4D4;
                    border-radius: 4px;
                    background: #fff;
                    padding: 0 10px;
                    font-family: sans-serif;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23444' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m18 11l-6-6'/%3E%3C/svg%3E");
                    background-size: 16px;
                    background-position: 5px center;
                    background-repeat: no-repeat;
                    padding-left: 25px;
                    font-size: 14px;
                    outline: none;

                    &::placeholder {
                        opacity: 0.5;
                    }
                }
                .my-debug-toggle {
                    width: 35px;
                    height: 35px;
                    border: 0;
                    position: relative;
                    border: 0;
                    background: var(--color);
                    border-radius: 3px;
                    box-shadow: 0 2px 3px -2px rgba(0 0 0 / 0.2);
                    cursor: pointer;
                }
                .my-debug-toggle span {
                    display: none;
                }
                .my-debug-count {
                    position: absolute;
                    left: 0;
                    top: 0;
                    translate: -50% -50%;
                    border-radius: 10px;
                    font-size: 9px;
                    font-weight: bold;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: #000;
                    color: #fff;
                    min-height: 15px;
                    min-width: 15px;
                    box-shadow: 0 2px 3px -2px rgba(0 0 0 / 0.4);
                }
                .my-debug-toggle::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3C!-- Icon from All by undefined - undefined --%3E%3Cpath fill='currentColor' d='M4.47 21h15.06c1.54 0 2.5-1.67 1.73-3L13.73 4.99c-.77-1.33-2.69-1.33-3.46 0L2.74 18c-.77 1.33.19 3 1.73 3M12 14c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1m1 4h-2v-2h2z'/%3E%3C/svg%3E");
                    mask-position: center;
                    mask-repeat: no-repeat;
                    mask-size: 16px;
                    background-color: #fff;
                }
                .my-debug-body {
                    display: none;
                    background: #fff;
                    border-radius: 3px;
                    padding: 20px;
                    box-shadow: 0 2px 3px -2px rgba(0 0 0 / 0.4);
                    border: 1px solid #D4D4D4;
                    max-width: calc(100vw - 90px);
                    max-height: calc(100vh - 130px);
                    overflow: auto;
                    min-width: 300px;
                }
                .my-debug-body-inner {
                }
                .my-debug-el-empty {
                    text-align: center;
                    border-radius: 3px;
                    padding: 10px;
                    font-size: 12px;
                }

                .my-debug-el {
                    font-family: sans-serif;
                    border-left: 5px solid var(--color);
                    border-radius: 5px;
                    padding-right: 20px;
                }
                .my-debug-el + .my-debug-el {
                    margin-top: 10px;
                }
                .my-debug-el.is-collapse {
                    .my-debug-el-body > div {
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .my-debug-el-toggle {
                        scale: 1 -1;
                    }
                }
                .my-debug-el-header {
                    display: flex;
                    align-items: center;
                    white-space: nowrap;
                    gap: 10px;
                    padding: 5px 10px;
                    background: #eee;
                    font-size: 12px;
                    margin-right: -20px;
                    border-radius: 0 5px 0 0;
                }
                .my-debug-el-toggle {
                    width: 20px;
                    height: 20px;
                    background: none;
                    cursor: pointer;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3C!-- Icon from All by undefined - undefined --%3E%3Cpath fill='currentColor' d='m12 10.8l-4.6 4.6L6 14l6-6l6 6l-1.4 1.4z'/%3E%3C/svg%3E");
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 15px;
                    border: 0;
                }
                .my-debug-el-copy {
                    margin-left: auto;
                    width: 20px;
                    height: 20px;
                    margin-left: auto;
                    background: none;
                    cursor: pointer;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3C!-- Icon from All by undefined - undefined --%3E%3Cpath fill='currentColor' d='M19 19H8q-.825 0-1.412-.587T6 17V3q0-.825.588-1.412T8 1h7l6 6v10q0 .825-.587 1.413T19 19M14 8V3H8v14h11V8zM4 23q-.825 0-1.412-.587T2 21V7h2v14h11v2zM8 3v5zv14z'/%3E%3C/svg%3E");
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: 15px;
                    border: 0;
                    position: relative;
                }
                .my-debug-el-copy-info {
                    display: inline-block;
                    padding: 2px 5px;
                    background: #000;
                    color: #fff;
                    font-size: 9px;
                    position: absolute;
                    right: calc(100% + 6px);
                    border-radius: 2px;
                    top: 50%;
                    translate: 0 -50%;

                    &::before {
                        content: "";
                        width: 4px;
                        height: 6px;
                        background: inherit;
                        color: inherit;
                        clip-path: polygon(0 0, 100% 50%, 0 100%);
                        position: absolute;
                        right: 0;
                        top: 50%;
                        translate: 100% -50%;
                    }
                }
                .my-debug-el-header-nr {
                    font-size: 14px;
                    font-weight: 900;
                }
                .my-debug-el-header-text {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    max-width: 400px;
                }
                .my-debug-el-body {
                    white-space: pre;
                    font-family: ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace !important;
                    padding: 10px;
                    font-size: 12px;
                    display: grid;
                    background: #fafafa;
                    grid-template-columns: 1fr;
                    border-radius: 0 0 4px 4px;
                    margin-right: -20px;
                    padding-right: 30px;
                    overflow-x: auto;
                }
            `;
            document.body.append(style);

            const debug = document.createElement("div");
            debug.classList.add("my-debug");
            this.DOM.debug = debug;
            document.body.append(this.DOM.debug);

            const header = document.createElement("div");
            header.classList.add("my-debug-header");
            debug.append(header);

            let get = this.getStorage();
            localStorage.setItem("my-debuger", get);

            this.showDebugger(get)

            {
                const el = document.createElement("button");
                el.classList.add("my-debug-toggle");
                el.innerHTML = "<span>Włącz</span>";
                el.onclick = () => {
                    let get = this.getStorage();
                    this.showDebugger(!get);
                }
                this.DOM.toggle = el;
                header.append(el);
            }

            {
                const input = document.createElement("input");
                input.classList.add("my-debug-search-input");
                input.placeholder = "Szukaj";
                input.oninput = this.filterDebug.bind(this);
                header.append(input);
                this.DOM.input = input;
            }

            {
                const el = document.createElement("div");
                el.classList.add("my-debug-count");
                this.DOM.toggle.append(el);
                this.DOM.count = el;
            }

            {
                const el = document.createElement("div");
                el.classList.add("my-debug-body");
                const inner = document.createElement("div");
                inner.classList.add("my-debug-body-inner");
                el.append(inner);

                this.DOM.body = inner;
                this.DOM.debug.append(el);
            }
        }

        copyTextToClipboard(text) {
            function fallbackCopyTextToClipboard(text) {
                var textArea = document.createElement("textarea");
                textArea.value = text;

                // Avoid scrolling to bottom
                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                try {
                  var successful = document.execCommand('copy');
                  var msg = successful ? 'successful' : 'unsuccessful';
                  console.log('Fallback: Copying text command was ' + msg);
                } catch (err) {
                  console.error('Fallback: Oops, unable to copy', err);
                }

                document.body.removeChild(textArea);
            }

            if (!navigator.clipboard) {
                fallbackCopyTextToClipboard(text);
                return;
            }
            navigator.clipboard.writeText(text).then(function() {
                console.log('Async: Copying to clipboard was successful!');
            }, function(err) {
                console.error('Async: Could not copy text: ', err);
            });
        }

        getStorage() {
            let get = localStorage.getItem("my-debuger");
            let state = get !== null ? JSON.parse(get) : false;
            return state;
        }

        showDebugger(visible) {
            localStorage.setItem("my-debuger", visible);
            this.DOM.debug.classList.toggle("is-show", visible);
        }

        renderDebug(target, prop, value) {
            if (!this.DOM) return;

            this.DOM.body.innerHTML = '';

            let renderCount = 0;
            this.data.forEach((el, i) => {
                const div = document.createElement("div");
                div.classList.add("my-debug-el");
                div.hidden = el.hidden;

                let ob = this.dataCollapse.get(el.uid);
                if (ob.collapse) {
                    div.classList.add("is-collapse");
                }

                if (!el.hidden) renderCount++;

                let html = el.html.trim();
                if (this.DOM.input.value) {
                    html = el.html.trim().replaceAll(this.DOM.input.value, '<b class="my-debug-mark">$&</b>');
                }

                let file = null;
                if (this.DOM.input.value && el.file !== null) {
                    file = el.file.trim().replaceAll(this.DOM.input.value, '<b class="my-debug-mark">$&</b>');
                }

                div.innerHTML = `<div class="my-debug-el-header">
                        <div class="my-debug-el-header-text">${file ? `file: <b title="${el.file}">${file}</b>` : ``}</div>
                        <div class="my-debug-el-header-text">${el.line ? `line: <b title="${el.line}">${el.line}</b>` : ``}</div>
                        <button class="my-debug-el-copy"></button>
                        <button class="my-debug-el-toggle"></button>
                    </div>
                    <div class="my-debug-el-body">
                        <div>${html}</div>
                    </div>
                `;

                {
                    const btn = div.querySelector(".my-debug-el-copy");
                    btn.onclick = () => {
                        this.copyTextToClipboard(div.querySelector(".my-debug-el-body > div").textContent);

                        btn.querySelector(".my-debug-el-copy-info")?.remove();
                        const text = document.createElement("div");
                        text.classList.add("my-debug-el-copy-info");
                        text.innerText = "Skopiowano";
                        btn.append(text);
                        setTimeout(() => text.remove(), 500);
                    }
                }

                {
                    const btn = div.querySelector(".my-debug-el-toggle");
                    btn.onclick = () => {
                        let ob = this.dataCollapse.get(el.uid);
                        ob.collapse = !ob.collapse;
                        div.classList.toggle("is-collapse", ob.collapse);
                    }
                }
                this.DOM.body.append(div);
            });

            if (this.data.length && !renderCount) {
                const empty = document.createElement("div");
                empty.classList.add("my-debug-el-empty");
                empty.innerText = "Brak wyników";
                this.DOM.body.append(empty);
            }

            this.DOM.count.innerText = window.myDebug.length;
        }

        filterDebug() {
            if (!this.DOM) return;
            const text = this.DOM.input.value.toLowerCase();

            this.data.forEach(el => {
                let hidden = true;
                if (text === "") {
                    hidden = false;
                } else {
                    if (el.file !== null && el.file.toLowerCase().includes(text)) hidden = false;
                    if (el.html !== null && el.html.toLowerCase().includes(text)) hidden = false;
                }
                el.hidden = hidden;
            })
            this.renderDebug()
        }

        updateData() {
            this.data = [];
            window.myDebug.forEach((el, i) => {
                this.data.push({
                    file : el.file,
                    line: el.line,
                    html : el.html,
                    uid : el.uid,
                })

                if (!this.dataCollapse.has(el.uid)) {
                    this.dataCollapse.set(el.uid, {key : el.uid, collapse : false});
                }
            });

            //dany element moze byc usuniety, wtedy nie ma sensu trzymac w dataCollapse informacji o jego zwinieciu
            const validKeys = new Set(this.data.map(item => item.uid));
            for (const key of this.dataCollapse.keys()) {
                if (!validKeys.has(key)) {
                    this.dataCollapse.delete(key);
                }
            }
        }

        connectedCallback() {
            function createObservableArray(arr, callback) {
                return new Proxy(arr, {
                    set(target, property, value) {
                        target[property] = value; // Normalnie ustaw wartość
                        callback(target, property, value); // Wywołaj callback
                        return true;
                    }
                });
            }

            window.myDebug = createObservableArray([], (target, prop, value) => {
                this.updateData();
                this.filterDebug();
                this.renderDebug()
            });
        }
    }
);

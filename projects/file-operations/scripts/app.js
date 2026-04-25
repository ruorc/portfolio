const isSupported = 'showOpenFilePicker' in window;

const suggestedName = 'untitled.txt';
const FILE_OPTS = {
    types: [
        { description: 'Text Documents', accept: { 'text/plain': ['.txt', '.log'] } },
        { description: 'Markdown', accept: { 'text/markdown': ['.md'] } },
    ],
    excludeAcceptAllOption: true, 
    multiple: false
};

let fileHandle = null;
let lastSavedContent = '';

// DOM Elements
const el = {
    btnNew: document.getElementById('btnNew'),
    btnOpen: document.getElementById('btnOpen'),
    btnSave: document.getElementById('btnSave'),
    btnSaveAs: document.getElementById('btnSaveAs'),
    btnUnload: document.getElementById('btnUnload'),
    btnClear: document.getElementById('btnClear'),
    editor: document.getElementById('editor'),
    fileName: document.getElementById('fileName')
};

// Dialog box
const confirmDialog = document.getElementById('confirmDialog');
const dialogMessage = document.getElementById('dialogMessage');
const dialogConfirm = document.getElementById('dialogConfirm');
const dialogCancel = document.getElementById('dialogCancel');

function askUser(message) {
    return new Promise((resolve) => {
        dialogMessage.textContent = message;
        confirmDialog.showModal();

        const handleConfirm = () => {
            confirmDialog.close();
            cleanup();
            resolve(true);
        };

        const handleCancel = () => {
            confirmDialog.close();
            cleanup();
            resolve(false);
        };

        const cleanup = () => {
            dialogConfirm.removeEventListener('click', handleConfirm);
            dialogCancel.removeEventListener('click', handleCancel);
        };

        dialogConfirm.addEventListener('click', handleConfirm);
        dialogCancel.addEventListener('click', handleCancel);
    });
}

// UI Logic
const updateUI = () => {
    const content = el.editor.value;
    const isChanged = content !== lastSavedContent;
    const hasFile = fileHandle !== null;
    const hasContent = content.length > 0;

    let name = 'Legacy Mode (Downloads)';

    if (hasFile) {
        name = fileHandle.name;
    } else if (isSupported) {
        name = 'No file selected';
    }
    el.fileName.textContent = isChanged ? `Current File: ${name} * (unsaved changes)` : `Current File: ${name}`;

    // Buttons state
    el.btnNew.disabled = !isSupported && !hasContent;
    el.btnSave.disabled = isSupported ? (!hasFile || !isChanged) : !hasFile;
    el.btnSaveAs.disabled = isSupported ? (!isChanged && !hasFile) : !hasContent;
    el.btnUnload.disabled = !hasFile;
    el.btnClear.disabled = !hasContent;

    // Tooltips
    el.btnSave.title = el.btnSave.disabled ? "No changes to save" : "Ctrl + S";
    el.btnSaveAs.title = el.btnSaveAs.disabled ? "Type or open a file" : "Ctrl + Shift + S";
};

el.editor.addEventListener('input', updateUI);

// Actions
const actions = {
    async writeFile(handle, content) {
        const writable = await handle.createWritable();
        await writable.write(content);
        await writable.close();
    },

    async newFile() {
        if (el.editor.value !== lastSavedContent && !await askUser('Unsaved changes will be lost. Continue?')) return;
        
        if (isSupported) {
            try {
                const handle = await window.showSaveFilePicker({ ...FILE_OPTS, suggestedName });
                await actions.writeFile(handle, '');
                fileHandle = handle;
                el.editor.value = '';
                lastSavedContent = '';
            } catch (e) { console.warn('New file cancelled'); }
        } else {
            el.editor.value = '';
            lastSavedContent = '';
            fileHandle = null;
        }
        
        updateUI();
        el.editor.focus();
    },

    async openFile() {
        if (el.editor.value !== lastSavedContent && !await askUser('Unsaved changes will be lost. Continue?')) return;

        if (isSupported) {
            try {
                [fileHandle] = await window.showOpenFilePicker(FILE_OPTS);
                const file = await fileHandle.getFile();
                lastSavedContent = await file.text();
                el.editor.value = lastSavedContent;
            } catch (e) { console.warn('Open cancelled'); }
        } else {
            // Fallback (Legacy)
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.txt,.md,.log';
            input.onchange = e => {
                const file = e.target.files[0];
                const reader = new FileReader();
                reader.onload = () => {
                    el.editor.value = reader.result;
                    lastSavedContent = reader.result;
                    el.fileName.textContent = `Current File: ${file.name} (Legacy)`;
                    updateUI();
                };
                reader.readAsText(file);
            };
            input.click();
        }
        
        updateUI();
        el.editor.focus();
    },

    async saveFile() {
        if (isSupported && fileHandle) {
            try {
                await actions.writeFile(fileHandle, el.editor.value);
                lastSavedContent = el.editor.value;
                updateUI();
            } catch (e) { alert('Save failed'); }
        } else {
            actions.saveAs(); // In legacy mode, Save always acts as Save As
        }
    },

    async saveAs() {
        if (isSupported) {
            try {
                const handle = await window.showSaveFilePicker({
                    ...FILE_OPTS,
                    suggestedName: fileHandle ? fileHandle.name : suggestedName
                });
                await actions.writeFile(handle, el.editor.value);
                fileHandle = handle;
                lastSavedContent = el.editor.value;
            } catch (e) { console.warn('Save As cancelled'); }
        } else {
            // Fallback: Download Link
            const blob = new Blob([el.editor.value], { type: 'text/plain' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = fileHandle ? fileHandle.name : 'document.txt';
            a.click();
            URL.revokeObjectURL(a.href);
            lastSavedContent = el.editor.value;
        }
        
        updateUI();
    }
};

// Listeners
el.btnNew.addEventListener('click', actions.newFile);
el.btnOpen.addEventListener('click', actions.openFile);
el.btnSave.addEventListener('click', actions.saveFile);
el.btnSaveAs.addEventListener('click', actions.saveAs);

el.btnUnload.addEventListener('click', async () => {
    if (el.editor.value !== lastSavedContent && !await askUser('Unsaved changes will be lost. Close anyway?')) return;
    
    fileHandle = null;
    el.editor.value = '';
    lastSavedContent = '';
    updateUI();
});

el.btnClear.addEventListener('click', async () => {
    if (fileHandle !== null && !await askUser('Clear editor screen? (Disk file stays safe)')) return;

    el.editor.value = '';
    updateUI();
    el.editor.focus();
});

// Shortcuts
const shortcuts = {
    // 'ctrl+n': actions.newFile,
    // 'ctrl+o': actions.openFile,
    'ctrl+s': () => !el.btnSave.disabled && actions.saveFile(),
    'ctrl+shift+s': () => !el.btnSaveAs.disabled && actions.saveAs(),
};

window.addEventListener('keydown', (e) => {
    const combo = [
        e.ctrlKey ? 'ctrl' : '',
        e.shiftKey ? 'shift' : '',
        e.key.toLowerCase()
    ].filter(Boolean).join('+');

    if (shortcuts[combo]) {
        e.preventDefault();
        shortcuts[combo]();
    }
});

// Initial Setup
if (!isSupported) {
    document.body.classList.add('is-legacy');

    const badge = document.createElement('div');
    badge.className = 'legacy-badge';
    badge.innerHTML = '⚠️ Legacy Mode'; 
    document.body.appendChild(badge);

    const warning = document.createElement('div');
    warning.className = 'support-warning';
    warning.innerHTML = `
        <strong>Browser Not Supported:</strong> 
        Saving will work via Downloads.
        Please use Chrome, Edge, or Opera for full functionality.
    `;
    document.body.prepend(warning);
}

updateUI();

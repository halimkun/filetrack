// utils/nestListFromIndent.ts

export function nestListFromIndent(htmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const rootList = doc.querySelector('ol, ul'); // Bisa ol atau ul

    if (!rootList) {
        console.warn('No <ol> or <ul> found in provided HTML.');
        return htmlString;
    }

    const newList = document.createElement(rootList.tagName.toLowerCase()) as HTMLOListElement | HTMLUListElement;
    const stack: { list: HTMLOListElement | HTMLUListElement; indent: number }[] = [
        { list: newList, indent: 0 }
    ];

    rootList.childNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const li = node as HTMLLIElement;
        if (li.tagName !== 'LI') return;

        // Cari indent
        const indentClass = Array.from(li.classList).find(cls => cls.startsWith('ql-indent-'));
        const indent = indentClass ? parseInt(indentClass.replace('ql-indent-', '')) : 0;

        // Bersihkan class ql-indent-* supaya rapi
        if (indentClass) {
            li.classList.remove(indentClass);
        }

        // Naik atau turun level nesting
        while (indent < stack[stack.length - 1].indent) {
            stack.pop();
        }

        if (indent > stack[stack.length - 1].indent) {
            // Bikin nested list baru
            const parentLi = stack[stack.length - 1].list.lastElementChild as HTMLLIElement;
            if (parentLi) {
                const nestedList = document.createElement(rootList.tagName.toLowerCase()) as HTMLOListElement | HTMLUListElement;
                parentLi.appendChild(nestedList);
                stack.push({ list: nestedList, indent });
            }
        }

        // Masukkan ke list sekarang
        stack[stack.length - 1].list.appendChild(li.cloneNode(true));
    });

    const wrapper = document.createElement('div');
    wrapper.appendChild(newList);
    return wrapper.innerHTML;
}

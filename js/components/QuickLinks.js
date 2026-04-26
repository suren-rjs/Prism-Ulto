export class QuickLinks {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.grid = document.getElementById('quickLinksGrid');
  }

  init() {
    this.render();
  }

  render() {
    const links = this.stateManager.get('links');
    this.grid.innerHTML = links.map(link => `
      <a href="${link.url}" class="link-minimal" target="_blank" title="${link.name}">
        ${link.icon ? `<span>${link.icon}</span>` : `<img src="https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64">`}
      </a>
    `).join('');
  }
}

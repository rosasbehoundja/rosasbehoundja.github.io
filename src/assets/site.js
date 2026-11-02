document.querySelectorAll('[data-tab-target]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[data-tab-target]').forEach(item => item.classList.toggle('is-active', item === tab));
    document.querySelectorAll('.tab-content[data-tab-group="publication"]').forEach(panel => panel.classList.toggle('is-active', '#' + panel.id === tab.dataset.tabTarget));
    updatePublicationToggle();
  });
});
if (location.hash === '#presentations') {
  document.querySelector('[data-tab-target="#presentations"]')?.click();
  document.querySelector('#publications')?.scrollIntoView();
}

document.querySelectorAll('.update-block').forEach(block => {
  block.addEventListener('click', () => {
    document.querySelectorAll('.update-block').forEach(item => item.classList.toggle('is-active', item === block));
    document.querySelectorAll('.update-details').forEach(panel => panel.classList.toggle('is-hidden', panel.id !== 'update-details-' + block.dataset.updateId));
  });
});

const publicationSection = document.querySelector('#collapsibleSection');
const publicationToggle = document.querySelector('#toggleButton');

function updatePublicationToggle() {
  if (!publicationSection || !publicationToggle) return;
  const hasOverflow = publicationSection.scrollHeight > 700;
  publicationToggle.hidden = !hasOverflow;
  if (!hasOverflow) publicationSection.classList.remove('expanded');
  publicationToggle.textContent = publicationSection.classList.contains('expanded') ? 'Show less' : 'Show more';
}

publicationToggle?.addEventListener('click', () => {
  publicationSection.classList.toggle('expanded');
  updatePublicationToggle();
});
window.addEventListener('resize', updatePublicationToggle);
updatePublicationToggle();
